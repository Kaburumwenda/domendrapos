from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet, SupplierProductViewSet

router = DefaultRouter()
router.register(r"", SupplierViewSet, basename="supplier")
router.register(r"products", SupplierProductViewSet, basename="supplierproduct")

urlpatterns = router.urls
