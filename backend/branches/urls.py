from rest_framework.routers import DefaultRouter
from .views import BranchViewSet, RegisterViewSet

router = DefaultRouter()
router.register(r"", BranchViewSet, basename="branch")
router.register(r"registers", RegisterViewSet, basename="register")

urlpatterns = router.urls
