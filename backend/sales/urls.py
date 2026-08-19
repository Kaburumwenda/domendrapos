from rest_framework.routers import DefaultRouter
from .views import SaleViewSet, RefundViewSet, DiscountViewSet, TaxViewSet

router = DefaultRouter()
router.register(r"", SaleViewSet, basename="sale")
router.register(r"refunds", RefundViewSet, basename="refund")
router.register(r"discounts", DiscountViewSet, basename="discount")
router.register(r"taxes", TaxViewSet, basename="tax")

urlpatterns = router.urls
