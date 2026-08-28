from django.shortcuts import render

# POS views — see below
from django.db import transaction as db_transaction
from django.db.models import Sum
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    POSTransaction, ParkedSale, POSShift, POSCredit, POSCreditPayment,
)
from .serializers import (
    POSTransactionSerializer, POSTransactionCreateSerializer,
    ParkedSaleSerializer, POSShiftSerializer,
    POSCreditSerializer, POSCreditPaymentSerializer,
)


class POSTransactionViewSet(viewsets.ModelViewSet):
    queryset = POSTransaction.objects.select_related(
        "branch", "cashier", "shift"
    ).prefetch_related("items", "items__product__category")
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["branch", "status", "payment_method", "cashier"]
    search_fields = ["transaction_number", "customer_name", "customer_phone"]
    ordering_fields = ["created_at", "total", "transaction_number"]

    def get_serializer_class(self):
        if self.action == "create":
            return POSTransactionCreateSerializer
        return POSTransactionSerializer

    def create(self, request, *args, **kwargs):
        """Override create to return full POSTransactionSerializer data.

        POSTransactionCreateSerializer only exposes a subset of fields
        (no transaction_number, created_at, cashier_name, etc.), so the
        frontend receipt dialog gets undefined values.  After successfully
        creating the transaction we re-serialise with the full read serializer.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tx = serializer.save()
        return Response(POSTransactionSerializer(tx).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def void(self, request, pk=None):
        tx = self.get_object()
        if tx.status == "voided":
            return Response({"detail": "Already voided."}, status=status.HTTP_400_BAD_REQUEST)
        with db_transaction.atomic():
            tx.status = "voided"
            tx.voided_at = timezone.now()
            tx.voided_by = request.user
            tx.save()
            from inventory.models import StockItem, StockMovement
            for item in tx.items.all():
                stock_item = StockItem.objects.filter(
                    product=item.product, branch=tx.branch
                ).first()
                if stock_item:
                    stock_item.quantity_on_hand += item.quantity
                    stock_item.save()
                    StockMovement.objects.create(
                        product=item.product, branch=tx.branch,
                        movement_type="return", quantity_change=item.quantity,
                        quantity_after=stock_item.quantity_on_hand,
                        reference=f"VOID {tx.transaction_number}",
                        performed_by=request.user,
                    )
        return Response(POSTransactionSerializer(tx).data)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        from django.db.models import Sum
        qs = self.queryset
        if request.query_params.get("branch"):
            qs = qs.filter(branch_id=request.query_params["branch"])
        total = qs.aggregate(t=Sum("total"))["t"] or 0
        count = qs.count()
        return Response({"total": total, "count": count})


class ParkedSaleViewSet(viewsets.ModelViewSet):
    queryset = ParkedSale.objects.select_related("branch", "cashier")
    serializer_class = ParkedSaleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["branch"]
    search_fields = ["customer_name", "customer_phone"]

    def perform_create(self, serializer):
        serializer.save(cashier=self.request.user)


class POSShiftViewSet(viewsets.ModelViewSet):
    queryset = POSShift.objects.select_related("branch", "cashier")
    serializer_class = POSShiftSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["branch", "status"]
    search_fields = ["reference"]

    def perform_create(self, serializer):
        import datetime as _dt
        from django.db import transaction as db_transaction
        with db_transaction.atomic():
            today = _dt.date.today()
            prefix = f"SFT-{today.strftime('%Y%m%d')}-"
            last = (
                POSShift.objects
                .select_for_update()
                .filter(reference__startswith=prefix)
                .order_by("-reference")
                .first()
            )
            if last:
                seq = int(last.reference.rsplit("-", 1)[-1]) + 1
            else:
                seq = 1
            ref = f"{prefix}{seq:04d}"
        # Auto-set branch from user's default_branch if not provided
        branch = serializer.validated_data.get("branch")
        if not branch:
            user = self.request.user
            default_branch_id = getattr(user, "default_branch_id", None)
            if default_branch_id:
                from branches.models import Branch
                branch = Branch.objects.filter(id=default_branch_id).first()
        serializer.save(cashier=self.request.user, reference=ref, branch=branch)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        shift = self.get_object()
        if shift.status == "closed":
            return Response({"detail": "Already closed."}, status=status.HTTP_400_BAD_REQUEST)
        from decimal import Decimal
        actual_cash = Decimal(str(request.data.get("actual_cash", 0)))
        notes = request.data.get("notes", "")
        txs = POSTransaction.objects.filter(shift=shift, status="completed")
        gross = txs.aggregate(total=Sum("total"))["total"] or Decimal("0")
        discounts = txs.aggregate(total=Sum("discount"))["total"] or Decimal("0")
        tax = txs.aggregate(total=Sum("tax"))["total"] or Decimal("0")
        cash_sales = txs.filter(payment_method="cash").aggregate(total=Sum("total"))["total"] or Decimal("0")
        expected = shift.opening_float + cash_sales
        variance = actual_cash - expected
        shift.expected_cash = expected
        shift.actual_cash = actual_cash
        shift.cash_variance = variance
        shift.gross_revenue = gross
        shift.total_discounts = discounts
        shift.total_tax = tax
        shift.transaction_count = txs.count()
        shift.notes = notes
        shift.status = "closed"
        shift.closed_at = timezone.now()
        shift.save()
        return Response(POSShiftSerializer(shift).data)

    @action(detail=False, methods=["get"])
    def current(self, request):
        shift = POSShift.objects.filter(
            cashier=request.user, status="open"
        ).first()
        if shift:
            return Response(POSShiftSerializer(shift).data)
        return Response({"detail": "No open shift."}, status=status.HTTP_404_NOT_FOUND)


class POSCreditViewSet(viewsets.ModelViewSet):
    queryset = POSCredit.objects.select_related(
        "branch", "transaction"
    ).prefetch_related("payments", "transaction__items")
    serializer_class = POSCreditSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["branch", "status"]
    search_fields = ["customer_name", "customer_phone"]
    ordering_fields = ["created_at", "due_date", "balance", "total_amount"]

    @action(detail=True, methods=["post"])
    def record_payment(self, request, pk=None):
        credit = self.get_object()
        from decimal import Decimal
        amount = Decimal(str(request.data.get("amount", 0)))
        if amount <= 0:
            return Response({"detail": "Amount must be positive."}, status=status.HTTP_400_BAD_REQUEST)
        if amount > credit.balance:
            return Response({"detail": "Amount exceeds balance."}, status=status.HTTP_400_BAD_REQUEST)
        with db_transaction.atomic():
            payment = POSCreditPayment.objects.create(
                credit=credit, amount=amount,
                payment_method=request.data.get("payment_method", "cash"),
                reference=request.data.get("reference", ""),
                notes=request.data.get("notes", ""),
                recorded_by=request.user,
            )
            credit.amount_paid = credit.amount_paid + amount
            credit.balance = credit.total_amount - credit.amount_paid
            if credit.balance <= 0:
                credit.status = "settled"
            elif credit.amount_paid > 0:
                credit.status = "partial"
            credit.save()
        return Response(POSCreditSerializer(credit).data)

    @action(detail=True, methods=["get"])
    def payments(self, request, pk=None):
        credit = self.get_object()
        payments = credit.payments.all()
        return Response(POSCreditPaymentSerializer(payments, many=True).data)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        from django.db.models import Sum
        qs = self.queryset
        if request.query_params.get("branch"):
            qs = qs.filter(branch_id=request.query_params["branch"])
        total_credit = qs.aggregate(t=Sum("total_amount"))["t"] or 0
        total_paid = qs.aggregate(t=Sum("amount_paid"))["t"] or 0
        total_outstanding = qs.aggregate(t=Sum("balance"))["t"] or 0
        count = qs.count()
        return Response({
            "total_credit": total_credit,
            "total_paid": total_paid,
            "total_outstanding": total_outstanding,
            "count": count,
        })
