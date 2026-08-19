from rest_framework.routers import DefaultRouter
from .views import (
    CustomerViewSet,
    CustomerGroupViewSet,
    CustomerInteractionViewSet,
)

router = DefaultRouter()
router.register(r"", CustomerViewSet, basename="customer")
router.register(r"groups", CustomerGroupViewSet, basename="customergroup")
router.register(r"interactions", CustomerInteractionViewSet, basename="customerinteraction")

urlpatterns = router.urls
