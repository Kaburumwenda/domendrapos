from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta

from .models import AuditLog
from .serializers import AuditLogSerializer
from users.views import IsManagerOrAbove


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only audit trail — logs can only be created by the middleware,
    never edited or deleted via the API (immutable security log)."""

    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsManagerOrAbove]
    filterset_fields = ["user_email", "action", "resource_type"]
    search_fields = ["description", "resource_id", "user_email"]
    ordering_fields = ["timestamp", "action", "resource_type"]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Aggregate stats for the audit dashboard cards."""
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        last_7d = now - timedelta(days=7)

        total = AuditLog.objects.count()
        recent_24h = AuditLog.objects.filter(timestamp__gte=last_24h).count()
        recent_7d = AuditLog.objects.filter(timestamp__gte=last_7d).count()

        by_action = list(
            AuditLog.objects.values("action").annotate(count=Count("id")).order_by("-count")
        )
        by_resource = list(
            AuditLog.objects.values("resource_type").annotate(count=Count("id")).order_by("-count")[:12]
        )
        by_user = list(
            AuditLog.objects.exclude(user_email="")
            .values("user_email").annotate(count=Count("id")).order_by("-count")[:12]
        )

        # Activity over last 7 days by day
        by_day = []
        for i in range(6, -1, -1):
            day_start = (now - timedelta(days=i)).date()
            day_end = day_start + timedelta(days=1)
            count = AuditLog.objects.filter(
                timestamp__date__gte=day_start, timestamp__date__lt=day_end
            ).count()
            by_day.append({"date": day_start.isoformat(), "count": count})

        return Response({
            "total": total,
            "recent_24h": recent_24h,
            "recent_7d": recent_7d,
            "by_action": by_action,
            "by_resource": by_resource,
            "by_user": by_user,
            "by_day": by_day,
        })

