from django.contrib import admin
from .models import ChartOfAccounts, JournalEntry, JournalLine, Expense, TaxPayment


class JournalLineInline(admin.TabularInline):
    model = JournalLine
    extra = 1


@admin.register(ChartOfAccounts)
class ChartOfAccountsAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "account_type", "is_active")
    list_filter = ("account_type", "is_active")
    search_fields = ("code", "name")


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ("entry_number", "date", "status", "reference")
    list_filter = ("status",)
    inlines = [JournalLineInline]


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("expense_number", "date", "category", "amount", "tax", "cost_price", "retail_price", "payment_method", "status", "branch")
    list_filter = ("category", "branch", "status", "payment_method")


@admin.register(TaxPayment)
class TaxPaymentAdmin(admin.ModelAdmin):
    list_display = ("tax", "period_start", "period_end", "total_collected", "amount_remitted")

