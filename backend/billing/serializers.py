from rest_framework import serializers
from .models import SubscriptionPlan, Invoice, PaymentRecord, UsageMetric


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = "__all__"


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = "__all__"


class PaymentRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentRecord
        fields = "__all__"


class UsageMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsageMetric
        fields = "__all__"
