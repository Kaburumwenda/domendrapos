from django.contrib import admin
from .models import Supplier, SupplierProduct


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("supplier_code", "name", "contact_person", "email", "phone", "is_active", "rating")
    list_filter = ("is_active", "country")
    search_fields = ("supplier_code", "name", "email", "phone")


@admin.register(SupplierProduct)
class SupplierProductAdmin(admin.ModelAdmin):
    list_display = ("supplier", "product", "supplier_sku", "supplier_price", "is_preferred")
    list_filter = ("is_preferred", "supplier")

