from django.db import models


class ReportSnapshot(models.Model):
    """
    Cached / stored snapshot of a report run for later retrieval.
    """

    REPORT_TYPES = [
        ("sales_summary", "Sales Summary"),
        ("sales_by_product", "Sales by Product"),
        ("sales_by_branch", "Sales by Branch"),
        ("sales_by_cashier", "Sales by Cashier"),
        ("inventory_valuation", "Inventory Valuation"),
        ("low_stock", "Low Stock Report"),
        ("profit_margin", "Profit Margin"),
        ("tax_collected", "Tax Collected"),
        ("top_customers", "Top Customers"),
        ("daily_revenue", "Daily Revenue"),
        ("payment_methods", "Payment Methods Breakdown"),
        ("stock_movement", "Stock Movement Report"),
    ]

    report_type = models.CharField(max_length=30, choices=REPORT_TYPES)
    branch = models.ForeignKey("branches.Branch", on_delete=models.SET_NULL, null=True, blank=True)
    date_from = models.DateField()
    date_to = models.DateField()
    data = models.JSONField()
    generated_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

