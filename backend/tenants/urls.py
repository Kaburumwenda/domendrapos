from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ClientViewSet, TenantOnboardingView, TenantSettingsView

router = DefaultRouter()
router.register(r"manage", ClientViewSet, basename="client")
router.register(r"onboard", TenantOnboardingView, basename="onboarding")

# Tenant self-service settings (tenant-scoped, authenticated)
tenant_settings = TenantSettingsView.as_view({
    "get": "me",
    "patch": "update_settings",
})

urlpatterns = [
    path("", include(router.urls)),
    path("me/", tenant_settings, name="tenant-settings-me"),
    path("settings/", tenant_settings, name="tenant-settings-update"),
]
