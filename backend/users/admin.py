from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Permission, RolePermission


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "email", "first_name", "last_name", "role",
        "is_active_employee", "default_branch_id",
    )
    list_filter = ("role", "is_active_employee", "is_staff", "is_superuser")
    search_fields = ("email", "first_name", "last_name", "employee_id")
    ordering = ("-date_joined",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal", {"fields": ("first_name", "last_name", "phone", "avatar", "employee_id", "hire_date", "termination_date")}),
        ("Role", {"fields": ("role", "default_branch_id", "is_active_employee", "target_schema")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "first_name", "last_name", "role", "password1", "password2"),
        }),
    )


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ("module", "action", "description")
    list_filter = ("module", "action")
    search_fields = ("description",)


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ("role", "permission")
    list_filter = ("role",)

