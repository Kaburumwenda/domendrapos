from rest_framework.routers import DefaultRouter
from .views import (
    StockItemViewSet,
    StockMovementViewSet,
    StockTransferViewSet,
    StockCountViewSet,
    StockAdjustmentViewSet,
)

router = DefaultRouter()
router.register(r"items", StockItemViewSet, basename="stockitem")
router.register(r"movements", StockMovementViewSet, basename="stockmovement")
router.register(r"transfers", StockTransferViewSet, basename="stocktransfer")
router.register(r"counts", StockCountViewSet, basename="stockcount")
router.register(r"adjustments", StockAdjustmentViewSet, basename="stockadjustment")

urlpatterns = router.urls
