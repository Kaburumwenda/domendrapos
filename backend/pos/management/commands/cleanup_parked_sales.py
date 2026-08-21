"""Management command to clean up expired parked sales.

Usage::

    python manage.py cleanup_parked_sales            # default 48h
    python manage.py cleanup_parked_sales --hours 24 # custom TTL
    python manage.py cleanup_parked_sales --dry-run  # preview only
"""

from django.core.management.base import BaseCommand
from pos.tasks import cleanup_expired_parked_sales


class Command(BaseCommand):
    help = "Delete ParkedSale records older than the specified TTL (default 48 hours)."

    def add_arguments(self, parser):
        from django.conf import settings

        default_ttl = getattr(settings, "PARKED_SALE_TTL_HOURS", 48)
        parser.add_argument(
            "--hours",
            type=int,
            default=default_ttl,
            help=f"Maximum age in hours before a parked sale is deleted (default: {default_ttl}).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="Show what would be deleted without actually deleting.",
        )

    def handle(self, *args, **options):
        hours = options["hours"]
        dry_run = options["dry_run"]

        if dry_run:
            from datetime import timedelta
            from django.utils import timezone
            from django.db import connection
            from django_tenants.utils import get_public_schema_name
            from tenants.models import Client
            from pos.models import ParkedSale

            cutoff = timezone.now() - timedelta(hours=hours)
            public_schema = get_public_schema_name()
            total = 0
            for tenant in Client.objects.exclude(schema_name=public_schema):
                connection.set_schema(tenant.schema_name)
                try:
                    count = ParkedSale.objects.filter(created_at__lt=cutoff).count()
                    self.stdout.write(
                        f"  [{tenant.schema_name}] {count} parked sale(s) would be deleted"
                    )
                    total += count
                finally:
                    connection.set_schema_to_public()
            self.stdout.write(
                self.style.WARNING(
                    f"DRY RUN - {total} parked sale(s) older than {hours}h "
                    f"would be deleted. No changes made."
                )
            )
            return

        # Call the task eagerly (works with or without a running Celery worker)
        result = cleanup_expired_parked_sales.apply(
            kwargs={"max_age_hours": hours}
        )
        # .apply() returns EagerResult when always_eager, AsyncResult otherwise
        stats = result.get() if hasattr(result, "get") else result
        if not isinstance(stats, dict):
            stats = {"total": 0}

        per_tenant = {k: v for k, v in stats.items() if k != "total"}
        for schema, count in per_tenant.items():
            self.stdout.write(f"  [{schema}] {count} parked sale(s) deleted")
        self.stdout.write(
            self.style.SUCCESS(
                f"Cleanup complete - {stats.get('total', 0)} parked sale(s) "
                f"older than {hours}h deleted."
            )
        )
