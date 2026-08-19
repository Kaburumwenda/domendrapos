from django.db import transaction
from django.utils.crypto import get_random_string
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    ChartOfAccounts, JournalEntry, JournalLine, Expense, TaxPayment,
    CustomerInvoice, InvoicePayment,
)
from .serializers import (
    ChartOfAccountsSerializer,
    JournalEntrySerializer,
    ExpenseSerializer,
    TaxPaymentSerializer,
    CustomerInvoiceSerializer,
    CustomerInvoiceCreateSerializer,
    InvoicePaymentSerializer,
)
from users.views import IsManagerOrAbove


class ChartOfAccountsViewSet(viewsets.ModelViewSet):
    queryset = ChartOfAccounts.objects.all()
    serializer_class = ChartOfAccountsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["account_type", "is_active"]
    search_fields = ["code", "name"]


class JournalEntryViewSet(viewsets.ModelViewSet):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer
    permission_classes = [IsManagerOrAbove]
    filterset_fields = ["status", "branch", "date"]

    def perform_create(self, serializer):
        entry_number = f"JE{get_random_string(10, '0123456789')}"
        serializer.save(
            entry_number=entry_number,
            posted_by=self.request.user,
            status="posted",
        )


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["category", "branch", "payment_method"]
    search_fields = ["description", "vendor"]

    def perform_create(self, serializer):
        expense_number = f"EXP{get_random_string(8, '0123456789')}"
        serializer.save(expense_number=expense_number, recorded_by=self.request.user)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        exp = self.get_object()
        exp.status = "Approved"
        exp.save(update_fields=["status"])
        return Response(ExpenseSerializer(exp).data)

    @action(detail=True, methods=["post"])
    def mark_paid(self, request, pk=None):
        exp = self.get_object()
        exp.status = "Paid"
        exp.save(update_fields=["status"])
        return Response(ExpenseSerializer(exp).data)

    @action(detail=True, methods=["post"])
    def mark_unpaid(self, request, pk=None):
        exp = self.get_object()
        exp.status = "Unpaid"
        exp.save(update_fields=["status"])
        return Response(ExpenseSerializer(exp).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        exp = self.get_object()
        exp.status = "Cancelled"
        exp.save(update_fields=["status"])
        return Response(ExpenseSerializer(exp).data)


class TaxPaymentViewSet(viewsets.ModelViewSet):
    queryset = TaxPayment.objects.all()
    serializer_class = TaxPaymentSerializer
    permission_classes = [IsManagerOrAbove]
    filterset_fields = ["tax"]


class CustomerInvoiceViewSet(viewsets.ModelViewSet):
    queryset = CustomerInvoice.objects.select_related(
        "branch", "customer", "created_by"
    ).prefetch_related("lines", "payments")
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["branch", "status", "customer"]
    search_fields = ["invoice_number", "customer_name", "customer_phone"]
    ordering_fields = ["created_at", "due_date", "total", "balance"]

    def get_serializer_class(self):
        if self.action == "create":
            return CustomerInvoiceCreateSerializer
        return CustomerInvoiceSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def record_payment(self, request, pk=None):
        invoice = self.get_object()
        amount = float(request.data.get("amount", 0))
        if amount <= 0:
            return Response({"detail": "Amount must be positive."}, status=status.HTTP_400_BAD_REQUEST)
        if amount > float(invoice.balance):
            return Response({"detail": "Amount exceeds balance."}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            payment = InvoicePayment.objects.create(
                invoice=invoice, amount=amount,
                payment_method=request.data.get("payment_method", "cash"),
                reference=request.data.get("reference", ""),
                notes=request.data.get("notes", ""),
                received_by=request.user,
            )
            invoice.amount_paid = float(invoice.amount_paid) + amount
            invoice.balance = float(invoice.total) - float(invoice.amount_paid)
            if invoice.balance <= 0:
                invoice.status = "paid"
            elif invoice.amount_paid > 0:
                invoice.status = "partially_paid"
            invoice.save()
        return Response(CustomerInvoiceSerializer(invoice).data)

