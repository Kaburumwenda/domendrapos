"""
Seed demonstration AuditLog entries into the demo tenant schema so the
Audit Logs page has meaningful data on first load.

Usage: python manage.py seed_audit_logs
"""
import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model

from django_tenants.utils import tenant_context

from tenants.models import Client
from audit.models import AuditLog

User = get_user_model()

# (action, resource_type, description_template) tuples
SAMPLE_EVENTS = [
    ("login", "User", "User logged in"),
    ("create", "Product", "Created a new product"),
    ("update", "Product", "Updated product price"),
    ("create", "Customer", "Registered a new customer"),
    ("create", "POSTransaction", "Completed a POS sale"),
    ("void", "POSTransaction", "Voided a sale"),
    ("create", "PurchaseOrder", "Issued a purchase order"),
    ("approve", "PurchaseOrder", "Approved a purchase order"),
    ("receive", "GoodsReceipt", "Received goods against PO"),  # will be coerced to "update"
    ("create", "StockAdjustment", "Created a stock adjustment"),
    ("approve", "StockAdjustment", "Approved a stock adjustment"),
    ("void", "Sale", "Voided a sale"),
    ("refund", "Refund", "Processed a customer refund"),
    ("create", "Expense", "Recorded an operating expense"),
    ("approve", "Expense", "Approved an expense"),
    ("export", "Report", "Exported a report"),
    ("update", "Customer", "Updated customer profile"),
    ("create", "Branch", "Added a branch"),
    ("update", "Client", "Updated tenant branding"),
    ("config_change", "Client", "Updated tenant settings"),
    ("logout", "User", "User logged out"),
    ("create", "CustomerInvoice", "Issued an invoice"),
    ("update", "CustomerInvoice", "Recorded an invoice payment"),
    ("update", "POSShift", "Opened a cashier shift"),
    ("update", "POSShift", "Closed a cashier shift"),
]


# Coerce actions that don't match ACTION_CHOICES to closest valid value
ACTION_COMPLIANT = {
    "receive": "update",
    "open": "update",
    "close": "update",
}


class Command(BaseCommand):
    help = "Seed demo AuditLog entries into the demo tenant schema"

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=14, help="Days of history to populate")
        parser.add_argument("--count", type=int, default=180, help="Total entries to create")

    def handle(self, *args, **options):
        tenant = Client.objects.get(schema_name="demo")
        days_span = options["days"]
        total = options["count"]

        with tenant_context(tenant):
            # Get staff email(s) to use as actors
            emails = list(User.objects.values_list("email", flat=True))
            if not emails:
                emails = ["admin@demo.com"]

            created = 0
            now = timezone.now()

            for i in range(total):
                action, resource_type, desc = random.choice(SAMPLE_EVENTS)
                compliant_action = ACTION_COMPLIANT.get(action, action)

                # Random timestamp within the last N days
                offset_seconds = random.uniform(0, days_span * 24 * 3600)
                ts = now - timedelta(seconds=offset_seconds)

                AuditLog.objects.create(
                    user_email=random.choice(emails),
                    user_id=random.randint(1, 10),
                    action=compliant_action,
                    resource_type=resource_type,
                    resource_id=str(random.randint(1, 500)) if resource_type != "User" else "",
                    description=desc,
                    ip_address=f"192.168.1.{random.randint(2, 254)}",
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) DomendraPOS/1.0",
                )
                created += 1

            self.stdout.write(
                self.style.SUCCESS(f"✓ Created {created} demo audit log entries (last {days_span} days)")
            )
