from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, ProductVariant, PriceList, ProductPriceOverride, Unit, Brand
from .filters import ProductFilter
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductVariantSerializer,
    PriceListSerializer,
    ProductPriceOverrideSerializer,
    UnitSerializer,
    BrandSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["is_active", "parent"]
    search_fields = ["name", "description"]


class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["is_active"]
    search_fields = ["name", "abbreviation", "description"]
    ordering_fields = ["name", "created_at"]

    DEFAULT_UNITS = [
        ("Each", "ea", "Individual item"),
        ("Piece", "pc", "Single piece"),
        ("Kilogram", "kg", "Weight in kilograms"),
        ("Gram", "g", "Weight in grams"),
        ("Liter", "L", "Volume in liters"),
        ("Milliliter", "ml", "Volume in milliliters"),
        ("Meter", "m", "Length in meters"),
        ("Centimeter", "cm", "Length in centimeters"),
        ("Box", "box", "Box of items"),
        ("Pack", "pack", "Pack of items"),
        ("Dozen", "dz", "Dozen (12 items)"),
        ("Pair", "pair", "Pair of items"),
        ("Set", "set", "Set of items"),
        ("Roll", "roll", "Roll of material"),
        ("Bottle", "btl", "Bottle"),
        ("Carton", "ctn", "Carton of items"),
    ]

    @action(detail=False, methods=["post"], url_path="seed")
    def seed_units(self, request):
        """Seed default units of measure. Skips units that already exist."""
        created = []
        skipped = []
        for name, abbr, desc in self.DEFAULT_UNITS:
            obj, was_created = Unit.objects.get_or_create(
                name=name,
                defaults={"abbreviation": abbr, "description": desc, "is_active": True},
            )
            if was_created:
                created.append(name)
            else:
                skipped.append(name)
        return Response(
            {
                "created": created,
                "skipped": skipped,
                "total": Unit.objects.count(),
            },
            status=status.HTTP_200_OK,
        )


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["is_active"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category", "default_supplier").all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ["sku", "barcode", "name", "brand", "manufacturer"]
    ordering_fields = ["name", "retail_price", "created_at"]


class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["product"]


class PriceListViewSet(viewsets.ModelViewSet):
    queryset = PriceList.objects.all()
    serializer_class = PriceListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["is_active"]


class ProductPriceOverrideViewSet(viewsets.ModelViewSet):
    queryset = ProductPriceOverride.objects.all()
    serializer_class = ProductPriceOverrideSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["product", "variant", "price_list", "branch"]

