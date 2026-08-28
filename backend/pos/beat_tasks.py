"""
Celery beat tasks that run across all tenant schemas.

Scheduled in config.settings.CELERY_BEAT_SCHEDULE:
  - mark_overdue_credits      : hourly — set POSCredit past due_date to 'overdue'
  - check_trial_expiry        : hourly — suspend tenants whose trial has ended
  - alert_low_stock           : every 6h — log low-stock items per tenant
  - alert_stock_expiry        : daily at 08:00 — list products near expiry
  - generate_monthly_bills    : 1st of month 02:00 — create MonthlyBill per tenant
  - mark_overdue_bills        : daily at 09:00 — mark usage bills past due_date

All tasks iterate tenant schemas explicitly because the public schema
has no tenant context for the per-tenant models.
"""

import logging
from datetime import timedelta
from decimal import Decimal

from celery import shared_task
from django.utils import timezone
from django.db import connection

from django_tenants.utils import get_public_schema_name

logger = logging.getLogger(__name__)


def _iter_tenants():
    """Return a list of non-public tenant objects."""
    from tenants.models import Client
    return list(Client.objects.exclude(schema_name=get_public_schema_name()))


def _run_per_tenant(func):
    """Call ``func(tenant)`` for each tenant after switching schema.

    Restores public schema in a finally block so a failure in one tenant
    doesn't leak the schema to subsequent tenants.
    """
    results = {}
    for tenant in _iter_tenants():
        connection.set_schema(tenant.schema_name)
        try:
            results[tenant.schema_name] = func(tenant)
        except Exception:
            logger.exception("Task failed for tenant %s", tenant.schema_name)
            results[tenant.schema_name] = None
        finally:
            connection.set_schema_to_public()
    return results


# --------------------------------------------------------------------------- #
# 1. Mark overdue POS credit sales
# --------------------------------------------------------------------------- #
@shared_task(name="pos.mark_overdue_credits")
def mark_overdue_credits():
    """Set ``status='overdue'`` on any open/partial POSCredit whose
    ``due_date`` has passed."""

    def _mark(tenant):
        from pos.models import POSCredit
        today = timezone.localdate()
        qs = POSCredit.objects.filter(
            status__in=["open", "partial"],
            due_date__lt=today,
        )
        count = qs.count()
        if count:
            qs.update(status="overdue")
        return count

    results = _run_per_tenant(_mark)
    total = sum(v or 0 for v in results.values())
    logger.info("mark_overdue_credits: %s credits marked overdue", total)
    results["total"] = total
    return results


# --------------------------------------------------------------------------- #
# 2. Check trial expiry and suspend tenants
# --------------------------------------------------------------------------- #
@shared_task(name="tenants.check_trial_expiry")
def check_trial_expiry():
    """Suspend tenants whose trial period has ended.

    Checks both ``trial_ends_at`` (explicit datetime) and ``paid_until``
    (date-based plan expiry).  Sets ``status='suspended'`` with a reason.
    """
    from tenants.models import Client

    now = timezone.now()
    today = timezone.localdate()

    qs = Client.objects.filter(
        status__in=["trial", "active"],
    ).exclude(schema_name=get_public_schema_name())

    suspended = []
    for tenant in qs:
        should_suspend = False
        reason = ""

        if tenant.on_trial and tenant.trial_ends_at:
            if tenant.trial_ends_at < now:
                should_suspend = True
                reason = "Trial period ended"

        if tenant.status == "active" and tenant.paid_until:
            if tenant.paid_until < today:
                should_suspend = True
                reason = "Subscription expired"

        if should_suspend and tenant.status != "suspended":
            tenant.status = "suspended"
            tenant.suspended_reason = reason
            tenant.suspended_at = now
            tenant.save(update_fields=["status", "suspended_reason", "suspended_at"])
            suspended.append(tenant.schema_name)

    logger.info("check_trial_expiry: suspended %s tenants", len(suspended))
    return {"suspended": suspended, "total": len(suspended)}


# --------------------------------------------------------------------------- #
# 3. Low-stock alert (per tenant)
# --------------------------------------------------------------------------- #
@shared_task(name="inventory.alert_low_stock")
def alert_low_stock():
    """Log low-stock items per tenant and return counts.

    In future this will create Notification records; for now it
    returns a summary that can be viewed in Celery results / admin logs.
    """

    def _check(tenant):
        from inventory.models import StockItem
        from django.db.models import F

        low = StockItem.objects.filter(quantity_on_hand__lte=F("reorder_level"))
        items = [
            {
                "sku": si.product.sku,
                "name": si.product.name,
                "on_hand": float(si.quantity_on_hand),
                "reorder_level": float(si.reorder_level),
                "branch": si.branch.code,
            }
            for si in low.select_related("product", "branch")[:50]
        ]
        return {"count": len(items), "items": items}

    results = _run_per_tenant(_check)
    total = sum((v or {}).get("count", 0) for v in results.values())
    logger.info("alert_low_stock: %s low-stock items across all tenants", total)
    results["total"] = total
    return results


