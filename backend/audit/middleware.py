"""
Audit middleware — logs every write action (create / update / delete /
login / logout) to the AuditLog trail for every tenant-scoped API request.

Reads (GET, HEAD, OPTIONS) are skipped to keep the log focused on
security-relevant mutations.
"""

import json

from django.db import connection

from .models import AuditLog

# Map HTTP method → AuditLog action
METHOD_ACTION_MAP = {
    "POST": "create",
    "PUT": "update",
    "PATCH": "update",
    "DELETE": "delete",
}

# Skip audit logging for these path prefixes (pure noise)
SKIP_PREFIXES = ("/api/auth/refresh/", "/api/auth/token/", "/api/audit/")

# Infer AuditLog.resource_type from the URL prefix
URL_PREFIX_RESOURCE = {
    "/api/users/staff": "User",
    "/api/users/permissions": "Permission",
    "/api/users/role-permissions": "RolePermission",
    "/api/products/categories": "Category",
    "/api/products/brands": "Brand",
    "/api/products/units": "Unit",
    "/api/products/variants": "Product",
    "/api/products/price-lists": "PriceList",
    "/api/products/price-overrides": "PriceList",
    "/api/products": "Product",
    "/api/inventory/items": "StockItem",
    "/api/inventory/movements": "StockMovement",
    "/api/inventory/transfers": "StockTransfer",
    "/api/inventory/counts": "StockCount",
    "/api/inventory/adjustments": "StockAdjustment",
    "/api/inventory": "StockItem",
    "/api/pos/transactions": "POSTransaction",
    "/api/pos/parked-sales": "ParkedSale",
    "/api/pos/shifts": "POSShift",
    "/api/pos/credits": "POSCredit",
    "/api/pos": "POSTransaction",
    "/api/sales/refunds": "Refund",
    "/api/sales/discounts": "Discount",
    "/api/sales/taxes": "Tax",
    "/api/sales": "Sale",
    "/api/payments/refunds": "PaymentRefund",
    "/api/payments": "Payment",
    "/api/customers/groups": "CustomerGroup",
    "/api/customers/interactions": "CustomerInteraction",
    "/api/customers": "Customer",
    "/api/suppliers/products": "SupplierProduct",
    "/api/suppliers": "Supplier",
    "/api/purchasing/orders": "PurchaseOrder",
    "/api/purchasing/receipts": "GoodsReceipt",
    "/api/purchasing": "PurchaseOrder",
    "/api/accounting/accounts": "ChartOfAccounts",
    "/api/accounting/journal": "JournalEntry",
    "/api/accounting/expenses": "Expense",
    "/api/accounting/tax-payments": "TaxPayment",
    "/api/accounting/invoices": "CustomerInvoice",
    "/api/accounting": "JournalEntry",
    "/api/branches/registers": "Register",
    "/api/branches": "Branch",
    "/api/reports": "Report",
    "/api/tenants": "Client",
}

# Maps URL path suffix → override action (for workflow endpoints)
ACTION_SUFFIX_MAP = {
    "deactivate": "update",
    "activate": "update",
    "void": "void",
    "approve": "approve",
    "reject": "reject",
    "submit": "update",
    "send": "update",
    "cancel": "void",
    "bulk": "update",
    "close": "update",
    "open": "update",
    "record_payment": "update",
    "receive": "update",
    "reconcile": "update",
    "ship": "update",
    "post_adjustment": "update",
    "low_stock": "view",
    "analytics": "view",
    "summary": "view",
    "matrix": "view",
    "current": "view",
    "payments": "view",
    "add_points": "update",
    "import-excel": "create",
    "export-excel": "export",
    "import-excel-template": "view",
    "parse-excel": "view",
    "bulk-upsert": "create",
}


