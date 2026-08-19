from django.db import transaction
from django.utils.crypto import get_random_string
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import PurchaseOrder, GoodsReceipt
from .serializers import PurchaseOrderSerializer, GoodsReceiptSerializer
from users.views import IsManagerOrAbove
from inventory.models import StockItem, StockMovement, StockAdjustment, StockAdjustmentLine
from products.models import Product
from django.utils import timezone
import datetime as _dt


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.select_related("supplier", "branch", "created_by").all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "supplier", "branch"]
    search_fields = ["po_number"]

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

