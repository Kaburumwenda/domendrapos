from rest_framework import serializers
from django.db.models import Sum
from inventory.models import StockItem
from .models import Category, Product, ProductVariant, PriceList, ProductPriceOverride, Unit, Brand


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    # Read-write field backed by inventory.StockItem (HQ branch)
    quantity_on_hand = serializers.DecimalField(
        max_digits=14, decimal_places=3, required=False, allow_null=True
    )
    reorder_level = serializers.DecimalField(
        max_digits=14, decimal_places=3, required=False, allow_null=True
    )

    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Use annotated values if available (from the queryset), avoiding N+1
        total_qty = getattr(instance, "_total_quantity_on_hand", None)
        total_reorder = getattr(instance, "_total_reorder_level", None)
        if total_qty is not None:
            data["quantity_on_hand"] = float(total_qty) if total_qty else 0
            data["reorder_level"] = float(total_reorder) if total_reorder else 0
        else:
            # Fallback for non-queryset access (e.g., single object)
            stock_qs = StockItem.objects.filter(product=instance, variant=None)
            agg = stock_qs.aggregate(total=Sum("quantity_on_hand"))
            reorder_agg = stock_qs.aggregate(total=Sum("reorder_level"))
            data["quantity_on_hand"] = float(agg["total"]) if agg["total"] is not None else 0
            data["reorder_level"] = float(reorder_agg["total"]) if reorder_agg["total"] is not None else 0
        return data

    def to_internal_value(self, data):
        # Convert string values to Decimal for our custom fields
        ret = super().to_internal_value(data)
        if "quantity_on_hand" in data and data["quantity_on_hand"] is not None:
            ret["quantity_on_hand"] = data["quantity_on_hand"]
        if "reorder_level" in data and data["reorder_level"] is not None:
            ret["reorder_level"] = data["reorder_level"]
        return ret

    def _get_stock_item(self, obj):
        if not hasattr(obj, "_prefetched_stock_item"):
            from inventory.models import StockItem
            obj._prefetched_stock_item = StockItem.objects.filter(
                product=obj, variant=None, branch__isnull=False
            ).first()
        return obj._prefetched_stock_item

    def create(self, validated_data):
        quantity_on_hand = validated_data.pop("quantity_on_hand", None)
        reorder_level = validated_data.pop("reorder_level", None)
        product = super().create(validated_data)
        if quantity_on_hand is not None:
            self._update_stock_item(product, quantity_on_hand, reorder_level)
        return product

    def update(self, instance, validated_data):
        quantity_on_hand = validated_data.pop("quantity_on_hand", None)
        reorder_level = validated_data.pop("reorder_level", None)
        product = super().update(instance, validated_data)
        if quantity_on_hand is not None:
            self._update_stock_item(product, quantity_on_hand, reorder_level)
        return product

    def _update_stock_item(self, product, quantity_on_hand, reorder_level):
        """Create or update the HQ-branch StockItem for this product."""
        from branches.models import Branch
        from inventory.models import StockItem, StockMovement

        branch = Branch.objects.first()
        if not branch:
            return

        stock_item, created = StockItem.objects.get_or_create(
            product=product,
            variant=None,
            branch=branch,
            defaults={
                "quantity_on_hand": quantity_on_hand or 0,
                "reorder_level": reorder_level if reorder_level is not None else 10,
            },
        )
        if not created:
            stock_item.quantity_on_hand = quantity_on_hand or 0
            if reorder_level is not None:
                stock_item.reorder_level = reorder_level
            stock_item.save(update_fields=["quantity_on_hand", "reorder_level"])

        # Log an initial stock movement if this is a new stock item or qty changed
        if created and quantity_on_hand and float(quantity_on_hand) > 0:
            StockMovement.objects.create(
                product=product,
                branch=branch,
                movement_type="initial",
                quantity_change=quantity_on_hand,
                quantity_after=quantity_on_hand,
                notes="Initial stock set during product creation",
            )


class PriceListSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceList
        fields = "__all__"


class ProductPriceOverrideSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductPriceOverride
        fields = "__all__"
