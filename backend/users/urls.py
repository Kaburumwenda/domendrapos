from rest_framework.routers import DefaultRouter
from .views import UserViewSet, PermissionViewSet, RolePermissionViewSet

router = DefaultRouter()
router.register(r"staff", UserViewSet, basename="user")
router.register(r"permissions", PermissionViewSet, basename="permission")
router.register(r"role-permissions", RolePermissionViewSet, basename="role-permission")

urlpatterns = router.urls
