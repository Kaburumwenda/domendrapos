from rest_framework import serializers
from .models import (
    ChartOfAccounts, JournalEntry, JournalLine, Expense, TaxPayment,
    CustomerInvoice, CustomerInvoiceLine, InvoicePayment,
)


class ChartOfAccountsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChartOfAccounts
        fields = "__all__"


class JournalLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalLine
        fields = "__all__"


class JournalEntrySerializer(serializers.ModelSerializer):
    lines = JournalLineSerializer(many=True)

    class Meta:
        model = JournalEntry
        fields = "__all__"
        read_only_fields = ("entry_number", "created_at", "posted_by")


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ("expense_number", "recorded_by")


class TaxPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxPayment
        fields = "__all__"


class CustomerInvoiceLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerInvoiceLine
        fields = "__all__"


class InvoicePaymentSerializer(serializers.ModelSerializer):
    received_by_name = serializers.CharField(source="received_by.get_full_name", read_only=True)

    class Meta:
        model = InvoicePayment
        fields = "__all__"


class CustomerInvoiceSerializer(serializers.ModelSerializer):
    lines = CustomerInvoiceLineSerializer(many=True, read_only=True)
    payments = InvoicePaymentSerializer(many=True, read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)

    class Meta:
        model = CustomerInvoice
        fields = "__all__"
        read_only_fields = ("invoice_number", "created_by", "created_at", "updated_at")


class CustomerInvoiceCreateSerializer(serializers.ModelSerializer):
    lines = serializers.ListField(write_only=True)

    class Meta:
        model = CustomerInvoice
        fields = [
            "id", "branch", "customer", "customer_name", "customer_phone",
            "due_date", "subtotal", "tax", "discount", "total",
            "status", "notes", "lines",
        ]
        read_only_fields = ("id",)

    def create(self, validated_data):
        from django.db import transaction as db_transaction
        import datetime as _dt

        lines_data = validated_data.pop("lines")
        with db_transaction.atomic():
            today = _dt.date.today()
            prefix = f"INV-{today.strftime('%Y%m%d')}-"
            existing = CustomerInvoice.objects.filter(
                invoice_number__startswith=prefix
            ).count()
            number = f"{prefix}{existing + 1:04d}"

            invoice = CustomerInvoice.objects.create(
                invoice_number=number,
                created_by=self.context["request"].user,
                balance=validated_data.get("total", 0),
                **validated_data,
            )
            for line_data in lines_data:
                CustomerInvoiceLine.objects.create(invoice=invoice, **line_data)
        return invoice
