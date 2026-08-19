from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, ReportSnapshotViewSet

router = DefaultRouter()
router.register(r"snapshot", ReportSnapshotViewSet, basename="reportsnapshot")
urlpatterns = router.urls

# ViewSet with custom actions
from django.urls import path
from .views import ReportViewSet

report_view = ReportViewSet.as_view({
    "get": "dashboard",
})
sales_summary = ReportViewSet.as_view({"get": "sales_summary"})
sales_by_product = ReportViewSet.as_view({"get": "sales_by_product"})
sales_by_branch = ReportViewSet.as_view({"get": "sales_by_branch"})
sales_by_cashier = ReportViewSet.as_view({"get": "sales_by_cashier"})
inventory_valuation = ReportViewSet.as_view({"get": "inventory_valuation"})
low_stock = ReportViewSet.as_view({"get": "low_stock"})
payment_methods = ReportViewSet.as_view({"get": "payment_methods"})
top_customers = ReportViewSet.as_view({"get": "top_customers"})
daily_revenue = ReportViewSet.as_view({"get": "daily_revenue"})
profit_margin = ReportViewSet.as_view({"get": "profit_margin"})
tax_collected = ReportViewSet.as_view({"get": "tax_collected"})
stock_movement = ReportViewSet.as_view({"get": "stock_movement"})

urlpatterns += [
    path("dashboard/", report_view, name="report-dashboard"),
    path("sales-summary/", sales_summary, name="report-sales-summary"),
    path("sales-by-product/", sales_by_product, name="report-sales-by-product"),
    path("sales-by-branch/", sales_by_branch, name="report-sales-by-branch"),
    path("sales-by-cashier/", sales_by_cashier, name="report-sales-by-cashier"),
    path("inventory-valuation/", inventory_valuation, name="report-inventory-valuation"),
    path("low-stock/", low_stock, name="report-low-stock"),
    path("payment-methods/", payment_methods, name="report-payment-methods"),
    path("top-customers/", top_customers, name="report-top-customers"),
    path("daily-revenue/", daily_revenue, name="report-daily-revenue"),
    path("profit-margin/", profit_margin, name="report-profit-margin"),
    path("tax-collected/", tax_collected, name="report-tax-collected"),
    path("stock-movement/", stock_movement, name="report-stock-movement"),
]
