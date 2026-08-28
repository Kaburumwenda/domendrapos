from django.db import transaction
from django.utils import timezone
from django.utils.crypto import get_random_string
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Sale, Refund, Discount, Tax, SaleLine
from .serializers import SaleSerializer, RefundSerializer, DiscountSerializer, TaxSerializer
from users.views import IsManagerOrAbove


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.select_related(
        "branch", "cashier", "customer", "register"
    ).prefetch_related("lines__product__category").all()
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["branch", "status", "cashier", "customer", "sale_date"]
    search_fields = ["receipt_number"]
    ordering_fields = ["sale_date", "grand_total"]

    def perform_create(self, serializer):
        serializer.save(cashier=self.request.user)

    @action(detail=True, methods=["post"])
    def void(self, request, pk=None):
        sale = self.get_object()
        if sale.status != "pending" and sale.status != "on_hold":
            return Response(
                {"detail": "Only pending or on-hold sales can be voided."},
                status=400,
            )
        sale.status = "voided"
        sale.save()
        return Response({"status": "voided"})

    @action(detail=True, methods=["post"])
    def hold(self, request, pk=None):
        sale = self.get_object()
        sale.status = "on_hold"
        sale.save()
        return Response({"status": "on_hold"})


class RefundViewSet(viewsets.ModelViewSet):
    queryset = Refund.objects.select_related("original_sale", "customer").all()
    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "original_sale"]

    def perform_create(self, serializer):
        refund_number = f"RF{get_random_string(10, '0123456789')}"
        serializer.save(
            refund_number=refund_number,
            requested_by=self.request.user,
            status="pending",
        )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        from django.db import transaction as db_transaction
        refund = self.get_object()
        if refund.status != "pending":
            return Response({"detail": "Refund not pending"}, status=400)

        with db_transaction.atomic():
            refund.status = "approved"
            refund.approved_by = request.user
            refund.processed_at = timezone.now()
            refund.save()

            # Increment inventory back for refunded lines
            from inventory.models import StockItem, StockMovement
            sale = refund.original_sale
            for line in refund.lines.all():
                item, _ = StockItem.objects.get_or_create(
                    product=line.sale_line.product, variant=line.sale_line.variant,
                    branch=sale.branch, defaults={},
                )
                item.quantity_on_hand += line.quantity
                item.save()
                StockMovement.objects.create(
                    product=line.sale_line.product, variant=line.sale_line.variant,
                    branch=sale.branch, movement_type="return",
                    quantity_change=line.quantity, quantity_after=item.quantity_on_hand,
                    reference=refund.refund_number, performed_by=request.user,
                )
            refund.status = "completed"
            refund.save()
        return Response(RefundSerializer(refund).data)


class DiscountViewSet(viewsets.ModelViewSet):
    queryset = Discount.objects.all()
    serializer_class = DiscountSerializer
    permission_classes = [IsManagerOrAbove]
    filterset_fields = ["is_active", "discount_type", "product", "category"]


class TaxViewSet(viewsets.ModelViewSet):
    queryset = Tax.objects.all()
    serializer_class = TaxSerializer
    permission_classes = [IsManagerOrAbove]
    filterset_fields = ["is_active", "is_compound"]

