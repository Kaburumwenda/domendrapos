from django.db import models


class SubscriptionPlan(models.Model):
    """SaaS subscription plans available to tenants."""

    name = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    billing_cycle = models.CharField(max_length=20, default="monthly")
    features = models.JSONField(default=dict)
    max_branches = models.PositiveIntegerField(default=1)
    max_users = models.PositiveIntegerField(default=5)
    max_products = models.PositiveIntegerField(default=500)
    is_active = models.BooleanField(default=True)


class Invoice(models.Model):
    """Billing invoice for a tenant's subscription."""

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("sent", "Sent"),
        ("paid", "Paid"),
        ("overdue", "Overdue"),
        ("cancelled", "Cancelled"),
    ]

    invoice_number = models.CharField(max_length=50, unique=True)
    tenant = models.ForeignKey("tenants.Client", on_delete=models.CASCADE, related_name="invoices")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    paid_date = models.DateField(null=True, blank=True)


class PaymentRecord(models.Model):
    """Records payment for an invoice."""

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=30, default="card")
    reference = models.CharField(max_length=200, blank=True)
    paid_at = models.DateTimeField(auto_now_add=True)


class UsageMetric(models.Model):
    """Tracks API requests / resource usage for billing."""

    tenant = models.ForeignKey("tenants.Client", on_delete=models.CASCADE, related_name="usage_metrics")
    metric_type = models.CharField(max_length=50)
    count = models.PositiveIntegerField(default=0)
    period_start = models.DateField()
    period_end = models.DateField()
    recorded_at = models.DateTimeField(auto_now_add=True)

