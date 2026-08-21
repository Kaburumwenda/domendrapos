"""
Security Control Center — Django Axes management API.

Provides endpoints for admins to:
  - View/adjust axes settings (failure limit, cool-off time)
  - List locked-out access attempts
  - List login failure logs
  - List active user sessions
  - Unlock specific users/IPs
  - Reset all locks
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from axes.models import AccessAttempt, AccessFailureLog
from security.models import ActiveLogin
from users.views import IsManagerOrAbove

User = get_user_model()


class AxesControlViewSet(viewsets.ViewSet):
    """ViewSet for the Security Control Center."""

    permission_classes = [IsManagerOrAbove]

    # ── Overview / Dashboard ──────────────────────────────────────
    @action(detail=False, methods=["get"])
    def overview(self, request):
        """Dashboard summary: locked count, total attempts, failed logins, active sessions."""
        now = timezone.now()
        threshold = getattr(settings, "AXES_FAILURE_LIMIT", 5)

        # Locked attempts (failures >= threshold)
        locked_attempts = AccessAttempt.objects.filter(
            failures_since_start__gte=threshold
        )
        locked_count = locked_attempts.count()
        total_attempts = AccessAttempt.objects.count()
        total_failures = AccessFailureLog.objects.count()

        # Active sessions — count and clean up expired
        active_sessions = ActiveLogin.objects.filter(is_active=True).count()
        expired = ActiveLogin.objects.filter(is_active=True, expires_at__lt=now)
        if expired.exists():
            expired.update(is_active=False)
            active_sessions = ActiveLogin.objects.filter(is_active=True).count()

        # Recent failures (last 24h)
        last_24h = now - timedelta(hours=24)
        recent_failures = AccessFailureLog.objects.filter(attempt_time__gte=last_24h).count()

        # Unique IPs in attempts
        unique_ips = AccessAttempt.objects.values("ip_address").distinct().count()

        # Unique usernames targeted
        unique_users = (
            AccessAttempt.objects.exclude(username="")
            .values("username")
            .distinct()
            .count()
        )

        return Response(
            {
                "locked_count": locked_count,
                "total_attempts": total_attempts,
                "total_failure_logs": total_failures,
                "active_sessions": active_sessions,
                "recent_failures_24h": recent_failures,
                "unique_ips": unique_ips,
                "unique_targeted_users": unique_users,
                "settings": {
                    "failure_limit": getattr(settings, "AXES_FAILURE_LIMIT", 5),
                    "cooloff_time_hours": getattr(settings, "AXES_COOLOFF_TIME", 1),
                    "reset_on_success": getattr(settings, "AXES_RESET_ON_SUCCESS", True),
                },
            }
        )

    # ── Locked-out attempts ───────────────────────────────────────
    @action(detail=False, methods=["get"])
    def locked(self, request):
        """List all currently locked-out access attempts."""
        threshold = getattr(settings, "AXES_FAILURE_LIMIT", 5)
        qs = AccessAttempt.objects.filter(failures_since_start__gte=threshold).order_by(
            "-attempt_time"
        )
        rows = []
        for a in qs:
            rows.append(
                {
                    "id": a.id,
                    "username": a.username or "—",
                    "ip_address": a.ip_address or "—",
                    "failures_since_start": a.failures_since_start,
                    "attempt_time": a.attempt_time.isoformat() if a.attempt_time else None,
                    "user_agent": (a.user_agent or "")[:120],
                    "path_info": a.path_info or "",
                    "locked": True,
                }
            )
        return Response(rows)

    # ── All access attempts ────────────────────────────────────────
    @action(detail=False, methods=["get"])
    def attempts(self, request):
        """List all access attempts with pagination."""
        qs = AccessAttempt.objects.all().order_by("-attempt_time")
        # Simple pagination
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 50))
        start = (page - 1) * page_size
        end = start + page_size
        total = qs.count()
        rows = []
        for a in qs[start:end]:
            threshold = getattr(settings, "AXES_FAILURE_LIMIT", 5)
            rows.append(
                {
                    "id": a.id,
                    "username": a.username or "—",
                    "ip_address": a.ip_address or "—",
                    "failures_since_start": a.failures_since_start,
                    "attempt_time": a.attempt_time.isoformat() if a.attempt_time else None,
                    "user_agent": (a.user_agent or "")[:120],
                    "path_info": a.path_info or "",
                    "locked": a.failures_since_start >= threshold,
                }
            )
        return Response({"results": rows, "count": total, "page": page, "page_size": page_size})

    # ── Failure logs ───────────────────────────────────────────────
    @action(detail=False, methods=["get"])
    def failure_logs(self, request):
        """List login failure logs (each individual failed attempt)."""
        qs = AccessFailureLog.objects.all().order_by("-attempt_time")
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 50))
        start = (page - 1) * page_size
        end = start + page_size
        total = qs.count()
        rows = []
        for f in qs[start:end]:
            rows.append(
                {
                    "id": f.id,
                    "username": f.username or "—",
                    "ip_address": f.ip_address or "—",
                    "attempt_time": f.attempt_time.isoformat() if f.attempt_time else None,
                    "locked_out": f.locked_out,
                    "user_agent": (f.user_agent or "")[:120],
                    "path_info": f.path_info or "",
                }
            )
        return Response({"results": rows, "count": total, "page": page, "page_size": page_size})

    # ── Active sessions ────────────────────────────────────────────
    @action(detail=False, methods=["get"])
    def sessions(self, request):
        """List all active JWT-based sessions with user info and expiry."""
        now = timezone.now()

        # Mark expired logins as inactive
        ActiveLogin.objects.filter(is_active=True, expires_at__lt=now).update(is_active=False)

        logins = ActiveLogin.objects.filter(is_active=True).order_by("-last_activity")
        rows = []
        for login in logins:
            rows.append(
                {
                    "session_key": login.jti,
                    "user_id": login.user_id,
                    "user_email": login.user_email,
                    "user_name": login.user_name,
                    "user_role": login.user_role,
                    "branch": login.branch,
                    "ip_address": str(login.ip_address) if login.ip_address else "",
                    "user_agent": login.user_agent[:120],
                    "login_time": login.login_time.isoformat() if login.login_time else None,
                    "last_activity": login.last_activity.isoformat() if login.last_activity else None,
                    "session_expires": login.expires_at.isoformat() if login.expires_at else None,
                    "is_active": login.is_active,
                }
            )
        return Response(rows)

    # ── Unlock a specific attempt by ID ────────────────────────────
    @action(detail=True, methods=["post"])
    def unlock(self, request, pk=None):
        """Delete a specific access attempt, unlocking the user/IP."""
        try:
            attempt = AccessAttempt.objects.get(id=pk)
        except AccessAttempt.DoesNotExist:
            return Response(
                {"detail": "Access attempt not found."}, status=status.HTTP_404_NOT_FOUND
            )
        username = attempt.username
        ip = attempt.ip_address
        attempt.delete()
        return Response(
            {
                "detail": f"Unlocked {username or 'user'} from IP {ip}.",
                "unlocked_username": username,
                "unlocked_ip": ip,
            }
        )

    # ── Unlock by username ────────────────────────────────────────
    @action(detail=False, methods=["post"])
    def unlock_user(self, request):
        """Unlock all access attempts for a given username/email."""
        username = request.data.get("username", "").strip()
        if not username:
            return Response(
                {"detail": "username is required."}, status=status.HTTP_400_BAD_REQUEST
            )
        qs = AccessAttempt.objects.filter(username=username)
        count = qs.count()
        if count == 0:
            return Response(
                {"detail": f"No locked attempts found for '{username}'."},
            )
        qs.delete()
        return Response(
            {"detail": f"Unlocked {count} attempt(s) for '{username}'.", "unlocked_count": count}
        )

    # ── Unlock by IP ──────────────────────────────────────────────
    @action(detail=False, methods=["post"])
    def unlock_ip(self, request):
        """Unlock all access attempts for a given IP address."""
        ip = request.data.get("ip_address", "").strip()
        if not ip:
            return Response(
                {"detail": "ip_address is required."}, status=status.HTTP_400_BAD_REQUEST
            )
        qs = AccessAttempt.objects.filter(ip_address=ip)
        count = qs.count()
        if count == 0:
            return Response(
                {"detail": f"No locked attempts found for IP '{ip}'."},
            )
        qs.delete()
        return Response(
            {"detail": f"Unlocked {count} attempt(s) for IP '{ip}'.", "unlocked_count": count}
        )

    # ── Reset all locks ────────────────────────────────────────────
    @action(detail=False, methods=["post"])
    def reset_all(self, request):
        """Delete all access attempts (full reset)."""
        count = AccessAttempt.objects.count()
        AccessAttempt.objects.all().delete()
        return Response(
            {"detail": f"Reset complete. {count} access attempt(s) cleared.", "cleared": count}
        )

    # ── Settings — view & update ──────────────────────────────────
    @action(detail=False, methods=["get"], url_path="config")
    def get_config(self, request):
        """Get current axes settings."""
        return Response(
            {
                "failure_limit": getattr(settings, "AXES_FAILURE_LIMIT", 5),
                "cooloff_time_hours": getattr(settings, "AXES_COOLOFF_TIME", 1),
                "reset_on_success": getattr(settings, "AXES_RESET_ON_SUCCESS", True),
            }
        )

    @action(detail=False, methods=["patch", "put"], url_path="update-config")
    def update_config(self, request):
        """Update axes settings at runtime (in-memory only, not persisted to settings.py)."""
        failure_limit = request.data.get("failure_limit")
        cooloff = request.data.get("cooloff_time_hours")
        reset_on_success = request.data.get("reset_on_success")

        changed = []
        if failure_limit is not None:
            try:
                val = int(failure_limit)
                if val < 1:
                    return Response(
                        {"detail": "failure_limit must be at least 1."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                settings.AXES_FAILURE_LIMIT = val
                changed.append(f"failure_limit={val}")
            except (ValueError, TypeError):
                return Response(
                    {"detail": "failure_limit must be an integer."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if cooloff is not None:
            try:
                val = float(cooloff)
                if val < 0:
                    return Response(
                        {"detail": "cooloff_time_hours must be >= 0."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                settings.AXES_COOLOFF_TIME = val
                changed.append(f"cooloff_time_hours={val}")
            except (ValueError, TypeError):
                return Response(
                    {"detail": "cooloff_time_hours must be a number."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if reset_on_success is not None:
            settings.AXES_RESET_ON_SUCCESS = bool(reset_on_success)
            changed.append(f"reset_on_success={bool(reset_on_success)}")

        return Response(
            {
                "detail": f"Updated: {', '.join(changed)}" if changed else "No changes.",
                "settings": {
                    "failure_limit": getattr(settings, "AXES_FAILURE_LIMIT", 5),
                    "cooloff_time_hours": getattr(settings, "AXES_COOLOFF_TIME", 1),
                    "reset_on_success": getattr(settings, "AXES_RESET_ON_SUCCESS", True),
                },
            }
        )

    # ── Logged-in users (from ActiveLogin) ─────────────────────
    @action(detail=False, methods=["get"])
    def logged_users(self, request):
        """Return users with active JWT logins."""
        now = timezone.now()

        # Mark expired logins as inactive
        ActiveLogin.objects.filter(is_active=True, expires_at__lt=now).update(is_active=False)

        logins = ActiveLogin.objects.filter(is_active=True).order_by("-last_activity")
        user_map = {}
        for login in logins:
            if login.user_id in user_map:
                continue
            user_map[login.user_id] = {
                "user_id": login.user_id,
                "email": login.user_email,
                "name": login.user_name or login.user_email,
                "role": login.user_role,
                "branch": login.branch or "—",
                "last_login": login.login_time.isoformat() if login.login_time else None,
                "session_expires": login.expires_at.isoformat() if login.expires_at else None,
                "is_active": True,
                "ip_address": str(login.ip_address) if login.ip_address else "",
                "user_agent": login.user_agent[:120],
            }
        return Response(list(user_map.values()))
