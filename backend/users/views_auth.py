"""
Password reset, 2FA (django-otp), and welcome email views for DomendraPOS.

All endpoints here run on the PUBLIC schema (the tenancy middleware switches
to the resolved tenant when needed, mirroring the login flow).
"""
import secrets
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.db import connection
from django.template.loader import render_to_string
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from users.models import User

# How long password-reset tokens stay valid (in hours).
PASSWORD_RESET_EXPIRY_HOURS = 24

# Minimum length for stored reset tokens.
TOKEN_LENGTH = 48


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _resolve_tenant_schema(request):
    """Return (schema_name, tenant) or (None, None)."""
    from tenants.models import Domain
    hostname = request.get_host().split(":")[0]
    domain = Domain.objects.filter(domain=hostname).first()
    if not domain and hostname in ("localhost", "127.0.0.1", "0.0.0.0", "10.0.2.2"):
        domain = Domain.objects.filter(
            domain__in=["demo.localhost", "localhost"]
        ).first()
    if domain:
        return domain.tenant.schema_name, domain.tenant
    return None, None


# ---------------------------------------------------------------------------
# 1)  Forgot Password — Request reset link
# ---------------------------------------------------------------------------

@api_view(["post"])
@permission_classes([AllowAny])
def forgot_password(request):
    """Send a password-reset link to the given email address."""
    email = request.data.get("email", "").strip().lower()
    if not email:
        return Response(
            {"detail": "Email is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Resolve tenant from request host (same as login flow)
    original_schema = connection.schema_name
    schema, tenant = _resolve_tenant_schema(request)
    user = None

    if schema:
        try:
            connection.set_tenant(tenant)
            user = User.objects.filter(email__iexact=email).first()
        finally:
            connection.set_schema_to_public()
    else:
        # Public-scope users (super_admins)
        user = User.objects.filter(email__iexact=email).first()

    if not user:
        # For security: always return success, even if the email doesn't exist
        return Response(
            {"detail": "If an account exists for that email, a reset link has been sent."},
            status=status.HTTP_200_OK,
        )

    # Generate a secure token and store it on the user
    token = secrets.token_urlsafe(TOKEN_LENGTH)
    user.password_reset_token = token
    user.password_reset_created_at = timezone.now()
    user.save(update_fields=["password_reset_token", "password_reset_created_at"])

    # Build reset URL pointing to the frontend
    frontend_url = settings.FRONTEND_URL.rstrip("/")
    reset_url = f"{frontend_url}/reset-password?token={token}"

    # Render email
    context = {
        "first_name": user.first_name or user.email,
        "reset_url": reset_url,
        "expiry_hours": PASSWORD_RESET_EXPIRY_HOURS,
        "app_name": settings.APP_NAME,
    }
    html_body = render_to_string("emails/password_reset.html", context)
    text_body = (
        f"Hi {context['first_name']},\n\n"
        f"Reset your {settings.APP_NAME} password by visiting:\n{reset_url}\n\n"
        f"This link expires in {PASSWORD_RESET_EXPIRY_HOURS} hours.\n"
    )

    send_mail(
        subject=f"Reset Your Password - {settings.APP_NAME}",
        message=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        html_message=html_body,
        fail_silently=True,
    )

    return Response(
        {"detail": "If an account exists for that email, a reset link has been sent."},
        status=status.HTTP_200_OK,
    )


# ---------------------------------------------------------------------------
# 2)  Confirm reset token + Set new password
# ---------------------------------------------------------------------------

@api_view(["post"])
@permission_classes([AllowAny])
def reset_password(request):
    """Validate the token and set a new password."""
    token = request.data.get("token", "").strip()
    new_password = request.data.get("password", "")

    if not token or not new_password:
        return Response(
            {"detail": "Token and new password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if len(new_password) < 8:
        return Response(
            {"detail": "Password must be at least 8 characters long."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Try to find the user across all tenant schemas
    user = _find_user_by_token(token)
    if not user:
        return Response(
            {"detail": "Invalid or expired reset token."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check expiry
    max_age = timezone.now() - timedelta(hours=PASSWORD_RESET_EXPIRY_HOURS)
    if user.password_reset_created_at < max_age:
        return Response(
            {"detail": "This reset link has expired. Please request a new one."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Set the new password and clear the token
    user.set_password(new_password)
    user.password_reset_token = ""
    user.password_reset_created_at = None
    user.save(update_fields=["password", "password_reset_token", "password_reset_created_at"])

    return Response(
        {"detail": "Your password has been reset successfully. You can now log in."},
        status=status.HTTP_200_OK,
    )


def _find_user_by_token(token):
    """Search the public schema first, then all tenant schemas."""
    # Public / super-admin
    user = User.objects.filter(password_reset_token=token).first()
    if user:
        return user

    # Tenant schemas
    from tenants.models import Client
    from django_tenants.utils import tenant_context
    for tenant in Client.objects.exclude(schema_name="public"):
        with tenant_context(tenant):
            user = User.objects.filter(password_reset_token=token).first()
            if user:
                return user
    return None


# ---------------------------------------------------------------------------
# 3)  django-otp / 2FA Endpoints
# ---------------------------------------------------------------------------

@api_view(["post"])
@permission_classes([IsAuthenticated])
def setup_2fa(request):
    """Generate a TOTP device + QR code provisioning URI for the logged-in user."""
    from django_otp.plugins.otp_totp.models import TOTPDevice
    from django_otp.util import random_hex

    user = request.user

    # Remove any existing unconfirmed TOTP devices for this user
    TOTPDevice.objects.filter(user=user, confirmed=False).delete()

    device = TOTPDevice.objects.create(
        user=user,
        name=f"{settings.APP_NAME} - {user.email}",
        confirmed=False,
        key=random_hex(),
    )

    return Response(
        {
            "otpauth_url": device.config_url,
            "secret": device.key,
            "issuer": settings.OTP_TOTP_ISSUER,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["post"])
@permission_classes([IsAuthenticated])
def verify_2fa(request):
    """Verify a TOTP token to confirm the device."""
    from django_otp.plugins.otp_totp.models import TOTPDevice

    token = request.data.get("token", "").strip()
    if not token:
        return Response(
            {"detail": "A 6-digit verification code is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    device = TOTPDevice.objects.filter(user=request.user, confirmed=False).first()
    if not device:
        return Response(
            {"detail": "No pending 2FA setup found. Please start the setup first."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if device.verify_token(token):
        device.confirmed = True
        device.save(update_fields=["confirmed"])

        # Generate backup (static) tokens
        from django_otp.plugins.otp_static.models import StaticDevice, StaticToken
        static_device, _ = StaticDevice.objects.get_or_create(user=request.user)
        backup_codes = []
        # Remove old static tokens, generate fresh set
        static_device.token_set.all().delete()
        for _ in range(getattr(settings, "OTP_STATIC_TOKENS", 10)):
            backup_codes.append(StaticToken.random_token())
        StaticToken.objects.bulk_create(
            [StaticToken(device=static_device, token=t) for t in backup_codes]
        )

        return Response(
            {
                "detail": "Two-factor authentication enabled successfully.",
                "backup_codes": backup_codes,
            },
            status=status.HTTP_200_OK,
        )

    return Response(
        {"detail": "Invalid verification code. Please try again."},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["get"])
@permission_classes([IsAuthenticated])
def two_factor_status(request):
    """Check if the logged-in user has 2FA enabled."""
    from django_otp.plugins.otp_totp.models import TOTPDevice

    enabled = TOTPDevice.objects.filter(user=request.user, confirmed=True).exists()
    return Response({"enabled": enabled}, status=status.HTTP_200_OK)


@api_view(["post"])
@permission_classes([IsAuthenticated])
def disable_2fa(request):
    """Disable 2FA for the logged-in user (removes TOTP and static devices)."""
    from django_otp.plugins.otp_totp.models import TOTPDevice
    from django_otp.plugins.otp_static.models import StaticDevice

    TOTPDevice.objects.filter(user=request.user).delete()
    StaticDevice.objects.filter(user=request.user).delete()

    return Response(
        {"detail": "Two-factor authentication disabled."},
        status=status.HTTP_200_OK,
    )


# ---------------------------------------------------------------------------
# 4)  Verify 2FA token during login
# ---------------------------------------------------------------------------

@api_view(["post"])
@permission_classes([AllowAny])
def verify_2fa_login(request):
    """Verify a 2FA token after initial login credentials have been validated.

    The frontend calls this endpoint with a temporary access token and the
    6-digit code. On success, the user's session is fully authenticated.
    """
    from rest_framework_simplejwt.tokens import AccessToken
    from django_otp.plugins.otp_totp.models import TOTPDevice

    temp_token = request.data.get("access", "")
    token = request.data.get("token", "").strip()

    if not temp_token or not token:
        return Response(
            {"detail": "Access token and verification code are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        decoded = AccessToken(temp_token)
        user_id = decoded["user_id"]
    except Exception:
        return Response(
            {"detail": "Invalid or expired access token."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Resolve tenant and find the user (same as login)
    original_schema = connection.schema_name
    schema, tenant = _resolve_tenant_schema(request)
    user = None

    if schema:
        try:
            connection.set_tenant(tenant)
            user = User.objects.filter(id=user_id).first()
        finally:
            connection.set_schema_to_public()
    else:
        user = User.objects.filter(id=user_id).first()

    if not user:
        return Response(
            {"detail": "User not found."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check TOTP or static device
    device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
    if device and device.verify_token(token):
        return _issue_2fa_verified_token(user)

    # Check static (backup) tokens
    from django_otp.plugins.otp_static.models import StaticDevice, StaticToken
    static_device = StaticDevice.objects.filter(user=user).first()
    if static_device:
        match = static_device.token_set.filter(token=token).first()
        if match:
            match.delete()  # single use
            return _issue_2fa_verified_token(user)

    return Response(
        {"detail": "Invalid verification code."},
        status=status.HTTP_400_BAD_REQUEST,
    )


def _issue_2fa_verified_token(user):
    """Issue a fresh JWT pair with the 2fa_verified claim set to True."""
    from rest_framework_simplejwt.tokens import RefreshToken
    from users.serializers import UserSerializer

    token = RefreshToken.for_user(user)
    token["role"] = user.role
    token["name"] = user.get_full_name()
    token["email"] = user.email
    token["2fa_verified"] = True
    if user.role == "super_admin":
        token["schema"] = ""
    else:
        token["schema"] = user.target_schema or ""

    return Response(
        {
            "detail": "2FA verification successful.",
            "verified": True,
            "access": str(token.access_token),
            "refresh": str(token),
            "user": UserSerializer(user).data,
        },
        status=status.HTTP_200_OK,
    )
