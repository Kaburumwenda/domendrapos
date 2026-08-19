from django.contrib import admin
from .models import SubscriptionPlan, Invoice, PaymentRecord, UsageMetric


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "billing_cycle", "max_branches", "max_users", "is_active")


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "tenant", "amount", "total", "status", "issue_date", "due_date")
    list_filter = ("status",)


@admin.register(PaymentRecord)
class PaymentRecordAdmin(admin.ModelAdmin):
    list_display = ("invoice", "amount", "method", "paid_at")


@admin.register(UsageMetric)
class UsageMetricAdmin(admin.ModelAdmin):
    list_display = ("tenant", "metric_type", "count", "period_start", "period_end")

