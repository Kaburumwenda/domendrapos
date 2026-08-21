from io import BytesIO
from decimal import Decimal, InvalidOperation
from django.db import transaction
from django.utils.crypto import get_random_string
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter

from shared.excel_utils import (
    build_export_workbook,
    build_template_workbook,
    parse_workbook,
    normalize_bools,
    normalize_decimals,
    normalize_ints,
    excel_response,
)
from .models import PurchaseOrder, PurchaseOrderLine, GoodsReceipt
from .serializers import PurchaseOrderSerializer, GoodsReceiptSerializer
from users.views import IsManagerOrAbove
from inventory.models import StockItem, StockMovement, StockAdjustment, StockAdjustmentLine
from products.models import Product
from suppliers.models import Supplier
from branches.models import Branch
from django.utils import timezone
import datetime as _dt


# ── Excel column definitions (flat: one row per PO line) ────────────────────
PO_EXPORT_HEADERS = [
    ("PO Number", "po_number"),
    ("Supplier Code", "supplier_code"),
    ("Supplier Name", "supplier_name"),
    ("Branch Code", "branch_code"),
    ("Branch Name", "branch_name"),
    ("Status", "status"),
    ("Order Date", "order_date"),
    ("Expected Delivery", "expected_delivery_date"),
    ("Product SKU", "product_sku"),
    ("Product Name", "product_name"),
    ("Quantity Ordered", "quantity_ordered"),
    ("Unit Cost", "unit_cost"),
    ("Retail Price", "retail_price"),
    ("Tax Rate (%)", "tax_rate"),
    ("Line Total", "line_total"),
    ("Shipping Cost", "shipping_cost"),
    ("Discount Total", "discount_total"),
    ("Notes", "notes"),
]

PO_IMPORT_HEADERS = [
    "PO Number", "Supplier Code", "Branch Code", "Status",
    "Expected Delivery", "Product SKU", "Quantity Ordered",
    "Unit Cost", "Retail Price", "Tax Rate (%)",
    "Shipping Cost", "Discount Total", "Notes",
]

PO_HEADER_TO_FIELD = {
    "po number": "po_number",
    "supplier code": "supplier_code",
    "branch code": "branch_code",
    "status": "status",
    "expected delivery": "expected_delivery_date",
    "product sku": "product_sku",
    "quantity ordered": "quantity_ordered",
    "unit cost": "unit_cost",
    "retail price": "retail_price",
    "tax rate": "tax_rate",
    "tax rate (%)": "tax_rate",
    "shipping cost": "shipping_cost",
    "discount total": "discount_total",
    "notes": "notes",
}

