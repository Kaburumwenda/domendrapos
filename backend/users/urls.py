from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .views import UserViewSet, PermissionViewSet, RolePermissionViewSet

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
]
