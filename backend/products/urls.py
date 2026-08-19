from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    ProductViewSet,
    ProductVariantViewSet,
    PriceListViewSet,
    ProductPriceOverrideViewSet,
    UnitViewSet,
    BrandViewSet,
)

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"units", UnitViewSet, basename="unit")
router.register(r"brands", BrandViewSet, basename="brand")
router.register(r"", ProductViewSet, basename="product")
router.register(r"variants", ProductVariantViewSet, basename="variant")
router.register(r"price-lists", PriceListViewSet, basename="pricelist")
router.register(r"price-overrides", ProductPriceOverrideViewSet, basename="priceoverride")

urlpatterns = router.urls
