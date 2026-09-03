from django.contrib import admin
from .models import (
    StockItem, StockMovement, StockTransfer,
    StockTransferLine, StockCount, StockCountLine,
    StockAdjustment, StockAdjustmentLine,
)


class StockTransferLineInline(admin.TabularInline):
    model = StockTransferLine
    extra = 1


class StockCountLineInline(admin.TabularInline):
    model = StockCountLine
    extra = 1


@admin.register(StockItem)
class StockItemAdmin(admin.ModelAdmin):
    list_display = ("product", "variant", "branch", "quantity_on_hand", "reorder_level", "needs_reorder")
    list_filter = ("branch",)
    search_fields = ("product__sku", "product__name")


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ("product", "branch", "movement_type", "quantity_change", "quantity_after", "performed_by", "created_at")
    list_filter = ("movement_type", "branch")
    search_fields = ("product__sku", "reference")


@admin.register(StockTransfer)
class StockTransferAdmin(admin.ModelAdmin):
    list_display = ("transfer_number", "from_branch", "to_branch", "status", "created_at")
    list_filter = ("status",)
    inlines = [StockTransferLineInline]


@admin.register(StockCount)
class StockCountAdmin(admin.ModelAdmin):
    list_display = ("count_number", "title", "branch", "count_type", "status", "scheduled_date", "total_items", "total_variance_qty", "total_variance_value")
    list_filter = ("status", "count_type", "branch")
    search_fields = ("count_number", "title")
    inlines = [StockCountLineInline]
    date_hierarchy = "scheduled_date"


class StockAdjustmentLineInline(admin.TabularInline):
    model = StockAdjustmentLine
    extra = 1


@admin.register(StockAdjustment)
class StockAdjustmentAdmin(admin.ModelAdmin):
    list_display = ("adjustment_number", "branch", "adjustment_type", "reason", "status", "adjustment_date", "total_value_impact")
    list_filter = ("status", "reason", "adjustment_type", "branch")
    search_fields = ("adjustment_number",)
    inlines = [StockAdjustmentLineInline]
    date_hierarchy = "adjustment_date"

