from django.contrib import admin
from .models import ActiveLogin


@admin.register(ActiveLogin)
class ActiveLoginAdmin(admin.ModelAdmin):
    list_display = (
        "user_email",
        "user_role",
        "ip_address",
        "is_active",
        "login_time",
        "expires_at",
    )
    list_filter = ("is_active", "user_role")
    search_fields = ("user_email", "ip_address", "user_name")
    ordering = ("-login_time",)
