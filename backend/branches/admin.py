from django.contrib import admin
from .models import Branch, Register


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "is_headquarters", "is_active", "city", "country")
    list_filter = ("is_active", "is_headquarters", "country")
    search_fields = ("name", "code", "phone", "email")


@admin.register(Register)
class RegisterAdmin(admin.ModelAdmin):
    list_display = ("name", "branch", "terminal_id", "status", "current_cashier", "current_balance")
    list_filter = ("status",)
    search_fields = ("name", "terminal_id")

