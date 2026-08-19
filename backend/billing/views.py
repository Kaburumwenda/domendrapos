from rest_framework import viewsets, permissions
from .models import SubscriptionPlan, Invoice, PaymentRecord, UsageMetric
from .serializers import (
    SubscriptionPlanSerializer,
    InvoiceSerializer,
    PaymentRecordSerializer,
    UsageMetricSerializer,
)
from tenants.views import IsSuperAdmin


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsSuperAdmin]


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsSuperAdmin]
    filterset_fields = ["tenant", "status"]


class PaymentRecordViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PaymentRecord.objects.all()
    serializer_class = PaymentRecordSerializer
    permission_classes = [IsSuperAdmin]


class UsageMetricViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UsageMetric.objects.all()
    serializer_class = UsageMetricSerializer
    permission_classes = [IsSuperAdmin]
    filterset_fields = ["tenant", "metric_type"]

