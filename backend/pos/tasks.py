"""Celery tasks for the POS app."""

from celery import shared_task
from datetime import timedelta
from django.utils import timezone
from django_tenants.utils import get_public_schema_name


@shared_task(name="pos.cleanup_expired_parked_sales")
def cleanup_expired_parked_sales(max_age_hours: int | None = None):
    """Delete ParkedSale records older than ``max_age_hours``.

    Iterates every tenant schema and removes parked sales whose
    ``created_at`` is older than the configured TTL (default 48 hours).

    Returns a dict with per-schema deletion counts, e.g.::

        {"demo": 3, "kamatera_vQJ7e": 0, "total": 3}
    """
    from django.conf import settings
    from tenants.models import Client
    from pos.models import ParkedSale
    from django.db import connection

    if max_age_hours is None:
        max_age_hours = getattr(settings, "PARKED_SALE_TTL_HOURS", 48)

    cutoff = timezone.now() - timedelta(hours=max_age_hours)
    public_schema = get_public_schema_name()
    results: dict[str, int] = {}
    total_deleted = 0

    tenants = list(Client.objects.exclude(schema_name=public_schema))

    for tenant in tenants:
        connection.set_schema(tenant.schema_name)
        try:
            qs = ParkedSale.objects.filter(created_at__lt=cutoff)
            count = qs.count()
            if count:
                qs.delete()
            results[tenant.schema_name] = count
            total_deleted += count
        finally:
            connection.set_schema_to_public()

    results["total"] = total_deleted
    return results
