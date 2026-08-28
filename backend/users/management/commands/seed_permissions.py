"""
Seed the 72 Permission rows (12 modules x 6 actions) and sensible
default RolePermission grants for every role, into either the public schema
or the demo tenant schema.

Usage:
    python manage.py seed_permissions            # seeds demo tenant
    python manage.py seed_permissions --public   # seeds public schema only
"""
from django.core.management.base import BaseCommand
from django_tenants.utils import tenant_context

from tenants.models import Client
from users.models import User, Permission, RolePermission


# -- Static configuration --------------------------------------------------

MODULES = [code for code, _ in Permission.MODULE_CHOICES]
ACTIONS = [code for code, _ in Permission.ACTION_CHOICES]

# Human descriptions for every module (used for the `description` field)
MODULE_DESC = {
    "products": "Manage product catalog, categories, brands, units, variants",
    "inventory": "Manage stock items, movements, transfers, counts, adjustments",
    "sales": "Process sales, manage discounts, taxes, refunds",
    "payments": "Record and manage customer payments and refunds",
    "customers": "Manage customers, groups, loyalty, interactions",
    "suppliers": "Manage suppliers and supplier-product mappings",
    "purchasing": "Create and manage purchase orders and goods receipts",
    "accounting": "Chart of accounts, journal entries, expenses, invoices",
    "reports": "View and run sales, inventory, and financial reports and exports",
    "analytics": "View dashboards, KPIs, and deep-dive analytics",
    "staff": "Manage staff users, roles, and permissions",
    "branches": "Manage branches and POS registers",
    "settings": "Manage tenant/business settings and branding",
}

ACTION_DESC = {
    "view": "View / list records",
    "create": "Create new records",
    "edit": "Edit existing records",
    "delete": "Delete records",
    "approve": "Approve / reject workflow documents",
    "export": "Export data to CSV / PDF",
}


def default_grants():
    """Return {role: set_of_module_names} mapping for default policy.

    coarse-grained default role → module-level grants.  The seed command will
    expand these to include view + create/edit etc. per the per-role
    additional_action_map below.
    """
    return {
        # super_admin / tenant_admin: every permission on every module
        "super_admin": "ALL",
        "tenant_admin": "ALL",

        # Manager: operative modules incl. approve but not staff deletion
        "manager": "ALL",

        # Cashier: front-of-house only — sales, customers, payments, reports(view), analytics(view)
        "cashier": {"sales", "customers", "payments", "reports", "analytics"},

        # Inventory clerk: inventory + products(view/create/edit) + purchasing(view)
    "inventory_clerk": {"inventory", "products", "purchasing", "analytics"},
        # Accountant: accounting + payments + reports
    "accountant": {"accounting", "payments", "reports", "customers", "analytics"},
        # Sales associate: sales + customers, limited inventory view
    "sales_associate": {"sales", "customers", "products", "analytics"},
        # Viewer: view-only across the board
        "viewer": {"products", "inventory", "sales", "payments", "customers",
                   "suppliers", "purchasing", "accounting", "reports"},
    }


# Extra actions beyond "view" that each role gets (applied per granted module)
def role_actions(role: str) -> set:
    """Return the set of actions a role receives for each granted module."""
    if role in ("super_admin", "tenant_admin", "manager"):
        return set(ACTIONS)  # full power
    if role == "cashier":
        return {"view", "create"}
    if role == "inventory_clerk":
        return {"view", "create", "edit"}
    if role == "accountant":
        return {"view", "create", "edit", "export"}
    if role == "sales_associate":
        return {"view", "create"}
    # viewer
    return {"view", "export"}


# Extra exceptions the manager role *shouldn't* get (admin-only)
MANAGER_RESTRICT = {"staff": {"delete"}}


class Command(BaseCommand):
    help = "Seed Permission and RolePermission tables with default data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--public",
            action="store_true",
            help="Seed the public schema only (default: demo tenant)",
        )

    # ----------------------------------------------------------------- #

    def handle(self, *args, **options):
        if options["public"]:
            self._seed()
        else:
            tenant = Client.objects.get(schema_name="demo")
            with tenant_context(tenant):
                self._seed()

    # ----------------------------------------------------------------- #

    def _seed(self):
        # 1. Create the 72 Permission rows
        perms = {}
        created_perms = 0
        for module in MODULES:
            for action in ACTIONS:
                perm, created = Permission.objects.get_or_create(
                    module=module,
                    action=action,
                    defaults={"description": f"{MODULE_DESC[module]} — {ACTION_DESC[action]}"},
                )
                perms[(module, action)] = perm
                if created:
                    created_perms += 1

        self.stdout.write(
            self.style.SUCCESS(f"Permissions: {created_perms} new ({Permission.objects.count()} total)")
        )

        # 2. Create default RolePermission grants
        grants = default_grants()
        created_rp = 0
        for role, _label in User.Role.choices:
            modules = grants.get(role, set())
            actions_for = role_actions(role)
            restrict = MANAGER_RESTRICT if role == "manager" else {}

            for module in MODULES:
                if modules != "ALL" and module not in modules:
                    continue

                module_restrictions = restrict.get(module, set())
                for action_name in actions_for:
                    if action_name in module_restrictions:
                        continue
                    _, created = RolePermission.objects.get_or_create(
                        role=role,
                        permission=perms[(module, action_name)],
                    )
                    if created:
                        created_rp += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"RolePermissions: {created_rp} new ({RolePermission.objects.count()} total)"
            )
        )
        self.stdout.write(self.style.SUCCESS("✓ Seed complete!"))
