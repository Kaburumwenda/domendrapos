from rest_framework import serializers
from .models import (
    PurchaseOrder, PurchaseOrderLine,
    GoodsReceipt, GoodsReceiptLine,
)


class PurchaseOrderLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = PurchaseOrderLine
        fields = "__all__"
        read_only_fields = ("line_total", "po")


class PurchaseOrderSerializer(serializers.ModelSerializer):
    lines = PurchaseOrderLineSerializer(many=True)
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    supplier_phone = serializers.CharField(source="supplier.phone", read_only=True)
    supplier_email = serializers.CharField(source="supplier.email", read_only=True)
    supplier_contact_person = serializers.CharField(source="supplier.contact_person", read_only=True)
    branch_code = serializers.CharField(source="branch.code", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    approved_by_name = serializers.CharField(source="approved_by.get_full_name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = "__all__"
        read_only_fields = (
            "po_number", "subtotal", "discount_total", "tax_total", "grand_total",
            "created_at", "updated_at", "approved_by", "created_by",
        )

    def get_item_count(self, obj):
        return obj.lines.count()

    def create(self, validated_data):
        lines_data = validated_data.pop("lines", [])
        po = PurchaseOrder.objects.create(**validated_data)
        subtotal = 0
        tax_total = 0
        for line_data in lines_data:
            line = PurchaseOrderLine.objects.create(po=po, **line_data)
            line.line_total = line.quantity_ordered * line.unit_cost * (1 + line.tax_rate / 100)
            line.save()
            subtotal += line.quantity_ordered * line.unit_cost
            tax_total += line.quantity_ordered * line.unit_cost * line.tax_rate / 100
        po.subtotal = subtotal
        po.tax_total = tax_total
        po.grand_total = subtotal + tax_total + po.shipping_cost - po.discount_total
        po.save()
        return po


class GoodsReceiptLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="po_line.product.name", read_only=True)
    product_sku = serializers.CharField(source="po_line.product.sku", read_only=True)
    quantity_ordered = serializers.DecimalField(source="po_line.quantity_ordered", max_digits=14, decimal_places=3, read_only=True)

    class Meta:
        model = GoodsReceiptLine
        fields = "__all__"
        read_only_fields = ("receipt",)


class GoodsReceiptSerializer(serializers.ModelSerializer):
    lines = GoodsReceiptLineSerializer(many=True)
    po_number = serializers.CharField(source="po.po_number", read_only=True)
    supplier_name = serializers.CharField(source="po.supplier.name", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    received_by_name = serializers.CharField(source="received_by.get_full_name", read_only=True)
    total_received_value = serializers.SerializerMethodField()

    class Meta:
        model = GoodsReceipt
        fields = "__all__"
        read_only_fields = ("grn_number", "received_date", "received_by")

    def get_total_received_value(self, obj):
        total = 0
        for line in obj.lines.all():
            total += float(line.quantity_received) * float(line.po_line.unit_cost)
        return round(total, 2)

    def create(self, validated_data):
        lines_data = validated_data.pop("lines", [])
        grn = GoodsReceipt.objects.create(**validated_data)
        for line_data in lines_data:
            GoodsReceiptLine.objects.create(receipt=grn, **line_data)
        return grn
