from rest_framework.routers import DefaultRouter
from .views import (
    ChartOfAccountsViewSet,
    JournalEntryViewSet,
    ExpenseViewSet,
    TaxPaymentViewSet,
    CustomerInvoiceViewSet,
)

router = DefaultRouter()
router.register(r"accounts", ChartOfAccountsViewSet, basename="coa")
router.register(r"journal", JournalEntryViewSet, basename="journal")
router.register(r"expenses", ExpenseViewSet, basename="expense")
router.register(r"tax-payments", TaxPaymentViewSet, basename="taxpayment")
router.register(r"invoices", CustomerInvoiceViewSet, basename="customerinvoice")

urlpatterns = router.urls
