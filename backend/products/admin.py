from django.contrib import admin
from .models import Category, Product, ProductVariant, PriceList, ProductPriceOverride


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("sku", "name", "category", "retail_price", "cost_price", "tax_rate", "is_active")
    list_filter = ("is_active", "category", "product_type")
    search_fields = ("sku", "barcode", "name", "brand")
    inlines = [ProductVariantInline]


@admin.register(PriceList)
class PriceListAdmin(admin.ModelAdmin):
    list_display = ("name", "default_discount_percent", "is_active")


@admin.register(ProductPriceOverride)
class ProductPriceOverrideAdmin(admin.ModelAdmin):
    list_display = ("product", "variant", "price_list", "branch", "override_price")

