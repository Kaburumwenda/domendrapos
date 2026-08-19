from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Permission, RolePermission

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "role", "phone",
            "avatar", "is_active_employee", "employee_id", "hire_date",
            "termination_date", "default_branch_id",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "role", "phone",
            "employee_id", "hire_date", "default_branch_id", "password",
        ]

    def create(self, validated_data):
        from django.db import connection
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        # Auto-set target_schema for dev tenant routing (localhost → correct tenant)
        if not user.target_schema and connection.schema_name != "public":
            user.target_schema = connection.schema_name
        user.save()
        return user


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for self-service profile updates (personal details only)."""
    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone", "avatar"]


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for self-service password change."""
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)


def _compute_billing_status(tenant):
    """Compute billing lock status for a tenant. Returns a dict or None."""
    if tenant is None:
        return None
    try:
        from usage_billing.views import compute_billing_lock, _ensure_tenant_bills
        from usage_billing.models import BillingRate
        from django.utils import timezone
        rate = BillingRate.current()
        _ensure_tenant_bills(tenant, rate, timezone.localdate())
        lock = compute_billing_lock(tenant)
        lock["tenant_name"] = tenant.name
        lock["currency"] = rate.currency
        return lock
    except Exception:
        return None


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds user role, name, and tenant currency settings to the JWT response payload."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["name"] = user.get_full_name()
        token["email"] = user.email
        # Superadmins manage the entire platform and are NOT associated
        # with any tenant. Their JWT must carry an empty schema claim so
        # the tenancy middleware does not route them into a tenant context.
        if user.role == "super_admin":
            token["schema"] = ""
        else:
            token["schema"] = user.target_schema or ""
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data

        # Superadmins are not associated with any tenant — skip tenant
        # and billing resolution entirely so the frontend can route them
        # to the platform dashboard instead of a tenant dashboard.
        if self.user.role == "super_admin":
            return data

        # Include tenant currency settings so the frontend can format on login
        try:
            from tenants.models import Client, Domain
            from django.db import connection
            # Determine the tenant schema for this user
            schema = None
            # 1) Super-admin may have a target_schema explicitly set
            if self.user.target_schema:
                schema = self.user.target_schema
            # 2) Try to resolve from the request host (localhost maps to demo)
            if not schema:
                req = self.context.get("request")
                if req:
                    hostname = req.get_host().split(":")[0]
                    # Check Domain entries for this hostname
                    domain = Domain.objects.filter(domain=hostname).first()
                    if not domain:
                        # Try localhost variants for development
                        domain = Domain.objects.filter(
                            domain__in=["localhost", "demo.localhost"]
                        ).first()
                    if domain:
                        schema = domain.tenant.schema_name
            # 3) If the connection is already in a tenant context
            if not schema and connection.schema_name != "public":
                schema = connection.schema_name
            if schema:
                connection.set_schema_to_public()
                try:
                    tenant = Client.objects.get(schema_name=schema)
                    data["tenant"] = {
                        "name": tenant.name,
                        "currency_code": tenant.currency_code,
                        "currency_symbol": tenant.effective_currency_symbol,
                        "timezone": tenant.timezone,
                        "primary_color": tenant.primary_color,
                        "plan": tenant.plan,
                        "logo": tenant.logo.url if tenant.logo else None,
                    }
                    # Add billing status for the frontend gate
                    billing = _compute_billing_status(tenant)
                    if billing is not None:
                        data["billing"] = billing
                finally:
                    pass
        except Exception:
            # If tenant info can't be fetched (e.g., super-admin on public), skip
            pass
        return data


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = "__all__"


class RolePermissionSerializer(serializers.ModelSerializer):
    permission_detail = PermissionSerializer(source="permission", read_only=True)

    class Meta:
        model = RolePermission
        fields = ["id", "role", "permission", "permission_detail"]
