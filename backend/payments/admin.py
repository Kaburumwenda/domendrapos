from django.contrib import admin
from .models import Payment, PaymentRefund


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("payment_number", "sale", "method", "amount", "status", "processed_at")
    list_filter = ("method", "status")
    search_fields = ("payment_number", "gateway_transaction_id")


@admin.register(PaymentRefund)
class PaymentRefundAdmin(admin.ModelAdmin):
    list_display = ("original_payment", "refund", "amount", "created_at")

