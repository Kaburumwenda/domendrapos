from django.contrib import admin
from .models import PurchaseOrder, PurchaseOrderLine, GoodsReceipt, GoodsReceiptLine


class PurchaseOrderLineInline(admin.TabularInline):
    model = PurchaseOrderLine
    extra = 1


class GoodsReceiptLineInline(admin.TabularInline):
    model = GoodsReceiptLine
    extra = 1


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ("po_number", "supplier", "branch", "status", "grand_total", "order_date")
    list_filter = ("status", "branch", "supplier")
    search_fields = ("po_number",)
    inlines = [PurchaseOrderLineInline]


@admin.register(GoodsReceipt)
class GoodsReceiptAdmin(admin.ModelAdmin):
    list_display = ("grn_number", "po", "branch", "received_date", "received_by")
    inlines = [GoodsReceiptLineInline]

