from django.db import models
from django.utils.crypto import get_random_string


class PurchaseOrder(models.Model):
    """
    A purchase order (PO) issued to a supplier to restock products.
    """

    PO_STATUS = [
        ("draft", "Draft"),
        ("submitted", "Submitted"),
        ("approved", "Approved"),
        ("sent", "Sent to Supplier"),
        ("partially_received", "Partially Received"),
        ("received", "Received"),
        ("cancelled", "Cancelled"),
    ]

    po_number = models.CharField(max_length=50, unique=True)
    supplier = models.ForeignKey(
        "suppliers.Supplier", on_delete=models.CASCADE, related_name="purchase_orders"
    )
    branch = models.ForeignKey(
        "branches.Branch", on_delete=models.CASCADE, related_name="purchase_orders"
    )
    status = models.CharField(max_length=20, choices=PO_STATUS, default="draft")

    order_date = models.DateField(auto_now_add=True)
    expected_delivery_date = models.DateField(null=True, blank=True)
    actual_delivery_date = models.DateField(null=True, blank=True)

    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    notes = models.TextField(blank=True)

    created_by = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True,
        related_name="purchase_orders_created",
    )
    approved_by = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="purchase_orders_approved",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]


class PurchaseOrderLine(models.Model):
    po = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    variant = models.ForeignKey(
        "products.ProductVariant",
        on_delete=models.CASCADE, null=True, blank=True,
    )
    quantity_ordered = models.DecimalField(max_digits=14, decimal_places=3)
    quantity_received = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)
    retail_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=6, decimal_places=4, default=0)
    line_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)


class GoodsReceipt(models.Model):
    """
    Goods Receipt Note (GRN) — records what was actually received from a PO.
    """

    grn_number = models.CharField(max_length=50, unique=True)
    po = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="receipts")
    branch = models.ForeignKey("branches.Branch", on_delete=models.CASCADE, related_name="goods_receipts")
    received_date = models.DateTimeField(auto_now_add=True)
    received_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, related_name="goods_receipts")
    notes = models.TextField(blank=True)


class GoodsReceiptLine(models.Model):
    receipt = models.ForeignKey(GoodsReceipt, on_delete=models.CASCADE, related_name="lines")
    po_line = models.ForeignKey(PurchaseOrderLine, on_delete=models.CASCADE)
    quantity_received = models.DecimalField(max_digits=14, decimal_places=3)
    condition = models.CharField(max_length=20, default="good")
    notes = models.CharField(max_length=200, blank=True)

