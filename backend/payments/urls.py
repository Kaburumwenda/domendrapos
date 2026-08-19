from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, PaymentRefundViewSet

router = DefaultRouter()
router.register(r"", PaymentViewSet, basename="payment")
router.register(r"refunds", PaymentRefundViewSet, basename="paymentrefund")

urlpatterns = router.urls
