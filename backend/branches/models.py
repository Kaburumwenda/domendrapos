from django.db import models
import uuid


class Branch(models.Model):
    """
    A physical store / location belonging to a tenant.
    Each tenant has at least one (HQ) branch.
    """

    CURRENCY_CHOICES = [
        ("USD", "USD"), ("EUR", "EUR"), ("GBP", "GBP"),
        ("INR", "INR"), ("NGN", "NGN"), ("CAD", "CAD"), ("AUD", "AUD"),
    ]

    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    is_headquarters = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    address_line1 = models.CharField(max_length=200, blank=True)
    address_line2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state_province = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default="United States")

    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)

    currency_code = models.CharField(max_length=3, default="USD")
    timezone = models.CharField(max_length=50, default="UTC")
    tax_rate = models.DecimalField(max_digits=6, decimal_places=4, default=0)

    # POS terminal count / register mapping
    register_count = models.PositiveIntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [models.Index(fields=["code"], name="branch_code_idx")]

    def __str__(self):
        return f"{self.name} ({self.code})"


class Register(models.Model):
    """
    A POS terminal / cash register within a branch.
    """

    STATUS_CHOICES = [
        ("open", "Open"),
        ("closed", "Closed"),
        ("suspended", "Suspended"),
    ]

    branch = models.ForeignKey(
        Branch, on_delete=models.CASCADE, related_name="registers"
    )
    name = models.CharField(max_length=100)
    terminal_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="closed")
    current_cashier = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="active_registers",
    )
    opening_float = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    opened_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["branch", "name"]
        unique_together = ("branch", "name")

    def __str__(self):
        return f"{self.branch.code} - {self.name}"

