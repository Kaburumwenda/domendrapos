from django.db import models


class Supplier(models.Model):
    """
    Supplier / vendor from whom the tenant purchases stock.
    """

    supplier_code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    website = models.URLField(blank=True)

    address_line1 = models.CharField(max_length=200, blank=True)
    address_line2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state_province = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default="United States")

    tax_id = models.CharField(max_length=50, blank=True)
    payment_terms = models.CharField(max_length=100, blank=True, help_text="e.g., Net 30, COD")
    currency_code = models.CharField(max_length=3, default="USD")

    lead_time_days = models.PositiveIntegerField(default=7)
    minimum_order_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    is_active = models.BooleanField(default=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=5.0)

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [models.Index(fields=["name"]), models.Index(fields=["is_active"])]

    def __str__(self):
        return f"{self.name} ({self.supplier_code})"


class SupplierProduct(models.Model):
    """
    What products a supplier can supply with their lead pricing.
    """

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name="supplier_products")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="suppliers")
    supplier_sku = models.CharField(max_length=50, blank=True)
    supplier_price = models.DecimalField(max_digits=12, decimal_places=2)
    minimum_order_qty = models.DecimalField(max_digits=14, decimal_places=3, default=1)
    is_preferred = models.BooleanField(default=False)

    class Meta:
        unique_together = ("supplier", "product")

