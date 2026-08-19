from django.db import models
from django.utils.crypto import get_random_string


class Payment(models.Model):
    """
    Records a payment made against a sale.
    A sale can have multiple payments (split payment).
    """

    METHOD_CHOICES = [
        ("cash", "Cash"),
        ("card", "Credit/Debit Card"),
        ("wallet", "Mobile Wallet"),
        ("bank_transfer", "Bank Transfer"),
        ("cheque", "Cheque"),
        ("store_credit", "Store Credit"),
        ("gift_card", "Gift Card"),
        ("crypto", "Crypto"),
        ("on_account", "On Account (Credit)"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("authorized", "Authorized"),
        ("captured", "Captured"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
        ("partially_refunded", "Partially Refunded"),
    ]

    payment_number = models.CharField(max_length=50, unique=True)
    sale = models.ForeignKey("sales.Sale", on_delete=models.CASCADE, related_name="payments")
    branch = models.ForeignKey("branches.Branch", on_delete=models.CASCADE, related_name="payments")
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="captured")

    # Card / gateway details
    gateway = models.CharField(max_length=50, blank=True, help_text="e.g., Stripe, Square, Flutterwave")
    gateway_transaction_id = models.CharField(max_length=200, blank=True)
    card_last4 = models.CharField(max_length=4, blank=True)
    card_brand = models.CharField(max_length=30, blank=True)
    auth_code = models.CharField(max_length=50, blank=True)

    # Cash specific
    tendered = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    change_given = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)

    processed_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, related_name="payments_processed")
    processed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-processed_at"]
        indexes = [
            models.Index(fields=["sale"]),
            models.Index(fields=["method"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.payment_number} {self.method} {self.amount}"

    def save(self, *args, **kwargs):
        if not self.payment_number:
            self.payment_number = f"P{get_random_string(12, '0123456789')}"
        super().save(*args, **kwargs)


class PaymentRefund(models.Model):
    original_payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name="refunds")
    refund = models.ForeignKey("sales.Refund", on_delete=models.CASCADE, related_name="payment_refunds")
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    gateway_refund_id = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

