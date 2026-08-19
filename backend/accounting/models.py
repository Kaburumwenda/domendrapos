from django.db import models


class ChartOfAccounts(models.Model):
    """
    General ledger chart of accounts.
    """

    ACCOUNT_TYPES = [
        ("asset", "Asset"),
        ("liability", "Liability"),
        ("equity", "Equity"),
        ("revenue", "Revenue"),
        ("expense", "Expense"),
    ]

    code = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=200)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="children"
    )
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["code"]
        verbose_name_plural = "Chart of Accounts"

    def __str__(self):
        return f"{self.code} - {self.name}"


class JournalEntry(models.Model):
    """
    A double-entry journal posting.
    """

    ENTRY_STATUS = [
        ("draft", "Draft"),
        ("posted", "Posted"),
        ("reversed", "Reversed"),
    ]

    entry_number = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    reference = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=ENTRY_STATUS, default="draft")

    # Links
    sale = models.ForeignKey("sales.Sale", on_delete=models.SET_NULL, null=True, blank=True)
    purchase_order = models.ForeignKey(
        "purchasing.PurchaseOrder", on_delete=models.SET_NULL, null=True, blank=True
    )
    branch = models.ForeignKey("branches.Branch", on_delete=models.SET_NULL, null=True, blank=True)

    posted_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]


class JournalLine(models.Model):
    """
    A debit or credit line on a journal entry.
    """

    entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name="lines")
    account = models.ForeignKey(ChartOfAccounts, on_delete=models.CASCADE)
    debit = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    description = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["id"]


class Expense(models.Model):
    """
    Business expense entries (e.g., rent, utilities, payroll).
    """

    STATUS_CHOICES = [
        ("Unpaid", "Unpaid"),
        ("Pending Approval", "Pending Approval"),
        ("Approved", "Approved"),
        ("Paid", "Paid"),
        ("Cancelled", "Cancelled"),
    ]

    expense_number = models.CharField(max_length=50, unique=True)
    date = models.DateField(auto_now_add=True)
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    cost_price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    retail_price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=30, default="cash")
    payment_reference = models.CharField(max_length=200, blank=True)
    vendor = models.CharField(max_length=200, blank=True)
    reference = models.CharField(max_length=100, blank=True)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Unpaid")
    recurring = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    branch = models.ForeignKey("branches.Branch", on_delete=models.SET_NULL, null=True, blank=True)
    receipt = models.ImageField(upload_to="expense-receipts/", null=True, blank=True)
    recorded_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True)


class TaxPayment(models.Model):
    """
    Collected tax remittance record.
    """

    tax = models.ForeignKey("sales.Tax", on_delete=models.CASCADE)
    period_start = models.DateField()
    period_end = models.DateField()
    total_collected = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    amount_remitted = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    remittance_date = models.DateField(null=True, blank=True)
    reference = models.CharField(max_length=100, blank=True)


class CustomerInvoice(models.Model):
    """Invoice for a customer (pharmacy receivable)."""

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("sent", "Sent"),
        ("partially_paid", "Partially Paid"),
        ("paid", "Paid"),
        ("overdue", "Overdue"),
        ("cancelled", "Cancelled"),
    ]

    invoice_number = models.CharField(max_length=50, unique=True)
    branch = models.ForeignKey("branches.Branch", on_delete=models.CASCADE, related_name="invoices")
    customer = models.ForeignKey(
        "customers.Customer", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="invoices",
    )
    customer_name = models.CharField(max_length=200, blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["branch", "status"])]


class CustomerInvoiceLine(models.Model):
    """Line item on a customer invoice."""
    invoice = models.ForeignKey(CustomerInvoice, on_delete=models.CASCADE, related_name="lines")
    description = models.CharField(max_length=300)
    quantity = models.DecimalField(max_digits=14, decimal_places=3, default=1)
    unit_price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    class Meta:
        ordering = ["id"]


class InvoicePayment(models.Model):
    """A payment received against a customer invoice."""
    PAYMENT_METHODS = [
        ("cash", "Cash"),
        ("mpesa", "M-Pesa"),
        ("card", "Card"),
        ("bank_transfer", "Bank Transfer"),
        ("insurance", "Insurance"),
    ]
    invoice = models.ForeignKey(CustomerInvoice, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default="cash")
    reference = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    received_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

