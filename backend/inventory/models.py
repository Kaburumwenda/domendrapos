from django.db import models
from django.core.exceptions import ValidationError


class StockItem(models.Model):
    """
    Tracks the on-hand quantity of a product (or variant) at a branch.
    """

    product = models.ForeignKey(
        "products.Product", on_delete=models.CASCADE, related_name="stock_items"
    )
    variant = models.ForeignKey(
        "products.ProductVariant",
        on_delete=models.CASCADE, null=True, blank=True,
        related_name="stock_items",
    )
    branch = models.ForeignKey(
        "branches.Branch", on_delete=models.CASCADE, related_name="stock_items"
    )

    quantity_on_hand = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    quantity_reserved = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    reorder_level = models.DecimalField(max_digits=14, decimal_places=3, default=10)
    reorder_quantity = models.DecimalField(max_digits=14, decimal_places=3, default=50)
    bin_location = models.CharField(max_length=50, blank=True)
    aisle = models.CharField(max_length=50, blank=True)

    last_count_date = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = ("product", "variant", "branch")
        ordering = ["product", "branch"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(quantity_on_hand__gte=0),
                name="stock_quantity_on_hand_nonneg",
            ),
        ]

    def __str__(self):
        return f"{self.product.sku} @ {self.branch.code}: {self.quantity_on_hand}"

    @property
    def quantity_available(self):
        return self.quantity_on_hand - self.quantity_reserved

    @property
    def needs_reorder(self):
        return self.quantity_on_hand <= self.reorder_level


class StockMovement(models.Model):
    """
    Every change to inventory is auditable here.
    """

    MOVEMENT_TYPES = [
        ("purchase", "Purchase / Receive"),
        ("sale", "Sale"),
        ("return", "Return"),
        ("adjustment", "Adjustment"),
        ("transfer_out", "Transfer Out"),
        ("transfer_in", "Transfer In"),
        ("damage", "Damage / Write-off"),
        ("initial", "Initial Stock"),
    ]

    product = models.ForeignKey(
        "products.Product", on_delete=models.CASCADE, related_name="stock_movements"
    )
    variant = models.ForeignKey(
        "products.ProductVariant",
        on_delete=models.CASCADE, null=True, blank=True,
        related_name="stock_movements",
    )
    branch = models.ForeignKey(
        "branches.Branch", on_delete=models.CASCADE, related_name="stock_movements"
    )
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity_change = models.DecimalField(max_digits=14, decimal_places=3)
    quantity_after = models.DecimalField(max_digits=14, decimal_places=3)

    reference = models.CharField(max_length=100, blank=True, help_text="PO / sale / transfer ref")
    notes = models.TextField(blank=True)

    performed_by = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True, related_name="stock_movements"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["branch", "created_at"]),
            models.Index(fields=["product", "branch"]),
            models.Index(fields=["movement_type"]),
        ]

    def __str__(self):
        return f"{self.movement_type} {self.quantity_change} {self.product.sku}"


class StockTransfer(models.Model):
    """
    Moving stock between branches.
    """

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("in_transit", "In Transit"),
        ("received", "Received"),
        ("cancelled", "Cancelled"),
    ]

    transfer_number = models.CharField(max_length=50, unique=True)
    from_branch = models.ForeignKey(
        "branches.Branch", on_delete=models.CASCADE, related_name="transfers_out"
    )
    to_branch = models.ForeignKey(
        "branches.Branch", on_delete=models.CASCADE, related_name="transfers_in"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    notes = models.TextField(blank=True)

    created_by = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True, related_name="stock_transfers"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    received_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.transfer_number} {self.from_branch.code} -> {self.to_branch.code}"


class StockTransferLine(models.Model):
    transfer = models.ForeignKey(
        StockTransfer, on_delete=models.CASCADE, related_name="lines"
    )
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    variant = models.ForeignKey(
        "products.ProductVariant",
        on_delete=models.CASCADE, null=True, blank=True,
    )
    quantity = models.DecimalField(max_digits=14, decimal_places=3)
    received_quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)

    def __str__(self):
        return f"{self.product.sku} ×{self.quantity} (Transfer #{self.transfer.id})"


