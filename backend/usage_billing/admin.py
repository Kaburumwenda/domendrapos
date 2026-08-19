from django.contrib import admin

from .models import BillingRate, DailyUsage, MonthlyBill, BillingCoupon
from .payment_models import PaymentGatewayConfig, TenantWallet, WalletTransaction, MpesaTransaction


@admin.register(BillingRate)
class BillingRateAdmin(admin.ModelAdmin):
    list_display = ("requests_per_unit", "unit_cost", "currency", "effective_from", "is_active")
    list_filter = ("is_active", "currency")
    search_fields = ("currency", "notes")


@admin.register(DailyUsage)
class DailyUsageAdmin(admin.ModelAdmin):
    list_display = ("tenant", "date", "request_count", "last_updated")
    list_filter = ("date",)
    search_fields = ("tenant__name", "tenant__schema_name")


@admin.register(MonthlyBill)
class MonthlyBillAdmin(admin.ModelAdmin):
    list_display = ("tenant", "period_label", "total_requests", "amount", "status", "due_date")
    list_filter = ("status", "year", "month")
    search_fields = ("tenant__name", "tenant__schema_name")


@admin.register(BillingCoupon)
class BillingCouponAdmin(admin.ModelAdmin):
    list_display = ("code", "discount_type", "discount_value", "max_uses", "times_used", "is_active")
    list_filter = ("is_active", "discount_type")
    search_fields = ("code", "description")


@admin.register(PaymentGatewayConfig)
class PaymentGatewayConfigAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "stk_push_url", "confirm_url")


@admin.register(TenantWallet)
class TenantWalletAdmin(admin.ModelAdmin):
    list_display = ("tenant", "balance", "currency")


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ("wallet", "type", "amount", "balance_after", "reason", "created_at")
    list_filter = ("type",)


@admin.register(MpesaTransaction)
class MpesaTransactionAdmin(admin.ModelAdmin):
    list_display = ("tenant", "purpose", "amount", "currency", "status", "created_at")
    list_filter = ("status", "purpose")
    search_fields = ("tenant__name", "phone", "checkout_request_id")
