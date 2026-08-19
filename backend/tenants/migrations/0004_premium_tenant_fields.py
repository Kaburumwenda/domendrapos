# Generated manually for premium tenant management

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tenants", "0003_alter_client_country"),
    ]

    operations = [
        migrations.AddField(
            model_name="client",
            name="trial_ends_at",
            field=models.DateTimeField(blank=True, help_text="Explicit trial end datetime", null=True),
        ),
        migrations.AddField(
            model_name="client",
            name="max_branches",
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name="client",
            name="max_users",
            field=models.PositiveIntegerField(default=5),
        ),
        migrations.AddField(
            model_name="client",
            name="max_products",
            field=models.PositiveIntegerField(default=500),
        ),
        migrations.AddField(
            model_name="client",
            name="suspended_reason",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="client",
            name="suspended_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="client",
            name="last_activated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="client",
            name="notes",
            field=models.TextField(blank=True, help_text="Internal notes visible to super-admins only"),
        ),
    ]
