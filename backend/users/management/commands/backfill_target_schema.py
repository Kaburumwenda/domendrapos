"""
Backfill ``target_schema`` for all tenant users whose field is empty.

Usage::

    python manage.py backfill_target_schema

This iterates every tenant, switches to its schema, and sets
``target_schema = <schema_name>`` for each user where it is blank.
"""
from django.core.management.base import BaseCommand
from django.db import connection
from tenants.models import Client
from tenants.utils import get_public_schema_name


class Command(BaseCommand):
    help = "Backfill target_schema for all tenant users with empty target_schema."

    def handle(self, *args, **options):
        total_updated = 0
        tenants = Client.objects.exclude(schema_name=get_public_schema_name())

        for tenant in tenants:
            connection.set_tenant(tenant)
            from users.models import User
            updated = User.objects.filter(
                target_schema=""
            ).update(target_schema=tenant.schema_name)
            if updated:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  {tenant.schema_name}: updated {updated} users"
                    )
                )
            total_updated += updated

        connection.set_schema_to_public()
        self.stdout.write(
            self.style.SUCCESS(f"Done. {total_updated} users updated across all tenants.")
        )
