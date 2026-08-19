from rest_framework import serializers
from .models import Sale, SaleLine, Refund, RefundLine, Discount, Tax


class SaleLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    variant_name = serializers.CharField(source="variant.name", read_only=True)
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = SaleLine
        fields = "__all__"
        read_only_fields = ("line_total", "tax_amount", "is_refunded", "refunded_quantity")

    def get_category_name(self, obj):
        if obj.product and obj.product.category:
            return obj.product.category.name
        return ""


class SaleSerializer(serializers.ModelSerializer):
    lines = SaleLineSerializer(many=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    cashier_name = serializers.CharField(source="cashier.get_full_name", read_only=True)
    customer_name = serializers.CharField(source="customer.full_name", read_only=True, default="")

    class Meta:
        model = Sale
        fields = "__all__"
        read_only_fields = (
            "subtotal", "discount_total", "tax_total", "grand_total",
            "total_cost", "sale_date",
        )

    def create(self, validated_data):
        lines_data = validated_data.pop("lines", [])
        sale = Sale.objects.create(**validated_data)
        subtotal = 0
        tax_total = 0
        cost_total = 0
        for line_data in lines_data:
            line = SaleLine.objects.create(sale=sale, **line_data)
            qty = line.quantity
            unit_price = line.unit_price
            line_subtotal = qty * unit_price
            disc = line.discount_amount + (line_subtotal * line.discount_percent / 100)
            line_tax = (line_subtotal - disc) * line.tax_rate / 100
            line.line_total = line_subtotal - disc + line_tax
            line.tax_amount = line_tax
            line.save()

            subtotal += line_subtotal
            tax_total += line_tax
            cost_total += qty * line.cost_price

        sale.subtotal = subtotal
        sale.tax_total = tax_total
        sale.total_cost = cost_total
        sale.discount_total = sum(l.discount_amount for l in sale.lines.all())
        sale.grand_total = sale.subtotal - sale.discount_total + sale.tax_total + sale.surcharge + sale.tip_total
        sale.status = "completed"
        sale.save()

        # Decrement inventory
        from inventory.models import StockItem, StockMovement
        from django.db import models as dm
        for line in sale.lines.all():
            item, _ = StockItem.objects.get_or_create(
                product=line.product, variant=line.variant, branch=sale.branch,
                defaults={},
            )
            item.quantity_on_hand -= line.quantity
            item.save()
            StockMovement.objects.create(
                product=line.product, variant=line.variant, branch=sale.branch,
                movement_type="sale", quantity_change=-line.quantity,
                quantity_after=item.quantity_on_hand, reference=sale.receipt_number,
                performed_by=sale.cashier,
            )
        return sale


class RefundLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = RefundLine
        fields = "__all__"


class RefundSerializer(serializers.ModelSerializer):
    lines = RefundLineSerializer(many=True)

    class Meta:
        model = Refund
        fields = "__all__"
        read_only_fields = ("refund_number", "created_at", "processed_at", "approved_by")


class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = "__all__"
        read_only_fields = ("uses_count",)


class TaxSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tax
        fields = "__all__"
