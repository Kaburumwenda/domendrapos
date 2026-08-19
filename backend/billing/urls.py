from rest_framework.routers import DefaultRouter
from .views import (
    SubscriptionPlanViewSet,
    InvoiceViewSet,
    PaymentRecordViewSet,
    UsageMetricViewSet,
)

router = DefaultRouter()
router.register(r"plans", SubscriptionPlanViewSet, basename="plan")
router.register(r"invoices", InvoiceViewSet, basename="invoice")
router.register(r"payments", PaymentRecordViewSet, basename="paymentrecord")
router.register(r"usage", UsageMetricViewSet, basename="usage")

urlpatterns = router.urls
