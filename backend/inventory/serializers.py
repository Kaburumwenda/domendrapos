from rest_framework import serializers
from .models import (
    StockItem, StockMovement, StockTransfer,
    StockTransferLine, StockCount, StockCountLine,
    StockAdjustment, StockAdjustmentLine,
)


class StockItemSerializer(serializers.ModelSerializer):
    quantity_available = serializers.ReadOnlyField()
    needs_reorder = serializers.ReadOnlyField()
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    product_category = serializers.SerializerMethodField()
    branch_code = serializers.CharField(source="branch.code", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    cost_price = serializers.DecimalField(
        source="product.cost_price", max_digits=12, decimal_places=2, read_only=True
    )
    retail_price = serializers.DecimalField(
        source="product.retail_price", max_digits=12, decimal_places=2, read_only=True
    )
    unit_name = serializers.CharField(source="product.unit", read_only=True)

    class Meta:
        model = StockItem
        fields = "__all__"
        read_only_fields = ("quantity_reserved",)

    def get_product_category(self, obj):
        if obj.product and obj.product.category:
            return obj.product.category.name
        return None


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    branch_code = serializers.CharField(source="branch.code", read_only=True)
    movement_type_display = serializers.CharField(source="get_movement_type_display", read_only=True)
    performed_by_name = serializers.CharField(source="performed_by.get_full_name", read_only=True)
    quantity_before = serializers.SerializerMethodField()

    class Meta:
        model = StockMovement
        fields = "__all__"
        read_only_fields = ("quantity_after", "created_at", "performed_by")

    def get_quantity_before(self, obj):
        try:
            return obj.quantity_after - obj.quantity_change
        except (TypeError, ValueError):
            return 0


class StockTransferLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockTransferLine
        fields = "__all__"


class StockTransferSerializer(serializers.ModelSerializer):
    lines = StockTransferLineSerializer(many=True, read_only=True)
    from_branch_code = serializers.CharField(source="from_branch.code", read_only=True)
    to_branch_code = serializers.CharField(source="to_branch.code", read_only=True)

    class Meta:
        model = StockTransfer
        fields = "__all__"
        read_only_fields = ("created_by", "created_at", "shipped_at", "received_at")


class StockCountLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    unit_name = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    line_status_display = serializers.CharField(source="get_line_status_display", read_only=True)
    counted_by_name = serializers.CharField(source="counted_by.get_full_name", read_only=True)

    class Meta:
        model = StockCountLine
        fields = "__all__"
        read_only_fields = ("system_quantity", "variance", "value_variance", "counted_at")

    def get_unit_name(self, obj):
        return getattr(obj.product, "unit", None) or ""

    def get_category(self, obj):
        if obj.product and obj.product.category:
            return obj.product.category.name
        return None


class StockCountLineUpdateSerializer(serializers.ModelSerializer):
    """
    Write serializer for bulk-updating counted quantities.
    Only `counted_quantity`, `line_status`, `notes` are writable.
    """

    class Meta:
        model = StockCountLine
        fields = ["id", "counted_quantity", "line_status", "notes"]
        read_only_fields = ("id",)


class StockCountSerializer(serializers.ModelSerializer):
    lines = StockCountLineSerializer(many=True, read_only=True)
    branch_code = serializers.CharField(source="branch.code", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.get_full_name", read_only=True)
    reviewed_by_name = serializers.CharField(source="reviewed_by.get_full_name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    count_type_display = serializers.CharField(source="get_count_type_display", read_only=True)
    line_count = serializers.SerializerMethodField()

    class Meta:
        model = StockCount
        fields = "__all__"
        read_only_fields = (
            "created_by", "started_at", "completed_at", "reviewed_at",
            "reconciled_at", "reviewed_by", "total_items", "counted_items",
            "total_variance_qty", "total_variance_value",
        )

    def get_line_count(self, obj):
        if hasattr(obj, "_prefetched_objects_cache") and "lines" in obj._prefetched_objects_cache:
            return len(obj._prefetched_objects_cache["lines"])
        return obj.lines.count()


class StockCountCreateSerializer(serializers.ModelSerializer):
    """
    Accepts `product_ids` list on creation — the view-set will auto-generate
    lines from the StockItem snapshot.
    """

    product_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, allow_empty=True
    )
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    branch_code = serializers.CharField(source="branch.code", read_only=True)

    class Meta:
        model = StockCount
        fields = [
            "id", "branch", "count_type", "title", "scheduled_date",
            "notes", "assigned_to", "product_ids",
            "branch_name", "branch_code",
        ]
        read_only_fields = ("id",)


class StockAdjustmentLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    unit_name = serializers.SerializerMethodField()

    class Meta:
        model = StockAdjustmentLine
        fields = "__all__"
        read_only_fields = ("system_quantity", "quantity_change", "value_impact")

    def get_unit_name(self, obj):
        return getattr(obj.product, "unit", None) or ""


class StockAdjustmentLineCreateSerializer(serializers.ModelSerializer):
    """Write serializer for nested line items on create."""

    class Meta:
        model = StockAdjustmentLine
        fields = ["product", "variant", "counted_quantity", "unit_cost", "notes"]


class StockAdjustmentSerializer(serializers.ModelSerializer):
    lines = StockAdjustmentLineSerializer(many=True, read_only=True)
    branch_code = serializers.CharField(source="branch.code", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )
    approved_by_name = serializers.CharField(
        source="approved_by.get_full_name", read_only=True
    )
    reason_display = serializers.CharField(
        source="get_reason_display", read_only=True
    )
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    adjustment_type_display = serializers.CharField(
        source="get_adjustment_type_display", read_only=True
    )
    line_count = serializers.SerializerMethodField()

    class Meta:
        model = StockAdjustment
        fields = "__all__"
        read_only_fields = (
            "adjustment_number", "created_by", "approved_by",
            "created_at", "updated_at", "approved_at", "posted_at",
            "total_quantity", "total_value_impact",
        )

    def get_line_count(self, obj):
        # Use prefetched lines if available to avoid N+1
        if hasattr(obj, "_prefetched_objects_cache") and "lines" in obj._prefetched_objects_cache:
            return len(obj._prefetched_objects_cache["lines"])
        return obj.lines.count()


class StockAdjustmentCreateSerializer(serializers.ModelSerializer):
    """Accepts nested lines on creation."""

    lines = StockAdjustmentLineCreateSerializer(many=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    branch_code = serializers.CharField(source="branch.code", read_only=True)

    class Meta:
        model = StockAdjustment
        fields = [
            "id", "branch", "adjustment_type", "reason",
            "status", "adjustment_date", "notes", "lines",
            "branch_name", "branch_code",
        ]
        read_only_fields = ("id",)

    def create(self, validated_data):
        lines_data = validated_data.pop("lines")
        from .models import StockAdjustment, StockAdjustmentLine
        from django.db import transaction

        with transaction.atomic():
            # Generate sequential adjustment_number: ADJ-YYYYMMDD-XXXX
            import datetime as _dt
            today = _dt.date.today()
            prefix = f"ADJ-{today.strftime('%Y%m%d')}-"
            last = (
                StockAdjustment.objects
                .select_for_update()
                .filter(adjustment_number__startswith=prefix)
                .order_by("-adjustment_number")
                .first()
            )
            if last:
                seq = int(last.adjustment_number.rsplit("-", 1)[-1]) + 1
            else:
                seq = 1
            number = f"{prefix}{seq:04d}"

            adjustment = StockAdjustment.objects.create(
                created_by=self.context["request"].user,
                adjustment_number=number,
                **{k: v for k, v in validated_data.items() if k != "created_by"},
            )
            for line_data in lines_data:
                product = line_data["product"]
                qty = line_data.get("counted_quantity", 0)
                unit_cost = line_data.get("unit_cost", 0) or 0
                # Look up the actual StockItem for this product+branch to get system quantity
                stock_item = StockItem.objects.filter(
                    product=product,
                    variant=line_data.get("variant"),
                    branch=adjustment.branch,
                ).first()
                system_qty = float(stock_item.quantity_on_hand) if stock_item else 0
                change = float(qty) - system_qty
                value_impact = float(change) * float(unit_cost)
                StockAdjustmentLine.objects.create(
                    adjustment=adjustment,
                    product=product,
                    variant=line_data.get("variant"),
                    system_quantity=system_qty,
                    counted_quantity=qty,
                    quantity_change=change,
                    unit_cost=unit_cost,
                    value_impact=value_impact,
                    notes=line_data.get("notes", ""),
                )
            # Recalculate totals
            adjustment.total_quantity = sum(
                abs(line.quantity_change) for line in adjustment.lines.all()
            )
            adjustment.total_value_impact = sum(
                line.value_impact for line in adjustment.lines.all()
            )
            adjustment.save()
        return adjustment
