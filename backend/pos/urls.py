from rest_framework.routers import DefaultRouter
from .views import (
    POSTransactionViewSet,
    ParkedSaleViewSet,
    POSShiftViewSet,
    POSCreditViewSet,
)

router = DefaultRouter()
router.register(r"transactions", POSTransactionViewSet, basename="postransaction")
router.register(r"parked-sales", ParkedSaleViewSet, basename="parkedsale")
router.register(r"shifts", POSShiftViewSet, basename="posshift")
router.register(r"credits", POSCreditViewSet, basename="poscredit")

urlpatterns = router.urls
