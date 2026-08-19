from django.db import models
from django.utils.crypto import get_random_string


def generate_receipt_number():
    return f"R{get_random_string(10, allowed_chars='0123456789')}"


class Sale(models.Model):
    """
    A sale / transaction. One sale has many sale lines (items) and Receipt.
    """

    SALE_STATUS = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("refunded", "Refunded"),
        ("partially_refunded", "Partially Refunded"),
        ("voided", "Voided"),
        ("on_hold", "On Hold"),
    ]

    receipt_number = models.CharField(max_length=50, unique=True, default=generate_receipt_number)
    branch = models.ForeignKey("branches.Branch", on_delete=models.CASCADE, related_name="sales")
    register = models.ForeignKey(
        "branches.Register", on_delete=models.SET_NULL, null=True, blank=True, related_name="sales"
    )
    cashier = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, related_name="sales")
    customer = models.ForeignKey(
        "customers.Customer",
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name="sales",
    )

    sale_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=SALE_STATUS, default="pending")

    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    surcharge = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tip_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    notes = models.TextField(blank=True)
    price_list = models.ForeignKey(
        "products.PriceList",
        on_delete=models.SET_NULL, null=True, blank=True,
    )

    class Meta:
        ordering = ["-sale_date"]
        indexes = [
            models.Index(fields=["branch", "sale_date"]),
            models.Index(fields=["status"]),
            models.Index(fields=["cashier"]),
            models.Index(fields=["customer"]),
        ]

    def __str__(self):
        return f"{self.receipt_number} - {self.grand_total}"


class SaleLine(models.Model):
    """
    Individual line item of a sale.
    """

    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    variant = models.ForeignKey(
        "products.ProductVariant",
        on_delete=models.CASCADE, null=True, blank=True,
    )
    quantity = models.DecimalField(max_digits=14, decimal_places=3)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=6, decimal_places=4, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    line_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    notes = models.CharField(max_length=200, blank=True)

    is_refunded = models.BooleanField(default=False)
    refunded_quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)

    class Meta:
        ordering = ["id"]


class Refund(models.Model):
    """
    Refund request / processing for a sale (full or partial).
    """

    REFUND_STATUS = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("completed", "Completed"),
    ]

    refund_number = models.CharField(max_length=50, unique=True)
    original_sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="refunds")
    customer = models.ForeignKey("customers.Customer", on_delete=models.SET_NULL, null=True, blank=True)

    reason = models.TextField()
    refund_method = models.CharField(max_length=30, default="store_credit")
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    status = models.CharField(max_length=20, choices=REFUND_STATUS, default="pending")

    requested_by = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True, related_name="refund_requests"
    )
    approved_by = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="refund_approvals",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]


class RefundLine(models.Model):
    refund = models.ForeignKey(Refund, on_delete=models.CASCADE, related_name="lines")
    sale_line = models.ForeignKey(SaleLine, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=14, decimal_places=3)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.CharField(max_length=200, blank=True)


class Discount(models.Model):
    """
    Named discounts / promotions that can be applied to sales or items.
    """

    DISCOUNT_TYPES = [
        ("percentage", "Percentage"),
        ("absolute", "Fixed Amount"),
        ("bogo", "Buy X Get Y"),
        ("bundle", "Bundle Deal"),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    product = models.ForeignKey(
        "products.Product", on_delete=models.CASCADE, null=True, blank=True, related_name="discounts"
    )
    category = models.ForeignKey(
        "products.Category", on_delete=models.CASCADE, null=True, blank=True, related_name="discounts"
    )

    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    uses_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Tax(models.Model):
    """
    Tax rates applicable at sale time. A sale can have multiple taxes.
    """

    name = models.CharField(max_length=100)
    rate = models.DecimalField(max_digits=6, decimal_places=4)
    is_compound = models.BooleanField(default=False, help_text="Compound on top of other taxes")
    is_active = models.BooleanField(default=True)
    applies_to = models.CharField(
        max_length=20, default="all",
        help_text="all, category, product",
    )
    category = models.ForeignKey(
        "products.Category", on_delete=models.CASCADE, null=True, blank=True
    )

    def __str__(self):
        return f"{self.name} ({self.rate}%)"

