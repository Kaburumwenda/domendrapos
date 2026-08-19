from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("user_email", "action", "resource_type", "resource_id", "timestamp")
    list_filter = ("action", "resource_type")
    search_fields = ("description", "resource_id", "user_email")
    readonly_fields = ("user_email", "user_id", "action", "resource_type", "resource_id",
                       "description", "old_values", "new_values", "ip_address", "user_agent", "timestamp")

