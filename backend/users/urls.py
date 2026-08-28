from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .views import UserViewSet, PermissionViewSet, RolePermissionViewSet
from .views_auth import (
    forgot_password,
    reset_password,
    setup_2fa,
    verify_2fa,
    two_factor_status,
    disable_2fa,
    verify_2fa_login,
)

router = DefaultRouter()
router.register(r"staff", UserViewSet, basename="user")
router.register(r"permissions", PermissionViewSet, basename="permission")
router.register(r"role-permissions", RolePermissionViewSet, basename="role-permission")


@api_view(["post"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Deactivate the user's active login record for the Security Control Center."""
    try:
        from security.models import ActiveLogin
        ActiveLogin.objects.filter(user_id=request.user.id, is_active=True).update(is_active=False)
    except Exception:
        pass
    return Response({"detail": "Logged out successfully."})


urlpatterns = router.urls + [
    path("logout/", logout_view, name="logout"),
    # Password reset
    path("forgot-password/", forgot_password, name="forgot_password"),
    path("reset-password/", reset_password, name="reset_password"),
    # 2FA / django-otp
    path("2fa/setup/", setup_2fa, name="setup_2fa"),
    path("2fa/verify/", verify_2fa, name="verify_2fa"),
    path("2fa/status/", two_factor_status, name="two_factor_status"),
    path("2fa/disable/", disable_2fa, name="disable_2fa"),
    path("2fa/verify-login/", verify_2fa_login, name="verify_2fa_login"),
]