class AuditMiddleware:
    """Logs write actions to the AuditLog trail."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Capture body before the view consumes it (DRF reads the stream)
        body_text = None
        if request.method in ("POST", "PUT", "PATCH") and request.body:
            try:
                raw = request.body
                if len(raw) < 16_000:
                    body_text = raw.decode("utf-8", errors="replace")
            except Exception:
                body_text = ""

        response = self.get_response(request)

        # Capture the response body so we can extract newly-created IDs
        if (request.method == "POST" and response.status_code in (200, 201)
                and response.get("Content-Type", "").startswith("application/json")):
            try:
                content = response.content
                if content and len(content) < 16_000:
                    request._audit_response_content = content.decode("utf-8", errors="replace")
            except Exception:
                pass

        try:
            self._maybe_log(request, response, body_text)
        except Exception:
            # Audit failures must never break the request
            pass

        return response

    # ----------------------------------------------------------------- #

    def _maybe_log(self, request, response, body_text):
        path = request.path_info or request.path

        # AuditLog is a tenant-scoped model. If we are on the public schema
        # (e.g. /api/auth/login/) and the action is a login, resolve the demo
        # tenant from the request host and write into that schema.
        schema_name = connection.schema_name
        if schema_name == "public":
            # Try to resolve the tenant from the host (just like tenancy middleware)
            try:
                from tenants.models import Domain, Client
                hostname = request.get_host().split(":")[0]
                domain = None
                if hostname in ("localhost", "127.0.0.1"):
                    domain = Domain.objects.filter(
                        domain__in=["demo.localhost", "localhost"]
                    ).first()
                else:
                    domain = Domain.objects.filter(domain=hostname).first()
                if domain:
                    tenant = domain.tenant
                    connection.set_tenant(tenant)
                    try:
                        self._do_log(request, response, path, body_text)
                    finally:
                        connection.set_schema_to_public()
                return
            except Exception:
                return

        # Tenant-scoped path — write directly
        self._do_log(request, response, path, body_text)

    # ----------------------------------------------------------------- #

    def _do_log(self, request, response, path, body_text):
        # Skip non-mutating methods
        if request.method not in METHOD_ACTION_MAP:
            return

        # Skip noise paths
        for prefix in SKIP_PREFIXES:
            if path.startswith(prefix):
                return

        # Special case: auth/login is a POST we DO want to capture as login
        if path == "/api/auth/login/" and request.method == "POST" and response.status_code in (200, 201):
            self._log_login(request, response)
            return

        # Only audit successful mutations (2xx) and client errors (4xx gives
        # insight into failed attempts, but is very noisy — restrict to 2xx)
        if response.status_code < 200 or response.status_code >= 300:
            return

        # Skip if unauthenticated
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return

        # Resolve action and resource
        action = self._resolve_action(request, path)
        resource_type, resource_id = self._resolve_resource(request, path)

        if action == "view":
            return

        description = self._build_description(action, resource_type, resource_id, request.method)

        old_values = None
        new_values = None
        if body_text:
            try:
                parsed = json.loads(body_text)
                if isinstance(parsed, dict):
                    sanitized = {k: v for k, v in parsed.items()
                                 if k.lower() not in ("password", "token", "refresh", "access")}
                    new_values = sanitized
            except Exception:
                pass

        self._write_log(
            request, response, action, resource_type, str(resource_id or ""),
            description, old_values, new_values,
        )

    def _log_login(self, request, response):
        """Special handler for /api/auth/login/ — user object isn't populated
        on the request because DRF's TokenObtainPairView runs anonymously, so
        we extract the user details from the JWT response body."""
        try:
            import jwt as pyjwt
            content = response.content
            data = json.loads(content)
            access_token = data.get("access") or data.get("access_token")
            if not access_token:
                return
            # Decode without verifying — we just need the claims for the audit log
            payload = pyjwt.decode(access_token, options={"verify_signature": False})
            email = payload.get("email", "")
            user_id = payload.get("user_id")
            if isinstance(user_id, str):
                try:
                    user_id = int(user_id)
                except Exception:
                    user_id = None
        except Exception:
            return

        ip = self._client_ip(request)
        ua = request.META.get("HTTP_USER_AGENT", "")[:500]

        AuditLog.objects.create(
            user_email=email,
            user_id=user_id,
            action="login",
            resource_type="User",
            resource_id="",
            description=f"User {email} logged in",
            old_values=None,
            new_values=None,
            ip_address=ip,
            user_agent=ua,
        )

    # ----------------------------------------------------------------- #

    def _resolve_action(self, request, path):
        # Check URL suffix for workflow actions (e.g. /api/sales/5/void/)
        trailing = path.rstrip("/").rsplit("/", 1)[-1]
        if trailing in ACTION_SUFFIX_MAP:
            return ACTION_SUFFIX_MAP[trailing]
        return METHOD_ACTION_MAP.get(request.method, "update")

    def _resolve_resource(self, request, path):
        # Longest matching prefix wins (so /api/products/categories beats /api/products)
        best = None
        for prefix, model_name in URL_PREFIX_RESOURCE.items():
            if path.startswith(prefix):
                if best is None or len(prefix) > len(best[0]):
                    best = (prefix, model_name)

        if not best:
            return ("Unknown", "")

        resource_type = best[1]
        resource_id = ""

        # Extract resource id from path (e.g. /api/users/staff/5/activate -> "5")
        tail = path[len(best[0]):].strip("/")
        parts = tail.split("/") if tail else []
        if parts and parts[0].isdigit():
            resource_id = parts[0]

        # For bulk / collection POSTs, try to extract the newly-created id
        # from the response body (if JSON DRF returns the created object)
        if not resource_id and request.method == "POST":
            resource_id = self._extract_id_from_response(request)

        return (resource_type, resource_id)

    def _extract_id_from_response(self, request):
        content = getattr(request, "_audit_response_content", None)
        if not content:
            return ""
        try:
            data = json.loads(content)
            if isinstance(data, dict) and isinstance(data.get("id"), int):
                return str(data["id"])
        except Exception:
            return ""
        return ""

    def _build_description(self, action, resource_type, resource_id, method):
        verb = action.capitalize()
        if resource_id:
            return f"{verb} {resource_type} #{resource_id}"
        if method == "POST":
            return f"{verb}d a new {resource_type}"
        return f"{verb} {resource_type}"

    def _write_log(self, request, response, action, resource_type,
                   resource_id, description, old_values, new_values):
        user = request.user
        ip = self._client_ip(request)
        ua = request.META.get("HTTP_USER_AGENT", "")[:500]

        AuditLog.objects.create(
            user_email=getattr(user, "email", ""),
            user_id=getattr(user, "id", None),
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            description=description,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip,
            user_agent=ua,
        )

    def _client_ip(self, request):
        xff = request.META.get("HTTP_X_FORWARDED_FOR")
        if xff:
            return xff.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")
