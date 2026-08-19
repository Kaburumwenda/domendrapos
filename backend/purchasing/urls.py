from rest_framework.routers import DefaultRouter
from .views import PurchaseOrderViewSet, GoodsReceiptViewSet

router = DefaultRouter()
router.register(r"orders", PurchaseOrderViewSet, basename="purchaseorder")
router.register(r"receipts", GoodsReceiptViewSet, basename="goodsreceipt")

urlpatterns = router.urls