class StockCount(models.Model):
    """
    Premium stock-take / inventory count session.

    Supports full, partial, cycle and ABC-class counts with a multi-stage
    workflow: draft -> in_progress -> completed -> reviewed -> reconciled.
    Lines are frozen at the point the count is started so that system
    quantities reflect the snapshot when counting began.
    """

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("reviewed", "Reviewed"),
        ("reconciled", "Reconciled"),
        ("cancelled", "Cancelled"),
    ]

    COUNT_TYPES = [
        ("full", "Full Count"),
        ("partial", "Partial Count"),
        ("cycle", "Cycle Count"),
        ("abc", "ABC Class Count"),
    ]

    count_number = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200, blank=True, help_text="Human-friendly name for this count session.")
    branch = models.ForeignKey("branches.Branch", on_delete=models.CASCADE, related_name="stock_counts")
    count_type = models.CharField(max_length=20, choices=COUNT_TYPES, default="full")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    scheduled_date = models.DateField()
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reconciled_at = models.DateTimeField(null=True, blank=True)

    # Variance summary (computed when count is completed)
    total_items = models.PositiveIntegerField(default=0)
    counted_items = models.PositiveIntegerField(default=0)
    total_variance_qty = models.DecimalField(max_digits=16, decimal_places=3, default=0)
    total_variance_value = models.DecimalField(max_digits=18, decimal_places=2, default=0)

    notes = models.TextField(blank=True)

    created_by = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True,
        related_name="stock_counts",
    )
    assigned_to = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="assigned_stock_counts",
    )
    reviewed_by = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="reviewed_stock_counts",
    )

    class Meta:
        ordering = ["-scheduled_date"]
        indexes = [
            models.Index(fields=["branch", "status"]),
            models.Index(fields=["count_type"]),
        ]

    def __str__(self):
        return f"{self.count_number} — {self.get_status_display()}"


class StockCountLine(models.Model):
    """
    A single line within a stock count. `system_quantity` is frozen when the
    count starts. Counters record `counted_quantity`; the variance and value
    variance are derived. A line may be flagged for recount when variance is
    suspiciously large.
    """

    LINE_STATUS = [
        ("pending", "Pending"),
        ("counted", "Counted"),
        ("flagged", "Flagged for Recount"),
        ("not_found", "Not Found"),
    ]

    stock_count = models.ForeignKey(StockCount, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    variant = models.ForeignKey("products.ProductVariant", on_delete=models.CASCADE, null=True, blank=True)

    system_quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    counted_quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    variance = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    unit_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    value_variance = models.DecimalField(max_digits=16, decimal_places=2, default=0)

    line_status = models.CharField(max_length=20, choices=LINE_STATUS, default="pending")
    counted_by = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="counted_stock_lines",
    )
    counted_at = models.DateTimeField(null=True, blank=True)

    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["product__sku"]
        unique_together = ("stock_count", "product", "variant")

    def __str__(self):
        return f"{self.product.sku} — system {self.system_quantity}, counted {self.counted_quantity}"


class StockAdjustment(models.Model):
    """
    Premium stock-adjustment document with line items, reason codes,
    approval workflow, and audit trail. Posts movements on approval.
    """

    ADJUSTMENT_REASONS = [
        ("cycle_count", "Cycle Count Correction"),
        ("damage", "Damage / Spoilage"),
        ("theft", "Theft / Shrinkage"),
        ("expiry", "Expired / Obsolete"),
        ("sample", "Sample / Demo / Promotion"),
        ("gift", "Gift / Donation"),
        ("conversion", "Unit Conversion"),
        ("clerical", "Clerical / Data Entry Error"),
        ("quality", "Quality / Recall"),
        ("po_received", "PO Received"),
        ("other", "Other"),
    ]

    ADJUSTMENT_TYPES = [
        ("increase", "Quantity Increase"),
        ("decrease", "Quantity Decrease"),
        ("set", "Set Exact Quantity"),
    ]

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("pending", "Pending Approval"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("posted", "Posted"),
        ("cancelled", "Cancelled"),
    ]

    adjustment_number = models.CharField(max_length=50, unique=True)
    branch = models.ForeignKey(
        "branches.Branch", on_delete=models.CASCADE, related_name="stock_adjustments"
    )
    adjustment_type = models.CharField(max_length=10, choices=ADJUSTMENT_TYPES)
    reason = models.CharField(max_length=20, choices=ADJUSTMENT_REASONS)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    adjustment_date = models.DateField()
    notes = models.TextField(blank=True)
    total_quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    total_value_impact = models.DecimalField(max_digits=16, decimal_places=2, default=0)

    created_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="stock_adjustments_created",
    )
    requested_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_adjustments_requested",
    )
    approved_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_adjustments_approved",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    posted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["branch", "status"]),
            models.Index(fields=["reason"]),
            models.Index(fields=["adjustment_date"]),
        ]

    def __str__(self):
        return f"{self.adjustment_number} ({self.get_status_display()})"


class StockAdjustmentLine(models.Model):
    adjustment = models.ForeignKey(
        StockAdjustment, on_delete=models.CASCADE, related_name="lines"
    )
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    variant = models.ForeignKey(
        "products.ProductVariant",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    system_quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    counted_quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    quantity_change = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    unit_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    value_impact = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.product.sku} — change {self.quantity_change}"

