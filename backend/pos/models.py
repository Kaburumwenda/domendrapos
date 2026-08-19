"""
POS models — transactions, parked sales, cashier shifts, and credit sales.
Designed for pharmacy/retail walk-in sales with full audit trail.
"""
from decimal import Decimal
from django.db import models
from django.utils import timezone


class POSTransaction(models.Model):
    """A completed POS sale (walk-in / OTC)."""

    PAYMENT_METHODS = [
        ("cash", "Cash"),
        ("mpesa", "M-Pesa"),
        ("card", "Card"),
        ("insurance", "Insurance"),
        ("credit", "Credit"),
        ("bank_transfer", "Bank Transfer"),
    ]

    STATUS_CHOICES = [
        ("completed", "Completed"),
        ("pending", "Pending"),
        ("voided", "Voided"),
        ("cancelled", "Cancelled"),
        ("refunded", "Refunded"),
    ]

    transaction_number = models.CharField(max_length=50, unique=True)
    branch = models.ForeignKey(
        "branches.Branch", on_delete=models.CASCADE, related_name="pos_transactions"
    )
    cashier = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True,
        related_name="pos_transactions",
    )
    customer_name = models.CharField(max_length=200, blank=True, default="Walk-in")
    customer_phone = models.CharField(max_length=20, blank=True)
    shift = models.ForeignKey(
        "POSShift", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="transactions",
    )
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default="cash")
    payment_reference = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="completed")
    voided_at = models.DateTimeField(null=True, blank=True)
    voided_by = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="voided_transactions",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["branch", "status"]),
            models.Index(fields=["branch", "created_at"]),
            models.Index(fields=["payment_method"]),
        ]

    def __str__(self):
        return f"{self.transaction_number} ({self.get_status_display()})"


class POSTransactionItem(models.Model):
    """Line item in a POS transaction."""
    transaction = models.ForeignKey(
        POSTransaction, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    variant = models.ForeignKey(
        "products.ProductVariant", on_delete=models.SET_NULL, null=True, blank=True
    )
    product_name = models.CharField(max_length=300)
    quantity = models.DecimalField(max_digits=14, decimal_places=3, default=1)
    unit_price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    class Meta:
        ordering = ["id"]


class ParkedSale(models.Model):
    """A sale put on hold (parked) to resume later."""
    branch = models.ForeignKey(
        "branches.Branch", on_delete=models.CASCADE, related_name="parked_sales"
    )
    cashier = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True,
        related_name="parked_sales",
    )
    customer_name = models.CharField(max_length=200, default="Walk-in")
    customer_phone = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    items_data = models.JSONField(default=list)
    total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["branch", "cashier"])]

    def __str__(self):
        return f"Park #{self.id} — {self.customer_name}"


class POSShift(models.Model):
    """Cashier shift — open/close drawer with Z-report and variance tracking."""
    STATUS_CHOICES = [
        ("open", "Open"),
        ("closed", "Closed"),
    ]
    reference = models.CharField(max_length=50, unique=True)
    branch = models.ForeignKey(
        "branches.Branch", on_delete=models.CASCADE, related_name="pos_shifts"
    )
    cashier = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True,
        related_name="pos_shifts",
    )
    opening_float = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    expected_cash = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    actual_cash = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    cash_variance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    gross_revenue = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_discounts = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_tax = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    transaction_count = models.IntegerField(default=0)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="open")
    opened_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-opened_at"]

    def __str__(self):
        return f"{self.reference} ({self.get_status_display()})"


class POSCredit(models.Model):
    """A credit sale tracked for later collection."""
    STATUS_CHOICES = [
        ("open", "Open"),
        ("partial", "Partial"),
        ("settled", "Settled"),
        ("overdue", "Overdue"),
    ]
    transaction = models.ForeignKey(
        POSTransaction, on_delete=models.CASCADE, related_name="credits"
    )
    branch = models.ForeignKey(
        "branches.Branch", on_delete=models.CASCADE, related_name="pos_credits"
    )
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=20, blank=True)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    due_date = models.DateField(null=True, blank=True)
    payment_reference = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["branch", "status"])]


class POSCreditPayment(models.Model):
    """A payment against a credit sale."""
    credit = models.ForeignKey(
        POSCredit, on_delete=models.CASCADE, related_name="payments"
    )
    amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=20, default="cash")
    reference = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True,
        related_name="credit_payments",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
