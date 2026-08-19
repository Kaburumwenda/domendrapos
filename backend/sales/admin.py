from django.contrib import admin
from .models import Sale, SaleLine, Refund, RefundLine, Discount, Tax


class SaleLineInline(admin.TabularInline):
    model = SaleLine
    extra = 1
    readonly_fields = ("line_total", "tax_amount")


class RefundLineInline(admin.TabularInline):
    model = RefundLine
    extra = 1


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ("receipt_number", "branch", "cashier", "customer", "grand_total", "status", "sale_date")
    list_filter = ("status", "branch", "sale_date")
    search_fields = ("receipt_number",)
    inlines = [SaleLineInline]


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ("refund_number", "original_sale", "total_amount", "status", "created_at")
    list_filter = ("status",)
    inlines = [RefundLineInline]


@admin.register(Discount)
class DiscountAdmin(admin.ModelAdmin):
    list_display = ("name", "discount_type", "value", "valid_from", "valid_until", "is_active")
    list_filter = ("is_active", "discount_type")


@admin.register(Tax)
class TaxAdmin(admin.ModelAdmin):
    list_display = ("name", "rate", "is_compound", "is_active")
    list_filter = ("is_active", "is_compound")

