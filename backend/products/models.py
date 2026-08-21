from django.db import models
import uuid


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="children"
    )
    image = models.ImageField(upload_to="category-images/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Unit(models.Model):
    name = models.CharField(max_length=50, unique=True)
    abbreviation = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to="brand-logos/", null=True, blank=True)
    website = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    PRODUCT_TYPES = [
        ("physical", "Physical"),
        ("service", "Service"),
        ("digital", "Digital"),
        ("bundle", "Bundle"),
    ]

    sku = models.CharField(max_length=50, unique=True)
    barcode = models.CharField(max_length=100, blank=True, db_index=True)
    name = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="products"
    )
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPES, default="physical")

    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    retail_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    wholesale_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=6, decimal_places=4, default=0)

    unit = models.CharField(max_length=20, default="each")
    items_per_unit = models.PositiveIntegerField(
        default=1, blank=True,
        help_text="Number of individual pieces per unit (e.g., 24 for a carton, 12 for a dozen)."
    )
    weight = models.DecimalField(max_digits=10, decimal_places=3, default=0, blank=True)
    dimensions = models.CharField(max_length=50, blank=True)

    expiry_date = models.DateField(
        null=True, blank=True,
        help_text="Optional expiry date for perishable goods."
    )

    image = models.ImageField(upload_to="product-images/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_sellable = models.BooleanField(default=True)
    is_purchasable = models.BooleanField(default=True)
    track_inventory = models.BooleanField(default=True)

    default_supplier = models.ForeignKey(
        "suppliers.Supplier",
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name="products_supplied",
    )

    brand = models.CharField(max_length=100, blank=True)
    manufacturer = models.CharField(max_length=200, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["sku"]),
            models.Index(fields=["barcode"]),
            models.Index(fields=["category"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.sku})"


class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="variants"
    )
    name = models.CharField(max_length=100, help_text="e.g., 'Large Red'")
    sku_suffix = models.CharField(max_length=20, blank=True)
    barcode = models.CharField(max_length=100, blank=True)
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cost_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    attributes = models.JSONField(default=dict, blank=True, help_text="Colour, size, flavour, etc.")

    class Meta:
        ordering = ["product", "name"]

    def __str__(self):
        return f"{self.product.name} - {self.name}"


class PriceList(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    default_discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class ProductPriceOverride(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="price_overrides"
    )
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE, null=True, blank=True,
        related_name="price_overrides",
    )
    price_list = models.ForeignKey(
        PriceList, on_delete=models.CASCADE, null=True, blank=True,
        related_name="overridden_prices",
    )
    branch = models.ForeignKey(
        "branches.Branch",
        on_delete=models.CASCADE, null=True, blank=True,
        related_name="price_overrides",
    )
    override_price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        unique_together = ("product", "variant", "price_list", "branch")

    def __str__(self):
        return f"{self.product.sku} @ {self.override_price}"
