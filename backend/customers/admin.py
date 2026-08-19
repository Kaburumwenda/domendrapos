from django.contrib import admin
from .models import Customer, CustomerGroup, CustomerInteraction


class CustomerInteractionInline(admin.TabularInline):
    model = CustomerInteraction
    extra = 1
    readonly_fields = ("created_at",)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("customer_code", "full_name", "email", "phone", "loyalty_tier", "is_active")
    list_filter = ("customer_type", "is_active", "loyalty_tier", "country")
    search_fields = ("customer_code", "first_name", "last_name", "company_name", "email", "phone")
    inlines = [CustomerInteractionInline]


@admin.register(CustomerGroup)
class CustomerGroupAdmin(admin.ModelAdmin):
    list_display = ("name", "discount_percent")
    filter_horizontal = ("customers",)


@admin.register(CustomerInteraction)
class CustomerInteractionAdmin(admin.ModelAdmin):
    list_display = ("customer", "interaction_type", "subject", "handled_by", "created_at")
    list_filter = ("interaction_type",)

