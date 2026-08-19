from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import Client, Domain

User = get_user_model()


class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = ["id", "domain", "is_primary"]


class ClientSerializer(serializers.ModelSerializer):
    domains = DomainSerializer(many=True, read_only=True)
    domains_input = DomainSerializer(many=True, required=False, write_only=True)
    days_to_trial_end = serializers.SerializerMethodField()
    is_trial_expired = serializers.SerializerMethodField()
    mrr_estimate = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            "id",
            "name",
            "schema_name",
            "plan",
            "status",
            "logo",
            "primary_color",
            "contact_email",
            "contact_phone",
            "address_line1",
            "address_line2",
            "city",
            "state_province",
            "postal_code",
            "country",
            "currency_code",
            "currency_symbol",
            "timezone",
            "on_trial",
            "trial_ends_at",
            "paid_until",
            "max_branches",
            "max_users",
            "max_products",
            "suspended_reason",
            "suspended_at",
            "last_activated_at",
            "notes",
            "created_on",
            "created_by_email",
            "domains",
            "domains_input",
            "days_to_trial_end",
            "is_trial_expired",
            "mrr_estimate",
        ]
        read_only_fields = [
            "id",
            "schema_name",
            "created_on",
            "created_by_email",
            "domains",
            "days_to_trial_end",
            "is_trial_expired",
            "mrr_estimate",
        ]

    # ---- Plan -> estimated monthly recurring revenue (KSh) ----
    PLAN_MRR = {
        "free": 0,
        "starter": 1500,
        "business": 5000,
        "enterprise": 15000,
    }

    def get_mrr_estimate(self, obj):
        return self.PLAN_MRR.get(obj.plan, 0)

    def get_days_to_trial_end(self, obj):
        if not obj.trial_ends_at:
            return None
        from django.utils import timezone

        delta = obj.trial_ends_at - timezone.now()
        return max(delta.days, 0)

    def get_is_trial_expired(self, obj):
        if not obj.on_trial or not obj.trial_ends_at:
            return False
        from django.utils import timezone

        return obj.trial_ends_at < timezone.now()

    def create(self, validated_data):
        domains_data = validated_data.pop("domains_input", [])
        with transaction.atomic():
            instance = super().create(validated_data)
            for d in domains_data:
                Domain.objects.create(tenant=instance, **d)
        return instance

    def update(self, instance, validated_data):
        domains_data = validated_data.pop("domains_input", None)
        instance = super().update(instance, validated_data)
        if domains_data is not None:
            # Replace all domains
            instance.domains.all().delete()
            for d in domains_data:
                Domain.objects.create(tenant=instance, **d)
        return instance


class ClientWriteSerializer(serializers.ModelSerializer):
    """
    Super-admin write serializer — allows editing plan, status, limits,
    branding, contact, currency, domains, and internal notes.
    """

    class Meta:
        model = Client
        fields = [
            "name",
            "plan",
            "status",
            "logo",
            "primary_color",
            "contact_email",
            "contact_phone",
            "address_line1",
            "address_line2",
            "city",
            "state_province",
            "postal_code",
            "country",
            "currency_code",
            "currency_symbol",
            "timezone",
            "on_trial",
            "trial_ends_at",
            "paid_until",
            "max_branches",
            "max_users",
            "max_products",
            "notes",
        ]

    def validate_currency_code(self, value):
        if value not in dict(Client.CURRENCY_CHOICES):
            raise serializers.ValidationError(
                f"Unsupported currency code '{value}'. Choose from: "
                f"{', '.join(dict(Client.CURRENCY_CHOICES).keys())}"
            )
        return value


class TenantSettingsSerializer(serializers.ModelSerializer):
    """
    Used by the tenant-self-service settings endpoint.
    Allows editing currency, branding, contact, and timezone — but not plan/status.
    """

    class Meta:
        model = Client
        fields = [
            "id",
            "name",
            "logo",
            "primary_color",
            "contact_email",
            "contact_phone",
            "address_line1",
            "address_line2",
            "city",
            "state_province",
            "postal_code",
            "country",
            "currency_code",
            "currency_symbol",
            "timezone",
        ]
        read_only_fields = ["id"]

    def validate_currency_code(self, value):
        if value not in dict(Client.CURRENCY_CHOICES):
            raise serializers.ValidationError(
                f"Unsupported currency code '{value}'. Choose from: "
                f"{', '.join(dict(Client.CURRENCY_CHOICES).keys())}"
            )
        return value

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Include available currency choices for the frontend dropdown
        ret["currency_choices"] = [
            {"code": code, "label": label}
            for code, label in Client.CURRENCY_CHOICES
        ]
        return ret


class TenantOnboardingSerializer(serializers.Serializer):
    """
    Handles new tenant signup — creates the schema, domain,
    and the first admin user in one transaction.
    """

    business_name = serializers.CharField(max_length=200)
    domain = serializers.CharField(max_length=253)
    contact_email = serializers.EmailField()
    contact_phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    admin_first_name = serializers.CharField(max_length=100)
    admin_last_name = serializers.CharField(max_length=100)
    admin_password = serializers.CharField(min_length=8, write_only=True)
    plan = serializers.ChoiceField(choices=Client.PLAN_CHOICES, default="free")
    country = serializers.CharField(max_length=100, default="Kenya")
    currency_code = serializers.CharField(max_length=3, default="KES")
    currency_symbol = serializers.CharField(max_length=5, default="KSh")

    def validate_domain(self, value):
        if Domain.objects.filter(domain=value).exists():
            raise serializers.ValidationError("This domain is already registered.")
        return value
