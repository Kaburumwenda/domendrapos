from django.db import models
from django_tenants.models import TenantMixin, DomainMixin
from django.utils.crypto import get_random_string
from django.utils.text import slugify


class Client(TenantMixin):
    """
    Each 'Client' is a tenant in the SaaS platform.
    Each tenant gets its own PostgreSQL schema via django-tenants.
    """

    CURRENCY_CHOICES = [
        ("KES", "Kenyan Shilling (KSh)"),
        ("USD", "US Dollar ($)"),
        ("EUR", "Euro (€)"),
        ("GBP", "British Pound (£)"),
        ("UGX", "Ugandan Shilling (USh)"),
        ("TZS", "Tanzanian Shilling (TSh)"),
        ("NGN", "Nigerian Naira (₦)"),
        ("INR", "Indian Rupee (₹)"),
        ("CAD", "Canadian Dollar (C$)"),
        ("AUD", "Australian Dollar (A$)"),
        ("ZAR", "South African Rand (R)"),
        ("GHS", "Ghanaian Cedi (₵)"),
    ]

    # Maps currency codes to symbols — used as fallback when symbol not explicitly set
    CURRENCY_SYMBOLS = {
        "KES": "KSh",
        "USD": "$",
        "EUR": "€",
        "GBP": "£",
        "UGX": "USh",
        "TZS": "TSh",
        "NGN": "₦",
        "INR": "₹",
        "CAD": "C$",
        "AUD": "A$",
        "ZAR": "R",
        "GHS": "₵",
    }

    PLAN_CHOICES = [
        ("free", "Free"),
        ("starter", "Starter"),
        ("business", "Business"),
        ("enterprise", "Enterprise"),
    ]

    STATUS_CHOICES = [
        ("trial", "Trial"),
        ("active", "Active"),
        ("suspended", "Suspended"),
        ("cancelled", "Cancelled"),
    ]

    name = models.CharField(max_length=200, help_text="Organisation / business name")
    schema_name = models.CharField(max_length=63, unique=True)
    paid_until = models.DateField(null=True, blank=True)
    on_trial = models.BooleanField(default=True)
    trial_ends_at = models.DateTimeField(null=True, blank=True, help_text="Explicit trial end datetime")
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default="free")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="trial")

    # Plan limits (denormalized so super-admin can tune per tenant)
    max_branches = models.PositiveIntegerField(default=1)
    max_users = models.PositiveIntegerField(default=5)
    max_products = models.PositiveIntegerField(default=500)

    # Suspension tracking
    suspended_reason = models.CharField(max_length=255, blank=True)
    suspended_at = models.DateTimeField(null=True, blank=True)
    last_activated_at = models.DateTimeField(null=True, blank=True)

    # Internal super-admin notes
    notes = models.TextField(blank=True, help_text="Internal notes visible to super-admins only")

    # Branding
    logo = models.ImageField(upload_to="tenant-logos/", null=True, blank=True)
    primary_color = models.CharField(max_length=7, default="#1976D2")

    # Contact
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=30, blank=True)
    address_line1 = models.CharField(max_length=200, blank=True)
    address_line2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state_province = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default="United States")

    # Currency / locale — default to Kenyan Shilling, fallback USD
    currency_code = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default="KES")
    currency_symbol = models.CharField(max_length=5, default="KSh")
    timezone = models.CharField(max_length=50, default="Africa/Nairobi")

    # Metadata
    created_on = models.DateField(auto_now_add=True)
    created_by_email = models.EmailField()

    auto_create_schema = True

    def save(self, *args, **kwargs):
        if not self.schema_name:
            base = slugify(self.name).replace("-", "_")[:50]
            self.schema_name = f"{base}_{get_random_string(5)}"
        # Auto-sync symbol from the currency code if symbol not manually overridden
        if self.currency_code in self.CURRENCY_SYMBOLS:
            self.currency_symbol = self.CURRENCY_SYMBOLS[self.currency_code]
        super().save(*args, **kwargs)

    @property
    def effective_currency_symbol(self):
        """Returns the symbol, falling back to the code→symbol map, then USD $ as ultimate fallback."""
        if self.currency_symbol:
            return self.currency_symbol
        return self.CURRENCY_SYMBOLS.get(self.currency_code, "$")

    def __str__(self):
        return f"{self.name} ({self.schema_name})"


class Domain(DomainMixin):
    """
    Maps hostnames / subdomains to tenants.
    """

    domain = models.CharField(max_length=253, unique=True)
    is_primary = models.BooleanField(default=True)
    tenant = models.ForeignKey(
        Client, on_delete=models.CASCADE, related_name="domains"
    )

    def __str__(self):
        return self.domain

