from rest_framework import serializers
from decimal import Decimal
from .models import (
    POSTransaction, POSTransactionItem, ParkedSale,
    POSShift, POSCredit, POSCreditPayment,
)


class POSTransactionItemSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = POSTransactionItem
        fields = "__all__"

    def get_category_name(self, obj):
        if obj.product and obj.product.category:
            return obj.product.category.name
        return ""


class POSTransactionSerializer(serializers.ModelSerializer):
    items = POSTransactionItemSerializer(many=True, read_only=True)
    cashier_name = serializers.CharField(source="cashier.get_full_name", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    payment_method_display = serializers.CharField(source="get_payment_method_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = POSTransaction
        fields = "__all__"
        read_only_fields = (
            "transaction_number", "cashier", "voided_at", "voided_by",
            "created_at", "updated_at", "shift",
        )

    def get_items_count(self, obj):
        return obj.items.count()


class POSTransactionCreateSerializer(serializers.ModelSerializer):
    items = serializers.ListField(write_only=True)
    due_date = serializers.DateField(write_only=True, required=False, allow_null=True)
    partial_payment = serializers.DecimalField(
        write_only=True, required=False, max_digits=14, decimal_places=2, default=0
    )

    class Meta:
        model = POSTransaction
        fields = [
            "id", "branch", "customer_name", "customer_phone",
            "subtotal", "discount", "tax", "total",
            "payment_method", "payment_reference", "status", "items",
            "due_date", "partial_payment",
        ]
        read_only_fields = ("id",)

    def create(self, validated_data):
        from django.db import transaction as db_transaction
        from inventory.models import StockItem, StockMovement
        import datetime as _dt

        items_data = validated_data.pop("items")
        due_date = validated_data.pop("due_date", None)
        partial_payment = validated_data.pop("partial_payment", 0) or 0
        with db_transaction.atomic():
            today = _dt.date.today()
            prefix = f"POS-{today.strftime('%Y%m%d')}-"
            existing = POSTransaction.objects.filter(
                transaction_number__startswith=prefix
            ).count()
            number = f"{prefix}{existing + 1:04d}"

            tx = POSTransaction.objects.create(
                transaction_number=number,
                cashier=self.context["request"].user,
                **validated_data,
            )
            for item_data in items_data:
                qty = Decimal(str(item_data.get("quantity", 1)))
                unit_price = Decimal(str(item_data.get("unit_price", 0)))
                line_total = Decimal(str(item_data.get("line_total", 0)))
                POSTransactionItem.objects.create(
                    transaction=tx,
                    product_id=item_data.get("product") or item_data.get("stock_id"),
                    quantity=qty,
                    unit_price=unit_price,
                    line_total=line_total,
                    product_name=item_data.get("product_name", ""),
                )
                product_id = item_data.get("product") or item_data.get("stock_id")
                if product_id:
                    stock_item = StockItem.objects.filter(
                        product_id=product_id, branch=tx.branch
                    ).first()
                    if stock_item:
                        stock_item.quantity_on_hand -= qty
                        stock_item.save()
                        StockMovement.objects.create(
                            product_id=product_id, branch=tx.branch,
                            movement_type="sale", quantity_change=-qty,
                            quantity_after=stock_item.quantity_on_hand,
                            reference=tx.transaction_number,
                            performed_by=self.context["request"].user,
                        )
            if tx.payment_method == "credit":
                paid = Decimal(str(partial_payment))
                remaining = tx.total - paid
                credit_status = (
                    "settled" if remaining <= 0
                    else ("partial" if paid > 0 else "open")
                )
                POSCredit.objects.create(
                    transaction=tx, branch=tx.branch,
                    customer_name=tx.customer_name or "Walk-in",
                    customer_phone=tx.customer_phone,
                    total_amount=tx.total, amount_paid=paid, balance=remaining,
                    due_date=due_date,
                    payment_reference=tx.payment_reference,
                    status=credit_status,
                )
        return tx


class ParkedSaleSerializer(serializers.ModelSerializer):
    cashier_name = serializers.CharField(source="cashier.get_full_name", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = ParkedSale
        fields = "__all__"
        read_only_fields = ("cashier",)

    def get_item_count(self, obj):
        return len(obj.items_data) if isinstance(obj.items_data, list) else 0


class POSShiftSerializer(serializers.ModelSerializer):
    cashier_name = serializers.CharField(source="cashier.get_full_name", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    duration = serializers.SerializerMethodField()

    class Meta:
        model = POSShift
        fields = "__all__"
        read_only_fields = ("reference", "cashier", "closed_at", "opened_at")

    def get_duration(self, obj):
        if obj.closed_at:
            delta = obj.closed_at - obj.opened_at
        else:
            from django.utils import timezone
            delta = timezone.now() - obj.opened_at
        hours = int(delta.total_seconds() // 3600)
        mins = int((delta.total_seconds() % 3600) // 60)
        return f"{hours}h {mins}m"


class POSCreditPaymentSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source="recorded_by.get_full_name", read_only=True)

    class Meta:
        model = POSCreditPayment
        fields = "__all__"


class POSCreditSerializer(serializers.ModelSerializer):
    payments = POSCreditPaymentSerializer(many=True, read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    transaction_number = serializers.CharField(source="transaction.transaction_number", read_only=True)
    items = serializers.SerializerMethodField()

    class Meta:
        model = POSCredit
        fields = "__all__"

    def get_items(self, obj):
        items = obj.transaction.items.all()
        return [{"product_name": i.product_name, "quantity": i.quantity, "line_total": i.line_total} for i in items]
