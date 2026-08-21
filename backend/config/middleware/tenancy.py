"""
Custom tenant middleware for DomendraPOS.

In production, each tenant gets a subdomain (e.g., acme.domendrapos.com).
For local development, localhost and 127.0.0.1 resolve to the 'demo' tenant.

Additionally, public endpoints (/api/tenants/, /api/billing/, /admin/) 
run on the public schema.
"""

from django_tenants.middleware.main import TenantMainMiddleware
from django_tenants.utils import get_public_schema_name
from django.conf import settings


class DomendraPOSTenantMiddleware(TenantMainMiddleware):
    """
    Extends django-tenants middleware to:
    - Map localhost / 127.0.0.1 to the 'demo' tenant in development
    - Allow public-schema routes to bypass tenant resolution
    """

    # Routes whose models live in the PUBLIC schema but need the tenant
    # resolved from the hostname (so the view knows which tenant to query).
    # These prefixes get schema=public but still get request.tenant set.
    TENANT_AWARE_PUBLIC_PREFIXES = (
        "/api/usage-billing/",
    )

    # Routes that are fully public (no tenant resolution at all).
    PUBLIC_PREFIXES = (
        "/admin/",
        "/api/tenants/onboard",
        "/api/tenants/manage",
        "/api/billing/",
        "/api/auth/",
        "/api/security/",
        "/api/schema/",
        "/api/docs/",
        "/api/redoc/",
        "/__debug__/",
    )

    def process_request(self, request):
        from django.db import connection

        path = request.path

        # Tenant-aware public routes: set public schema but resolve the tenant
        if any(path.startswith(prefix) for prefix in self.TENANT_AWARE_PUBLIC_PREFIXES):
            connection.set_schema_to_public()
            self._resolve_tenant_for_request(request)
            return None

        # Fully-public routes: set public schema, no tenant resolution
        if any(path.startswith(prefix) for prefix in self.PUBLIC_PREFIXES):
            connection.set_schema_to_public()
            return None

        hostname = request.get_host().split(":")[0]

        # Resolve the tenant from the JWT `schema` claim when present.
        # This covers both localhost AND production API hostnames (e.g.
        # domendraapi.tiktek-ex.com) that are not themselves tenant domains.
        schema = self._resolve_schema_from_jwt(request)
        if schema:
            from tenants.models import Client
            try:
                tenant = Client.objects.get(schema_name=schema)
                request.tenant = tenant
                connection.set_tenant(tenant)
                return None
            except Client.DoesNotExist:
                pass

        # Development fallback: localhost/127.0.0.1 requests map to the demo
        # tenant when no JWT schema is available.
        # 10.0.2.2 is the Android emulator's alias for the host machine's localhost.
        if hostname in ("localhost", "127.0.0.1", "0.0.0.0", "10.0.2.2"):
            from tenants.models import Domain
            domain = Domain.objects.filter(
                domain__in=["demo.localhost", "localhost"]
            ).first()
            if domain:
                request.tenant = domain.tenant
                connection.set_tenant(request.tenant)
                return None

        # Fall back to default tenant resolution
        return super().process_request(request)

    @staticmethod
    def _resolve_schema_from_jwt(request):
        """Extract the schema claim from the Authorization header JWT.
        Returns the schema name or None if the token is missing/invalid/has no schema.
        Does NOT verify the token — that's the view's job. We only read the claim
        for routing.
        """
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            return None
        token_str = auth_header[7:]
        try:
            from jwt import decode as jwt_decode
            decoded = jwt_decode(token_str, options={"verify_signature": False})
            return decoded.get("schema") or None
        except Exception:
            return None

    def _resolve_tenant_for_request(self, request):
        """Resolve the tenant from the hostname and set request.tenant,
        without switching the schema (stays on public for these routes)."""
        from tenants.models import Domain
        hostname = request.get_host().split(":")[0]
        domain = None
        if hostname in ("localhost", "127.0.0.1", "0.0.0.0", "10.0.2.2"):
            domain = Domain.objects.filter(
                domain__in=["demo.localhost", "localhost"]
            ).first()
        else:
            domain = Domain.objects.filter(domain=hostname).first()
        if domain:
            request.tenant = domain.tenant
