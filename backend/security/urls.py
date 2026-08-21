from rest_framework.routers import DefaultRouter
from .views import AxesControlViewSet

router = DefaultRouter()
router.register(r"", AxesControlViewSet, basename="axes")

urlpatterns = router.urls
