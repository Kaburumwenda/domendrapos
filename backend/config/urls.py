"""
URL configuration for DomendraPOS.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from users.serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # JWT auth
    path("api/auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/", include("users.urls")),

    # API documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url="/api/schema/"), name="swagger"),
    path("api/redoc/", SpectacularRedocView.as_view(url="/api/schema/"), name="redoc"),

    # Public tenant management endpoints (not tenant-scoped)
    path("api/tenants/", include("tenants.urls")),
    path("api/billing/", include("billing.urls")),

    # Tenant-scoped endpoints
    path("api/users/", include("users.urls")),
    path("api/branches/", include("branches.urls")),
    path("api/products/", include("products.urls")),
    path("api/inventory/", include("inventory.urls")),
    path("api/pos/", include("pos.urls")),
    path("api/sales/", include("sales.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/customers/", include("customers.urls")),
    path("api/suppliers/", include("suppliers.urls")),
    path("api/purchasing/", include("purchasing.urls")),
    path("api/accounting/", include("accounting.urls")),
    path("api/reports/", include("reports.urls")),
    path("api/audit/", include("audit.urls")),
    path("api/usage-billing/", include("usage_billing.urls")),
    path("api/security/", include("security.urls")),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
