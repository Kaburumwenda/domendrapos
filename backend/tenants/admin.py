from django.contrib import admin
from django_tenants.admin import TenantAdminMixin
from .models import Client, Domain


@admin.register(Client)
class ClientAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = (
        "name", "schema_name", "plan", "status", "on_trial", "created_on",
    )
    list_filter = ("plan", "status")
    search_fields = ("name", "schema_name", "contact_email")


@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ("domain", "tenant", "is_primary")
    list_filter = ("is_primary",)
    search_fields = ("domain", "tenant__name")


