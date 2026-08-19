from rest_framework import viewsets, permissions
from .models import Payment, PaymentRefund
from .serializers import PaymentSerializer, PaymentRefundSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related("sale", "branch").all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["sale", "branch", "method", "status"]
    search_fields = ["payment_number", "gateway_transaction_id"]
    ordering_fields = ["processed_at", "amount"]

    def perform_create(self, serializer):
        serializer.save(processed_by=self.request.user)


class PaymentRefundViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PaymentRefund.objects.all()
    serializer_class = PaymentRefundSerializer
    permission_classes = [permissions.IsAuthenticated]

