from django.db import transaction
from django.db.models import Count, Q, Sum, F
from django.utils import timezone
from datetime import timedelta
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_tenants.utils import tenant_context, get_tenant
from django.contrib.auth import get_user_model

from .models import Client, Domain
from .serializers import (
    ClientSerializer,
    ClientWriteSerializer,
    DomainSerializer,
    TenantOnboardingSerializer,
    TenantSettingsSerializer,
)

User = get_user_model()


class IsSuperAdmin(permissions.BasePermission):
    """Public-schema super-admin only."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class ClientViewSet(viewsets.ModelViewSet):
    """
    Super-admin dashboard for managing all tenants.
    Lives on the public schema (not tenant-scoped).
    """

    queryset = Client.objects.all().order_by("-created_on")
    permission_classes = [IsSuperAdmin]

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return ClientWriteSerializer
        return ClientSerializer

    @action(detail=True, methods=["post"])
    def suspend(self, request, pk=None):
        tenant = self.get_object()
        reason = request.data.get("reason", "")
        tenant.status = "suspended"
        tenant.on_trial = False
        tenant.suspended_reason = reason
        tenant.suspended_at = timezone.now()
        tenant.save()
        return Response({"status": "suspended", "reason": tenant.suspended_reason})

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        tenant = self.get_object()
        tenant.status = "active"
        tenant.on_trial = False
        tenant.suspended_reason = ""
        tenant.suspended_at = None
        tenant.last_activated_at = timezone.now()
        tenant.save()
        return Response({"status": "active"})

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        tenant = self.get_object()
        tenant.status = "cancelled"
        tenant.on_trial = False
        tenant.suspended_reason = request.data.get("reason", "Cancelled by super-admin")
        tenant.suspended_at = timezone.now()
        tenant.save()
        return Response({"status": "cancelled"})

    @action(detail=True, methods=["post"])
    def change_plan(self, request, pk=None):
        tenant = self.get_object()
        new_plan = request.data.get("plan")
        if new_plan not in dict(Client.PLAN_CHOICES):
            return Response(
                {"detail": f"Invalid plan '{new_plan}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        old_plan = tenant.plan
        tenant.plan = new_plan
        # Auto-clear trial + suspended when moving to a paid plan
        if new_plan != "free" and tenant.status == "trial":
            tenant.status = "active"
            tenant.on_trial = False
        tenant.save()
        return Response({"id": tenant.id, "plan": tenant.plan, "previous_plan": old_plan})

    @action(detail=True, methods=["post"], url_path="set-limits")
    def set_limits(self, request, pk=None):
        tenant = self.get_object()
        for field in ("max_branches", "max_users", "max_products"):
            if field in request.data:
                try:
                    setattr(tenant, field, max(int(request.data[field]), 0))
                except (TypeError, ValueError):
                    return Response(
                        {"detail": f"{field} must be a positive integer."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
        tenant.save()
        return Response({
            "id": tenant.id,
            "max_branches": tenant.max_branches,
            "max_users": tenant.max_users,
            "max_products": tenant.max_products,
        })

    @action(detail=True, methods=["post"], url_path="extend-trial")
    def extend_trial(self, request, pk=None):
        tenant = self.get_object()
        try:
            days = int(request.data.get("days", 7))
        except (TypeError, ValueError):
            return Response({"detail": "days must be an integer."}, status=status.HTTP_400_BAD_REQUEST)
        if tenant.trial_ends_at:
            base = tenant.trial_ends_at
        elif tenant.created_on:
            base = timezone.now()
        else:
            base = timezone.now()
        tenant.trial_ends_at = base + timedelta(days=days)
        tenant.on_trial = True
        if tenant.status == "cancelled":
            tenant.status = "trial"
        tenant.save()
        return Response({"id": tenant.id, "trial_ends_at": tenant.trial_ends_at})

    @action(detail=True, methods=["post", "delete"], url_path="domains/add")
    def add_domain(self, request, pk=None):
        tenant = self.get_object()
        domain_value = request.data.get("domain", "").strip().lower()
        is_primary = bool(request.data.get("is_primary", False))
        if not domain_value:
            return Response({"detail": "domain is required."}, status=status.HTTP_400_BAD_REQUEST)
        if Domain.objects.filter(domain=domain_value).exists():
            return Response({"detail": "Domain already registered."}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            if is_primary:
                tenant.domains.update(is_primary=False)
            Domain.objects.create(tenant=tenant, domain=domain_value, is_primary=is_primary)
        return Response(DomainSerializer(tenant.domains.all(), many=True).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path=r"domains/(?P<domain_id>\d+)/remove")
    def remove_domain(self, request, pk=None, domain_id=None):
        tenant = self.get_object()
        qs = tenant.domains.filter(pk=domain_id)
        if not qs.exists():
            return Response({"detail": "Domain not found."}, status=status.HTTP_404_NOT_FOUND)
        if qs.first().is_primary and tenant.domains.count() == 1:
            return Response({"detail": "Cannot remove the only domain."}, status=status.HTTP_400_BAD_REQUEST)
        qs.delete()
        # Promote another domain to primary if needed
        if not tenant.domains.filter(is_primary=True).exists() and tenant.domains.exists():
            first = tenant.domains.first()
            first.is_primary = True
            first.save()
        return Response(DomainSerializer(tenant.domains.all(), many=True).data)

    @action(detail=True, methods=["get"], url_path="activity")
    def activity(self, request, pk=None):
        """Recent user activity inside this tenant (reads audit log in tenant schema)."""
        tenant = self.get_object()
        limit = min(int(request.query_params.get("limit", 50)), 100)
        try:
            with tenant_context(tenant):
                from audit.models import AuditLog

                logs = AuditLog.objects.order_by("-timestamp")[:limit]
                data = [
                    {
                        "id": log.id,
                        "user_email": log.user_email,
                        "action": log.action,
                        "resource_type": log.resource_type,
                        "resource_id": log.resource_id,
                        "description": log.description,
                        "timestamp": log.timestamp,
                    }
                    for log in logs
                ]
        except Exception as e:
            return Response({"detail": f"Could not read audit log: {e}"}, status=status.HTTP_200_OK)
        return Response({"results": data})

    @action(detail=True, methods=["get", "post"], url_path="users")
    def users(self, request, pk=None):
        """List all users in a tenant (GET) or create a new user (POST).

        POST body:
          { "email", "first_name", "last_name", "role", "phone",
            "password", "employee_id" }
        """
        tenant = self.get_object()
        try:
            with tenant_context(tenant):
                from users.models import User as TenantUser

                if request.method == "GET":
                    users = TenantUser.objects.filter(is_superuser=False).order_by("-date_joined")
                    data = [
                        {
                            "id": u.id,
                            "email": u.email,
                            "first_name": u.first_name,
                            "last_name": u.last_name,
                            "full_name": u.get_full_name() or u.email,
                            "role": u.role,
                            "phone": u.phone,
                            "is_active": u.is_active,
                            "is_active_employee": u.is_active_employee,
                            "employee_id": u.employee_id,
                            "hire_date": u.hire_date,
                            "termination_date": u.termination_date,
                            "default_branch_id": u.default_branch_id,
                            "date_joined": u.date_joined,
                            "target_schema": u.target_schema,
                        }
                        for u in users
                    ]
                    return Response({"results": data, "count": len(data)})

                # POST — create a new user in this tenant schema
                email = (request.data.get("email") or "").strip().lower()
                password = request.data.get("password", "")
                if not email:
                    return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
                if not password or len(password) < 8:
                    return Response({"detail": "Password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)
                if TenantUser.objects.filter(email=email).exists():
                    return Response({"detail": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

                user = TenantUser(
                    email=email,
                    first_name=request.data.get("first_name", ""),
                    last_name=request.data.get("last_name", ""),
                    role=request.data.get("role", "viewer"),
                    phone=request.data.get("phone", ""),
                    employee_id=request.data.get("employee_id", ""),
                    target_schema=tenant.schema_name,
                )
                user.set_password(password)
                user.save()
                return Response({
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                    "phone": user.phone,
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path=r"users/(?P<user_id>\d+)/reset-password")
    def reset_user_password(self, request, pk=None, user_id=None):
        """Super-admin resets a user's password inside a tenant."""
        new_password = request.data.get("new_password", "")
        if not new_password or len(new_password) < 8:
            return Response(
                {"detail": "Password must be at least 8 characters long."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        tenant = self.get_object()
        try:
            with tenant_context(tenant):
                from users.models import User as TenantUser

                user = TenantUser.objects.get(pk=user_id, is_superuser=False)
                user.set_password(new_password)
                user.save()
                return Response({"status": "password reset", "user_id": user.id})
        except TenantUser.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path=r"users/(?P<user_id>\d+)/toggle-active")
    def toggle_user_active(self, request, pk=None, user_id=None):
        """Activate or deactivate a user inside a tenant."""
        tenant = self.get_object()
        try:
            with tenant_context(tenant):
                from users.models import User as TenantUser

                user = TenantUser.objects.get(pk=user_id, is_superuser=False)
                user.is_active = not user.is_active
                user.is_active_employee = user.is_active
                if not user.is_active and not user.termination_date:
                    user.termination_date = timezone.now().date()
                user.save(update_fields=["is_active", "is_active_employee", "termination_date"])
                return Response({
                    "id": user.id,
                    "is_active": user.is_active,
                    "is_active_employee": user.is_active_employee,
                })
        except TenantUser.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["patch"], url_path=r"users/(?P<user_id>\d+)/update")
    def update_user(self, request, pk=None, user_id=None):
        """Update a user's profile (role, name, phone, employee_id) inside a tenant."""
        tenant = self.get_object()
        try:
            with tenant_context(tenant):
                from users.models import User as TenantUser

                user = TenantUser.objects.get(pk=user_id, is_superuser=False)
                for field in ("first_name", "last_name", "role", "phone", "employee_id"):
                    if field in request.data:
                        setattr(user, field, request.data[field])
                user.save()
                return Response({
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                    "phone": user.phone,
                    "employee_id": user.employee_id,
                })
        except TenantUser.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"], url_path="usage")
    def usage(self, request, pk=None):
        """Usage metrics summary for a tenant (from billing.UsageMetric)."""
        tenant = self.get_object()
        try:
            from billing.models import UsageMetric

            qs = UsageMetric.objects.filter(tenant=tenant).order_by("-period_start")
            data = [
                {
                    "id": m.id,
                    "metric_type": m.metric_type,
                    "count": m.count,
                    "period_start": m.period_start,
                    "period_end": m.period_end,
                }
                for m in qs[:50]
            ]
            total_requests = sum(m.count for m in qs)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_200_OK)
        return Response({"results": data, "total_requests": total_requests})

    @action(detail=True, methods=["get"], url_path="billing")
    def billing(self, request, pk=None):
        """Invoices + payment records for a tenant."""
        tenant = self.get_object()
        try:
            from billing.models import Invoice, PaymentRecord

            invoices = (
                Invoice.objects.filter(tenant=tenant)
                .order_by("-issue_date")
                .values(
                    "id", "invoice_number", "amount", "tax_amount", "total", "status", "issue_date", "due_date", "paid_date"
                )[:50]
            )
            invoice_ids = [i["id"] for i in invoices]
            payments = (
                PaymentRecord.objects.filter(invoice_id__in=invoice_ids)
                .values("id", "invoice_id", "amount", "method", "reference", "paid_at")
            )
            paid_total = sum(p["amount"] for p in payments if p["amount"])
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_200_OK)
        return Response({
            "invoices": list(invoices),
            "payments": list(payments),
            "paid_total": paid_total,
        })

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Platform-level statistics for the super-admin dashboard."""
        total = Client.objects.count()
        by_status = dict(
            Client.objects.values("status").annotate(c=Count("id")).values_list("status", "c")
        )
        by_plan = dict(
            Client.objects.values("plan").annotate(c=Count("id")).values_list("plan", "c")
        )
        recent = Client.objects.order_by("-created_on")[:10]

        # Trial expiring within 3 days
        trial_expiring_threshold = timezone.now() + timedelta(days=3)
        trial_expiring = Client.objects.filter(
            on_trial=True,
            trial_ends_at__isnull=False,
            trial_ends_at__lte=trial_expiring_threshold,
        ).count()

        # Estimated MRR — sum PLAN_MRR across non-cancelled/free-disabled tenants
        plan_prices = ClientSerializer.PLAN_MRR
        mrr = 0
        for plan, price in plan_prices.items():
            qty = Client.objects.filter(plan=plan).exclude(status="cancelled").count()
            mrr += qty * price

        # New tenants this month
        month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_this_month = Client.objects.filter(created_on__gte=month_start).count()

        return Response(
            {
                "total_tenants": total,
                "active": by_status.get("active", 0),
                "trial": by_status.get("trial", 0),
                "suspended": by_status.get("suspended", 0),
                "cancelled": by_status.get("cancelled", 0),
                "trial_expiring": trial_expiring,
                "mrr_estimate": mrr,
                "new_this_month": new_this_month,
                "by_plan": {
                    "free": by_plan.get("free", 0),
                    "starter": by_plan.get("starter", 0),
                    "business": by_plan.get("business", 0),
                    "enterprise": by_plan.get("enterprise", 0),
                },
                "recent_tenants": ClientSerializer(recent, many=True).data,
            }
        )


class TenantOnboardingView(viewsets.ViewSet):
    """
    POST /api/tenants/onboard/ — public endpoint for new tenant signup.
    Creates schema + domain + first admin user atomically.
    """

    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=["post"], url_path="onboard")
    def onboard(self, request):
        serializer = TenantOnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            tenant = Client.objects.create(
                name=data["business_name"],
                contact_email=data["contact_email"],
                contact_phone=data.get("contact_phone", ""),
                plan=data["plan"],
                status="trial",
                on_trial=True,
                country=data["country"],
                currency_code=data["currency_code"],
                currency_symbol=data.get("currency_symbol", Client.CURRENCY_SYMBOLS.get(data["currency_code"], "$")),
                created_by_email=data["contact_email"],
            )

            Domain.objects.create(
                domain=data["domain"],
                tenant=tenant,
                is_primary=True,
            )

            with tenant_context(tenant):
                User.objects.create_user(
                    email=data["contact_email"],
                    password=data["admin_password"],
                    first_name=data["admin_first_name"],
                    last_name=data["admin_last_name"],
                    role="tenant_admin",
                    is_staff=True,
                    # Set target_schema so login resolves to THIS tenant, not demo
                    target_schema=tenant.schema_name,
                )

                # Auto-create the default HQ branch for the new tenant
                from branches.models import Branch
                Branch.objects.create(
                    name=data["business_name"],
                    code="HQ",
                    is_headquarters=True,
                    is_active=True,
                    email=data["contact_email"],
                    phone=data.get("contact_phone", ""),
                    country=data.get("country", ""),
                    currency_code=tenant.currency_code,
                    timezone=tenant.timezone,
                )

        # Send welcome email to the new tenant admin
        try:
            from django.conf import settings as dj_settings
            from django.core.mail import send_mail
            from django.template.loader import render_to_string

            login_url = f"{dj_settings.FRONTEND_URL.rstrip('/')}/login"
            context = {
                "first_name": data["admin_first_name"],
                "business_name": data["business_name"],
                "domain": data["domain"],
                "email": data["contact_email"],
                "login_url": login_url,
                "app_name": dj_settings.APP_NAME,
            }
            html_body = render_to_string("emails/welcome_email.html", context)
            text_body = (
                f"Welcome to {dj_settings.APP_NAME}, {context['first_name']}!\n\n"
                f"Your workspace '{data['business_name']}' has been created.\n"
                f"Login at: {login_url}\n"
                f"Email: {data['contact_email']}\n"
                f"Domain: {data['domain']}\n"
            )
            send_mail(
                subject=f"Welcome to {dj_settings.APP_NAME}!",
                message=text_body,
                from_email=dj_settings.DEFAULT_FROM_EMAIL,
                recipient_list=[data["contact_email"]],
                html_message=html_body,
                fail_silently=True,
            )
        except Exception:
            pass

        return Response(
            {
                "message": "Tenant onboarded successfully",
                "tenant_id": tenant.id,
                "schema": tenant.schema_name,
                "domain": data["domain"],
            },
            status=status.HTTP_201_CREATED,
        )


class TenantSettingsView(viewsets.ViewSet):
    """
    Tenant-scoped endpoints for the current tenant to manage their own settings.
    - GET   /api/tenants/me/         — retrieve current tenant profile + currency
    - PATCH /api/tenants/settings/   — update currency, branding, contact info

    These endpoints run WITHIN the tenant schema (not public), so request.tenant
    is the Client row. The tenant model lives on the public schema, so we switch
    to public to read/update it, then switch back.
    """

    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        from django.db import connection
        # request.tenant is set by django-tenants middleware for tenant-scoped requests
        tenant = getattr(request, "tenant", None)
        if tenant is None or connection.schema_name == "public":
            return Response(
                {"detail": "No tenant context available for this request."},
                status=status.HTTP_404_NOT_FOUND,
            )
        # request.tenant IS the Client instance — read from public schema
        schema = tenant.schema_name
        connection.set_schema_to_public()
        try:
            client = Client.objects.get(schema_name=schema)
            serializer = TenantSettingsSerializer(client)
            return Response(serializer.data)
        finally:
            connection.set_tenant(tenant)

    @action(detail=False, methods=["patch"], url_path="update")
    def update_settings(self, request):
        from django.db import connection
        tenant = getattr(request, "tenant", None)
        if tenant is None or connection.schema_name == "public":
            return Response(
                {"detail": "No tenant context available for this request."},
                status=status.HTTP_404_NOT_FOUND,
            )
        schema = tenant.schema_name
        connection.set_schema_to_public()
        try:
            client = Client.objects.get(schema_name=schema)
            serializer = TenantSettingsSerializer(client, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        finally:
            connection.set_tenant(tenant)