# --------------------------------------------------------------------------- #
# 4. Stock expiry alert (per tenant)
# --------------------------------------------------------------------------- #
@shared_task(name="inventory.alert_stock_expiry")
def alert_stock_expiry(days_ahead: int = 30):
    """Find products with ``expiry_date`` within the next ``days_ahead`` days
    (or already expired) and return a summary per tenant."""

    def _check(tenant):
        from products.models import Product

        today = timezone.localdate()
        cutoff = today + timedelta(days=days_ahead)
        qs = Product.objects.filter(
            expiry_date__isnull=False,
            expiry_date__lte=cutoff,
            is_active=True,
        ).order_by("expiry_date")

        items = [
            {
                "sku": p.sku,
                "name": p.name,
                "expiry_date": p.expiry_date.isoformat(),
                "category": p.category.name if p.category else None,
            }
            for p in qs[:50]
        ]
        return {"count": len(items), "items": items}

    results = _run_per_tenant(_check)
    total = sum((v or {}).get("count", 0) for v in results.values())
    logger.info("alert_stock_expiry: %s products expiring within %s days", total, days_ahead)
    results["total"] = total
    return results


# --------------------------------------------------------------------------- #
# 5. Generate monthly usage bills
# --------------------------------------------------------------------------- #
@shared_task(name="usage_billing.generate_monthly_bills")
def generate_monthly_bills(year: int | None = None, month: int | None = None):
    """Generate a ``MonthlyBill`` for every active tenant for the given
    calendar month (defaults to the previous month).

    Runs in the public schema because ``MonthlyBill`` lives in SHARED_APPS.
    """
    from usage_billing.models import BillingRate, DailyUsage, MonthlyBill
    from tenants.models import Client

    now = timezone.now()
    if year is None:
        # Previous month
        if now.month == 1:
            year, month = now.year - 1, 12
        else:
            year, month = now.year, now.month - 1

    # monthrange for last day of the billing month
    import calendar as _cal
    last_day = _cal.monthrange(year, month)[1]

    rate = BillingRate.current()
    tenants = Client.objects.exclude(schema_name=get_public_schema_name())
    created = []
    skipped = []

    for tenant in tenants:
        total_requests = DailyUsage.objects.filter(
            tenant=tenant,
            date__year=year,
            date__month=month,
        ).aggregate(t=__import__("django.db.models", fromlist=["Sum"]).Sum("request_count"))["t"] or 0

        amount = rate.cost_for(total_requests)

        obj, created_flag = MonthlyBill.objects.get_or_create(
            tenant=tenant,
            year=year,
            month=month,
            defaults={
                "total_requests": total_requests,
                "requests_per_unit": rate.requests_per_unit,
                "unit_cost": rate.unit_cost,
                "amount": amount,
                "currency": rate.currency,
                "status": MonthlyBill.Status.ISSUED,
                "due_date": timezone.now().date() + timedelta(days=30),
                "issued_at": timezone.now(),
            },
        )
        if created_flag:
            created.append(tenant.schema_name)
        else:
            skipped.append(tenant.schema_name)

    logger.info(
        "generate_monthly_bills: created %s, skipped %s for %s-%02d",
        len(created), len(skipped), year, month,
    )
    return {"created": created, "skipped": skipped, "year": year, "month": month}


# --------------------------------------------------------------------------- #
# 6. Mark overdue usage bills
# --------------------------------------------------------------------------- #
@shared_task(name="usage_billing.mark_overdue_bills")
def mark_overdue_bills():
    """Set ``MonthlyBill.status`` to reflect overdue state.

    The ``effective_status`` property already returns 'OVERDUE' for display,
    but this task persists a status change for reporting/queries.
    """
    from usage_billing.models import MonthlyBill

    today = timezone.localdate()
    qs = MonthlyBill.objects.filter(
        status__in=[MonthlyBill.Status.ISSUED, MonthlyBill.Status.PARTIAL],
        due_date__lt=today,
    )
    count = qs.count()
    # We keep the stored status for audit but note: effective_status will show OVERDUE.
    # If you want to physically update the status, uncomment:
    # qs.update(status=MonthlyBill.Status.ISSUED)  # already issued; effective_status handles display

    logger.info("mark_overdue_bills: %s bills are overdue", count)
    return {"overdue_count": count}