PO_STATUS_OPTIONS = ["draft", "submitted", "approved", "sent", "received", "cancelled"]


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.select_related("supplier", "branch", "created_by").all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    filterset_fields = ["status", "supplier", "branch"]
    search_fields = ["po_number"]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        po_number = f"PO{get_random_string(10, '0123456789')}"
        po = serializer.save(created_by=self.request.user, po_number=po_number)
        # If the PO is created directly as "received", auto-receive all stock
        if po.status == "received":
            self._auto_receive(po)

    @staticmethod
    def _create_po_stock_adjustment(po, lines_list):
        """Create a posted StockAdjustment for PO line items so they appear in
        the inventory adjustments list.  ``lines_list`` is an iterable of
        dicts with keys: product, variant, quantity, unit_cost."""
        with transaction.atomic():
            prefix = f"ADJ-{_dt.date.today().strftime('%Y%m%d')}-"
            existing = StockAdjustment.objects.filter(
                adjustment_number__startswith=prefix
            ).count()
            number = f"{prefix}{existing + 1:04d}"

            adj = StockAdjustment.objects.create(
                adjustment_number=number,
                branch=po.branch,
                adjustment_type="increase",
                reason="po_received",
                status="posted",
                adjustment_date=_dt.date.today(),
                notes=f"Stock received from PO {po.po_number}",
                created_by=po.created_by,
                posted_at=timezone.now(),
            )
            total_qty = 0
            total_value = 0
            for item in lines_list:
                product = item["product"]
                qty = item["quantity"]
                unit_cost = item["unit_cost"]

                stock_item = StockItem.objects.filter(
                    product=product, variant=item.get("variant"), branch=po.branch,
                ).first()
                system_qty = float(stock_item.quantity_on_hand) if stock_item else 0
                change = float(qty)
                value_impact = change * float(unit_cost or 0)

                StockAdjustmentLine.objects.create(
                    adjustment=adj,
                    product=product,
                    variant=item.get("variant"),
                    system_quantity=system_qty,
                    counted_quantity=system_qty + change,
                    quantity_change=change,
                    unit_cost=unit_cost or 0,
                    value_impact=value_impact,
                    notes=f"PO {po.po_number}",
                )
                total_qty += abs(change)
                total_value += value_impact
            adj.total_quantity = total_qty
            adj.total_value_impact = total_value
            adj.save()
            return adj

    def _auto_receive(self, po):
        """Auto-receive all line items: update inventory, create stock movements,
        update product cost/retail prices, mark PO lines as fully received,
        and create a posted StockAdjustment for the adjustments list."""
        grn_number = f"GRN{get_random_string(10, '0123456789')}"
        grn = GoodsReceipt.objects.create(
            grn_number=grn_number,
            po=po,
            branch=po.branch,
            received_by=self.request.user,
            notes=f"Auto-received on PO creation ({po.po_number})",
        )
        adjustment_lines = []
        with transaction.atomic():
            for line in po.lines.all():
                # Update PO line received quantity
                line.quantity_received = line.quantity_ordered
                line.save()

                # Update product cost and retail prices
                product = line.product
                if line.unit_cost:
                    product.cost_price = line.unit_cost
                if line.retail_price:
                    product.retail_price = line.retail_price
                product.save()

                # Increment inventory
                item, _ = StockItem.objects.get_or_create(
                    product=line.product, variant=line.variant, branch=po.branch,
                    defaults={},
                )
                item.quantity_on_hand += line.quantity_ordered
                item.save()

                # Create stock movement
                StockMovement.objects.create(
                    product=line.product, variant=line.variant, branch=po.branch,
                    movement_type="purchase", quantity_change=line.quantity_ordered,
                    quantity_after=item.quantity_on_hand, reference=grn.grn_number,
                    performed_by=self.request.user,
                )

                # Create GRN line
                from .models import GoodsReceiptLine
                GoodsReceiptLine.objects.create(
                    receipt=grn, po_line=line,
                    quantity_received=line.quantity_ordered,
                    condition="good", notes="",
                )

                adjustment_lines.append({
                    "product": line.product,
                    "variant": line.variant,
                    "quantity": line.quantity_ordered,
                    "unit_cost": line.unit_cost,
                })

        # Create a posted StockAdjustment so this receipt appears in adjustments
        self._create_po_stock_adjustment(po, adjustment_lines)

    # ── Excel Export ───────────────────────────────────────────────────────
    @action(detail=False, methods=["get"], url_path="export-excel")
    def export_excel(self, request):
        """Export POs (with line items) as .xlsx. One row per line item,
        with PO header columns repeated."""
        qs = self.filter_queryset(self.get_queryset()).prefetch_related("lines__product", "lines__po__supplier", "lines__po__branch")
        rows = []
        for po in qs:
            for line in po.lines.all():
                rows.append({
                    "po_number": po.po_number,
                    "supplier_code": po.supplier.supplier_code if po.supplier else "",
                    "supplier_name": po.supplier.name if po.supplier else "",
                    "branch_code": po.branch.code if po.branch else "",
                    "branch_name": po.branch.name if po.branch else "",
                    "status": po.status,
                    "order_date": str(po.order_date) if po.order_date else "",
                    "expected_delivery_date": str(po.expected_delivery_date) if po.expected_delivery_date else "",
                    "product_sku": line.product.sku if line.product else "",
                    "product_name": line.product.name if line.product else "",
                    "quantity_ordered": line.quantity_ordered,
                    "unit_cost": line.unit_cost,
                    "retail_price": line.retail_price,
                    "tax_rate": line.tax_rate,
                    "line_total": line.line_total,
                    "shipping_cost": po.shipping_cost,
                    "discount_total": po.discount_total,
                    "notes": po.notes,
                })
        buf = build_export_workbook(PO_EXPORT_HEADERS, rows)
        return excel_response(
            buf, f"purchase_orders_export_{_dt.datetime.now():%Y%m%d_%H%M%S}.xlsx"
        )

    # ── Excel Template ─────────────────────────────────────────────────────
    @action(detail=False, methods=["get"], url_path="import-excel-template")
    def import_excel_template(self, request):
        example = [
            "PO-001", "SUP-001", "BR001", "draft",
            "2026-09-01", "PRD-AB12CD", "100", "10.50", "25.00", "16",
            "50.00", "0.00", "Regular restock order",
        ]
        instructions = [
            ("BULK IMPORT — PURCHASE ORDERS", True),
            ("", False),
            ("How it works", True),
            ("Each row = one line item. Group rows with the same PO Number to create one PO with multiple lines.", False),
            ("", False),
            ("Required fields (per row)", True),
            ("Supplier Code — must match an existing supplier's code.", False),
            ("Branch Code — must match an existing branch's code.", False),
            ("Product SKU — must match an existing product's SKU.", False),
            ("Quantity Ordered — numeric (e.g. 100).", False),
            ("Unit Cost — numeric (e.g. 10.50).", False),
            ("", False),
            ("Optional fields", True),
            ("PO Number — blank = auto-generated (e.g. PO1234567890).", False),
            ("Existing PO Number → adds line items to that PO.", False),
            ("Status — draft, submitted, approved, sent, received, cancelled (default draft).", False),
            ("Expected Delivery — date (YYYY-MM-DD).", False),
            ("Retail Price — numeric (default 0).", False),
            ("Tax Rate (%) — numeric (e.g. 16 = 16%).", False),
            ("Shipping Cost / Discount Total — per-PO values from the first row.", False),
            ("Notes — free text.", False),
            ("", False),
            ("Behavior", True),
            ("Rows grouped by PO Number create one PO each.", False),
            ("If status = received, stock is auto-received into inventory.", False),
        ]
        buf = build_template_workbook(PO_IMPORT_HEADERS, example, instructions)
        return excel_response(buf, "purchase_orders_import_template.xlsx")

    # ── Parse / Preview ────────────────────────────────────────────────────
    @action(detail=False, methods=["post"], url_path="parse-excel")
    def parse_excel(self, request):
        from openpyxl import load_workbook
        uploaded = request.FILES.get("file")
        if not uploaded:
            return Response({"detail": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)
        if not uploaded.name.lower().endswith((".xlsx", ".xlsm")):
            return Response({"detail": "Only .xlsx files are supported."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            wb = load_workbook(uploaded, read_only=True, data_only=True)
        except Exception as exc:
            return Response({"detail": f"Could not read workbook: {exc}"}, status=status.HTTP_400_BAD_REQUEST)

        rows, missing_required, skipped = parse_workbook(
            wb, PO_HEADER_TO_FIELD,
            required_fields=["supplier_code", "branch_code", "product_sku", "quantity_ordered", "unit_cost"],
        )
        wb.close()
        if missing_required:
            return Response(
                {"detail": f"Missing required header column(s): {', '.join(missing_required)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Build lookups
        supplier_map = {s.supplier_code.lower(): s for s in Supplier.objects.all()}
        branch_map = {b.code.lower(): b for b in Branch.objects.all()}
        product_map = {p.sku.lower(): p for p in Product.objects.all()}
        existing_po_numbers = set(PurchaseOrder.objects.values_list("po_number", flat=True))

        out_rows = []
        errors = []
        for entry in rows:
            cleaned = {}
            row_errors = []
            for k, val in entry.items():
                if k.startswith("_"):
                    continue
                cleaned[k] = val

            # Validate supplier
            sc = str(cleaned.get("supplier_code", "")).strip().lower()
            if sc and sc in supplier_map:
                cleaned["_supplier_id"] = supplier_map[sc].id
                cleaned["_supplier_name"] = supplier_map[sc].name
            else:
                row_errors.append(f"Unknown supplier code '{cleaned.get('supplier_code')}'")

            # Validate branch
            bc = str(cleaned.get("branch_code", "")).strip().lower()
            if bc and bc in branch_map:
                cleaned["_branch_id"] = branch_map[bc].id
                cleaned["_branch_name"] = branch_map[bc].name
            else:
                row_errors.append(f"Unknown branch code '{cleaned.get('branch_code')}'")

            # Validate product
            psku = str(cleaned.get("product_sku", "")).strip().lower()
            if psku and psku in product_map:
                cleaned["_product_id"] = product_map[psku].id
                cleaned["_product_name"] = product_map[psku].name
            else:
                row_errors.append(f"Unknown product SKU '{cleaned.get('product_sku')}'")

            # Validate status
            st = str(cleaned.get("status", "")).strip().lower()
            if st and st not in PO_STATUS_OPTIONS:
                row_errors.append(f"Unknown status '{st}' (use: {', '.join(PO_STATUS_OPTIONS)})")
            elif not st:
                cleaned["status"] = "draft"

            # Normalize decimals
            normalize_decimals(cleaned, ["quantity_ordered", "unit_cost", "retail_price", "tax_rate", "shipping_cost", "discount_total"])

            # Auto-generate PO number
            po_num = cleaned.get("po_number")
            if not po_num or not str(po_num).strip():
                po_num = f"PO{get_random_string(10, '0123456789')}"
                cleaned["po_number"] = po_num
            existing_po_numbers.add(po_num)

            cleaned["_row"] = entry.get("_row")
            out_rows.append(cleaned)
            for e in row_errors:
                errors.append({"row": entry.get("_row"), "po": po_num, "detail": e})

        return Response({
            "rows": out_rows,
            "statuses": PO_STATUS_OPTIONS,
            "skipped": skipped,
            "errors": errors,
        }, status=status.HTTP_200_OK)

    # ── Bulk upsert ───────────────────────────────────────────────────────
    @action(detail=False, methods=["post"], url_path="bulk-upsert")
    def bulk_upsert(self, request):
        items = request.data.get("items") if isinstance(request.data, dict) else None
        if not items or not isinstance(items, list):
            return Response({"detail": "Body must be {\"items\": [...]}."}, status=status.HTTP_400_BAD_REQUEST)

        # Group rows by PO number
        po_groups = {}
        for idx, item in enumerate(items, 1):
            po_num = str(item.get("po_number", "")).strip()
            if not po_num:
                po_num = f"PO{get_random_string(10, '0123456789')}"
            if po_num not in po_groups:
                po_groups[po_num] = {"header": None, "lines": [], "first_idx": idx}
            po_groups[po_num]["lines"].append(item)
            if po_groups[po_num]["header"] is None:
                po_groups[po_num]["header"] = item

        created_pos = 0
        updated_pos = 0
        created_lines = 0
        failed = 0
        errors = []

        for po_num, group in po_groups.items():
            header = group["header"]
            idx = group["first_idx"]
            try:
                supplier = Supplier.objects.get(
                    supplier_code__iexact=str(header.get("supplier_code", "")).strip()
                )
                branch = Branch.objects.get(
                    code__iexact=str(header.get("branch_code", "")).strip()
                )
            except Supplier.DoesNotExist:
                failed += 1
                errors.append({"row": idx, "po": po_num, "detail": f"Unknown supplier code '{header.get('supplier_code')}'"})
                continue
            except Branch.DoesNotExist:
                failed += 1
                errors.append({"row": idx, "po": po_num, "detail": f"Unknown branch code '{header.get('branch_code')}'"})
                continue

            status_val = str(header.get("status", "draft")).strip().lower()
            if status_val not in PO_STATUS_OPTIONS:
                status_val = "draft"

            existing = PurchaseOrder.objects.filter(po_number=po_num).first()

            if existing:
                # Add lines to existing PO
                po = existing
            else:
                po = PurchaseOrder.objects.create(
                    po_number=po_num,
                    supplier=supplier,
                    branch=branch,
                    status=status_val,
                    created_by=request.user,
                    notes=str(header.get("notes", "") or ""),
                    shipping_cost=Decimal(str(header.get("shipping_cost", 0) or 0)),
                    discount_total=Decimal(str(header.get("discount_total", 0) or 0)),
                )
                if status_val == "draft":
                    created_pos += 1

            # Add line items
            subtotal = 0
            tax_total = 0
            for line_item in group["lines"]:
                try:
                    product = Product.objects.get(
                        sku__iexact=str(line_item.get("product_sku", "")).strip()
                    )
                except Product.DoesNotExist:
                    failed += 1
                    errors.append({"row": idx, "po": po_num, "detail": f"Unknown product SKU '{line_item.get('product_sku')}'"})
                    continue

                qty = Decimal(str(line_item.get("quantity_ordered", 0) or 0))
                unit_cost = Decimal(str(line_item.get("unit_cost", 0) or 0))
                retail = Decimal(str(line_item.get("retail_price", 0) or 0))
                tax = Decimal(str(line_item.get("tax_rate", 0) or 0))

                line = PurchaseOrderLine.objects.create(
                    po=po, product=product,
                    quantity_ordered=qty,
                    unit_cost=unit_cost,
                    retail_price=retail,
                    tax_rate=tax,
                )
                line.line_total = qty * unit_cost * (1 + tax / 100)
                line.save()
                created_lines += 1
                subtotal += qty * unit_cost
                tax_total += qty * unit_cost * (tax / 100)

            # Update totals
            po.subtotal = (po.subtotal or 0) + subtotal if existing else subtotal
            po.tax_total = (po.tax_total or 0) + tax_total if existing else tax_total
            po.grand_total = po.subtotal + po.tax_total + po.shipping_cost - po.discount_total
            po.save()

            # Auto-receive if status is received
            if status_val == "received" and not existing:
                self._auto_receive(po)

        return Response({
            "created": created_pos, "updated": updated_pos,
            "lines_created": created_lines,
            "failed": failed,
            "total_processed": created_pos + updated_pos + failed,
            "errors": errors[:200], "errors_truncated": len(errors) > 200,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        po = self.get_object()
        po.status = "submitted"
        po.save()
        return Response(PurchaseOrderSerializer(po).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        po = self.get_object()
        po.status = "approved"
        po.approved_by = request.user
        po.save()
        return Response(PurchaseOrderSerializer(po).data)

    @action(detail=True, methods=["post"])
    def send(self, request, pk=None):
        po = self.get_object()
        po.status = "sent"
        po.save()
        return Response(PurchaseOrderSerializer(po).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        po = self.get_object()
        po.status = "cancelled"
        po.save()
        return Response(PurchaseOrderSerializer(po).data)


class GoodsReceiptViewSet(viewsets.ModelViewSet):
    queryset = GoodsReceipt.objects.select_related("po", "branch", "received_by").all()
    serializer_class = GoodsReceiptSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["po", "branch"]

    def perform_create(self, serializer):
        grn_number = f"GRN{get_random_string(10, '0123456789')}"
        grn = serializer.save(
            grn_number=grn_number, received_by=self.request.user,
        )
        # Increment inventory and update PO line received quantities
        with transaction.atomic():
            po = grn.po
            all_received = True
            adjustment_lines = []
            for line in grn.lines.all():
                po_line = line.po_line
                po_line.quantity_received += line.quantity_received
                po_line.save()
                if po_line.quantity_received < po_line.quantity_ordered:
                    all_received = False

                item, _ = StockItem.objects.get_or_create(
                    product=po_line.product, variant=po_line.variant, branch=grn.branch,
                    defaults={},
                )
                item.quantity_on_hand += line.quantity_received
                item.save()
                StockMovement.objects.create(
                    product=po_line.product, variant=po_line.variant, branch=grn.branch,
                    movement_type="purchase", quantity_change=line.quantity_received,
                    quantity_after=item.quantity_on_hand, reference=grn.grn_number,
                    performed_by=self.request.user,
                )
                adjustment_lines.append({
                    "product": po_line.product,
                    "variant": po_line.variant,
                    "quantity": line.quantity_received,
                    "unit_cost": po_line.unit_cost,
                })
            po.status = "received" if all_received else "partially_received"
            po.save()

        # Create a posted StockAdjustment so this receipt appears in adjustments
        PurchaseOrderViewSet._create_po_stock_adjustment(po, adjustment_lines)

