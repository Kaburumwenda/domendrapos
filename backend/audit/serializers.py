from rest_framework import serializers
from .models import AuditLog

ACTION_LABELS = dict(AuditLog.ACTION_CHOICES)
ACTION_COLORS = {
    "create": "success",
    "update": "info",
    "delete": "error",
    "login": "primary",
    "logout": "neutral",
    "approve": "success",
    "reject": "warning",
    "void": "error",
    "refund": "warning",
    "export": "info",
    "config_change": "secondary",
}

RESOURCE_LABELS = {
    "User": "Staff",
    "Product": "Product",
    "Category": "Category",
    "Brand": "Brand",
    "Unit": "Unit",
    "Branch": "Branch",
    "Register": "Register",
    "Customer": "Customer",
    "Supplier": "Supplier",
    "PurchaseOrder": "Purchase Order",
    "GoodsReceipt": "Goods Receipt",
    "POSTransaction": "POS Sale",
    "ParkedSale": "Parked Sale",
    "POSShift": "Cashier Shift",
    "POSCredit": "Credit Account",
    "Sale": "Sale",
    "Discount": "Discount",
    "Tax": "Tax",
    "Refund": "Refund",
    "StockItem": "Stock Item",
    "StockMovement": "Stock Movement",
    "StockTransfer": "Stock Transfer",
    "StockCount": "Stock Count",
    "StockAdjustment": "Stock Adjustment",
    "Expense": "Expense",
    "CustomerInvoice": "Invoice",
    "InvoicePayment": "Invoice Payment",
    "JournalEntry": "Journal Entry",
    "ChartOfAccounts": "Chart of Accounts",
    "Permission": "Permission",
    "RolePermission": "Role Permission",
    "Client": "Tenant",
}


class AuditLogSerializer(serializers.ModelSerializer):
    action_label = serializers.SerializerMethodField()
    action_color = serializers.SerializerMethodField()
    resource_label = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            "id", "user_email", "user_id", "action", "action_label",
            "action_color", "resource_type", "resource_label", "resource_id",
            "description", "old_values", "new_values", "ip_address",
            "user_agent", "timestamp",
        ]

    def get_action_label(self, obj):
        return ACTION_LABELS.get(obj.action, obj.action)

    def get_action_color(self, obj):
        return ACTION_COLORS.get(obj.action, "neutral")

    def get_resource_label(self, obj):
        return RESOURCE_LABELS.get(obj.resource_type, obj.resource_type)
