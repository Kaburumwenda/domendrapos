from django.urls import path

from . import views
from . import payment_views

app_name = "usage_billing"

urlpatterns = [
    # Tenant-facing
    path("dashboard/", views.tenant_dashboard, name="tenant-dashboard"),
    path("range/", views.tenant_range_usage, name="tenant-range-usage"),
    path("bills/<int:pk>/", views.tenant_bill_detail, name="tenant-bill-detail"),
    path("billing-status/", views.billing_status, name="billing-status"),
    path("payments/", views.tenant_payments, name="tenant-payments"),
    path("payments/mpesa/initiate/", payment_views.mpesa_initiate, name="mpesa-initiate"),
    path("payments/mpesa/confirm/", payment_views.mpesa_confirm, name="mpesa-confirm"),
    path("payments/wallet/pay-bill/", payment_views.wallet_pay_bill, name="wallet-pay-bill"),
    path("payments/coupon/apply/", views.apply_coupon, name="coupon-apply"),

    # Super admin
    path("admin/payment-config/", views.payment_config, name="admin-payment-config"),
    path("admin/payments/", views.admin_payments, name="admin-payments"),
]
