"""
Seed demo POS transactions for the last 3 months.
Usage: python manage.py seed_pos_sales [--months 3] [--per-day 8]
Creates realistic POS transactions with backdated timestamps, varied payment
methods, random products, discounts, and occasional voided/refunded statuses.
"""
import random
from decimal import Decimal
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction as db_transaction
from django_tenants.utils import tenant_context
from tenants.models import Client
from branches.models import Branch
from products.models import Product
from users.models import User
from pos.models import POSTransaction, POSTransactionItem


PAYMENT_WEIGHTS = [
    ("cash", 45),
    ("mpesa", 25),
    ("card", 15),
    ("insurance", 8),
    ("credit", 5),
    ("bank_transfer", 2),
]

CUSTOMER_NAMES = [
    "Walk-in", "Walk-in", "Walk-in", "Walk-in", "Walk-in",
    "John Doe", "Jane Smith", "Bob Johnson", "Alice Williams",
    "Charlie Brown", "Emily Davis", "Frank Miller", "Grace Lee",
    "Henry Wilson", "Isabel Garcia", "James Taylor", "Karen White",
]

VOID_CHANCE = 0.03
REFUND_CHANCE = 0.02
PENDING_CHANCE = 0.01


class Command(BaseCommand):
    help = "Seed demo POS transactions for the last N months"

    def add_arguments(self, parser):
        parser.add_argument("--months", type=int, default=3, help="Number of months to seed (default 3)")
        parser.add_argument("--per-day", type=int, default=8, help="Average transactions per day (default 8)")
        parser.add_argument("--schema", type=str, default=None, help="Tenant schema name (default: all tenants)")

    def handle(self, *args, **options):
        months = options["months"]
        per_day_avg = options["per_day"]
        schema = options.get("schema")

        if schema:
            tenants = Client.objects.filter(schema_name=schema)
        else:
            tenants = Client.objects.exclude(schema_name="public")

        if not tenants.exists():
            self.stdout.write(self.style.ERROR("No tenants found."))
            return

        total_created = 0
        for tenant in tenants:
            self.stdout.write(f"\nSeeding POS sales for tenant: {tenant.name} ({tenant.schema_name})")
            with tenant_context(tenant):
                created = self._seed_tenant(months, per_day_avg)
                total_created += created
                self.stdout.write(f"  Created {created} POS transactions")

        self.stdout.write(self.style.SUCCESS(f"\nDone! Total: {total_created} POS transactions across {tenants.count()} tenant(s)."))

    def _seed_tenant(self, months: int, per_day_avg: int) -> int:
        branches = list(Branch.objects.filter(is_active=True))
        if not branches:
            self.stdout.write(self.style.WARNING("  No active branches — skipping."))
            return 0

        cashiers = list(User.objects.filter(role="cashier", is_active_employee=True))
        all_users = list(User.objects.exclude(role="super_admin"))
        if not cashiers:
            cashiers = all_users or list(User.objects.all())
        if not cashiers:
            self.stdout.write(self.style.WARNING("  No users found — skipping."))
            return 0

        products = list(
            Product.objects.filter(is_active=True, is_sellable=True).exclude(retail_price=0)
        )
        if not products:
            self.stdout.write(self.style.WARNING("  No sellable products — skipping."))
            return 0

        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=months * 30)

        existing_count = POSTransaction.objects.count()
        created = 0
        current_date = start_date
        tx_seq = self._max_seq_for_date(end_date) + 1

        while current_date <= end_date:
            is_weekend = current_date.weekday() >= 5
            weekday_multiplier = 0.6 if is_weekend else 1.0
            day_count = max(1, int(random.gauss(per_day_avg * weekday_multiplier, per_day_avg * 0.3)))

            for _ in range(day_count):
                branch = random.choice(branches)
                cashier = random.choice(cashiers)
                hour = random.choices(
                    [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
                    weights=[3, 5, 8, 10, 12, 10, 8, 9, 7, 6, 5, 3],
                )[0]
                minute = random.randint(0, 59)

                dt = datetime(
                    current_date.year, current_date.month, current_date.day,
                    hour, minute, second=random.randint(0, 59),
                    tzinfo=timezone.get_current_timezone(),
                )

                tx_seq += 1
                tx = self._make_transaction(
                    seq=tx_seq,
                    date_str=dt.strftime("%Y%m%d"),
                    dt=dt,
                    branch=branch,
                    cashier=cashier,
                    products=products,
                    existing_count=existing_count + created,
                )
                if tx:
                    created += 1
                    if created % 100 == 0:
                        self.stdout.write(f"    ...{created} transactions created")

            current_date += timedelta(days=1)

        return created

    def _max_seq_for_date(self, end_date) -> int:
        prefix = f"POS-{end_date.strftime('%Y%m%d')}-"
        existing = POSTransaction.objects.filter(transaction_number__startswith=prefix)
        if existing.exists():
            last = existing.order_by("-transaction_number").first()
            try:
                return int(last.transaction_number.split("-")[-1])
            except (ValueError, IndexError):
                return 0
        return 0

    def _make_transaction(
        self, seq: int, date_str: str, dt, branch, cashier, products, existing_count: int
    ) -> POSTransaction | None:
        # 1-6 items per transaction
        num_items = random.choices([1, 2, 3, 4, 5, 6], weights=[20, 25, 20, 15, 10, 5])[0]
        chosen = random.sample(products, min(num_items, len(products)))

        items_data = []
        subtotal = Decimal("0")
        for prod in chosen:
            price = prod.retail_price
            qty = Decimal(str(random.choices([1, 1, 1, 2, 2, 3, 4, 5], k=1)[0]))
            line_total = (price * qty).quantize(Decimal("0.01"))
            items_data.append({
                "product": prod,
                "name": prod.name,
                "qty": qty,
                "price": price,
                "line_total": line_total,
            })
            subtotal += line_total

        # Discount
        discount = Decimal("0")
        roll = random.random()
        if roll < 0.15:
            discount_pct = Decimal(str(random.choice([5, 10, 15])))
            discount = (subtotal * discount_pct / 100).quantize(Decimal("0.01"))
        elif roll < 0.22:
            discount = Decimal(str(random.choice([50, 100, 200, 500]))).quantize(Decimal("0.01"))
            if discount > subtotal:
                discount = subtotal

        taxable = subtotal - discount
        tax_rate = branch.tax_rate or Decimal("0")
        if not tax_rate:
            tax_rate = Decimal("16")
        tax = (taxable * tax_rate / 100).quantize(Decimal("0.01"))
        total = (taxable + tax).quantize(Decimal("0.01"))

        payment_method = random.choices(
            [m for m, _ in PAYMENT_WEIGHTS],
            weights=[w for _, w in PAYMENT_WEIGHTS],
        )[0]

        customer_name = random.choice(CUSTOMER_NAMES)
        customer_phone = ""
        if customer_name != "Walk-in":
            customer_phone = f"07{random.randint(10000000, 99999999)}"

        payment_ref = ""
        if payment_method == "mpesa":
            payment_ref = f"M-Pesa: 07{random.randint(10000000, 99999999)}"
        elif payment_method == "card":
            payment_ref = f"Card: {random.randint(1000, 9999)}"
        elif payment_method == "insurance":
            payment_ref = f"Insurance: Provider {random.choice(['A', 'B', 'C'])} / MEM{random.randint(1000, 9999)}"
        elif payment_method == "credit":
            payment_ref = f"Due: {(dt + timedelta(days=30)).strftime('%Y-%m-%d')}"

        status_roll = random.random()
        status = "completed"
        if status_roll < PENDING_CHANCE:
            status = "pending"
        elif status_roll < PENDING_CHANCE + VOID_CHANCE:
            status = "voided"
        elif status_roll < PENDING_CHANCE + VOID_CHANCE + REFUND_CHANCE:
            status = "refunded"

        number = f"POS-{date_str}-{seq:04d}"

        if POSTransaction.objects.filter(transaction_number=number).exists():
            number = f"POS-{date_str}-{existing_count + seq:05d}"

        with db_transaction.atomic():
            tx = POSTransaction(
                transaction_number=number,
                branch=branch,
                cashier=cashier,
                customer_name=customer_name,
                customer_phone=customer_phone,
                subtotal=subtotal,
                discount=discount,
                tax=tax,
                total=total,
                payment_method=payment_method,
                payment_reference=payment_ref,
                status="completed" if status != "voided" else "completed",
            )
            # Set created_at via update to override auto_now_add
            tx.save()
            POSTransaction.objects.filter(pk=tx.pk).update(created_at=dt, updated_at=dt)

            for item in items_data:
                POSTransactionItem.objects.create(
                    transaction=tx,
                    product=item["product"],
                    product_name=item["name"],
                    quantity=item["qty"],
                    unit_price=item["price"],
                    line_total=item["line_total"],
                )

            if status == "voided":
                POSTransaction.objects.filter(pk=tx.pk).update(status="voided")
            elif status == "refunded":
                POSTransaction.objects.filter(pk=tx.pk).update(status="refunded")

        return tx
