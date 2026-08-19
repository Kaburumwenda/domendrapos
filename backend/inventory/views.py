from django.db import transaction, models
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    StockItem, StockMovement, StockTransfer, StockTransferLine,
    StockCount, StockCountLine,
    StockAdjustment, StockAdjustmentLine,
)
from .serializers import (
    StockItemSerializer, StockMovementSerializer,
    StockTransferSerializer, StockCountSerializer,
    StockAdjustmentSerializer, StockAdjustmentCreateSerializer,
)


class StockItemViewSet(viewsets.ModelViewSet):
    queryset = StockItem.objects.select_related("product", "variant", "branch").all()
    serializer_class = StockItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["branch", "product", "variant"]
    search_fields = ["product__sku", "product__name", "bin_location"]

    @action(detail=False, methods=["get"])
    def low_stock(self, request):
        low = self.get_queryset().filter(quantity_on_hand__lte=models.F("reorder_level"))
        return Response(StockItemSerializer(low, many=True).data)

    @action(detail=False, methods=["get"])
    def analytics(self, request):
        """Comprehensive stock analytics for the Stock Analysis page."""
        from django.db.models import Sum, Count, Q, F
        from decimal import Decimal

        qs = self.get_queryset()

        # ---- KPIs ----
        total_skus = qs.count()
        total_units = qs.aggregate(
            v=Sum("quantity_on_hand")
        )["v"] or Decimal("0")
        total_cost_value = Decimal("0")
        total_retail_value = Decimal("0")
        for item in qs:
            qty = item.quantity_on_hand or Decimal("0")
            cost = item.product.cost_price or Decimal("0")
            retail = item.product.retail_price or Decimal("0")
            total_cost_value += qty * cost
            total_retail_value += qty * retail

        in_stock = qs.filter(quantity_on_hand__gt=F("reorder_level")).count()
        low_stock = qs.filter(
            quantity_on_hand__lte=F("reorder_level"),
            quantity_on_hand__gt=0,
        ).count()
        out_of_stock = qs.filter(quantity_on_hand__lte=0).count()
        reorder_items = qs.filter(quantity_on_hand__lte=F("reorder_level")).count()

        potential_profit = total_retail_value - total_cost_value

        # ---- Value by Category ----
        category_map = {}
        for item in qs:
            cat = item.product.category.name if item.product and item.product.category else "Uncategorised"
            qty = item.quantity_on_hand or Decimal("0")
            val = qty * (item.product.cost_price or Decimal("0"))
            if cat in category_map:
                category_map[cat]["value"] += val
                category_map[cat]["units"] += qty
                category_map[cat]["count"] += 1
            else:
                category_map[cat] = {"value": val, "units": qty, "count": 1}
        by_category = sorted(
            [{"category": k, **v} for k, v in category_map.items()],
            key=lambda x: x["value"],
            reverse=True,
        )

        # ---- Top 10 by stock value ----
        item_values = []
        for item in qs:
            qty = item.quantity_on_hand or Decimal("0")
            val = qty * (item.product.cost_price or Decimal("0"))
            item_values.append({
                "id": item.id,
                "product_name": item.product.name if item.product else "—",
                "product_sku": item.product.sku if item.product else "—",
                "category": item.product.category.name if item.product and item.product.category else None,
                "quantity_on_hand": qty,
                "cost_price": item.product.cost_price or Decimal("0"),
                "retail_price": item.product.retail_price or Decimal("0"),
                "stock_value": val,
                "reorder_level": item.reorder_level,
                "branch_name": item.branch.name if item.branch else "—",
            })
        top_by_value = sorted(item_values, key=lambda x: x["stock_value"], reverse=True)[:10]

        # ---- Movement summary (last 30 days) ----
        from datetime import timedelta
        cutoff = timezone.now() - timedelta(days=30)
        movements = StockMovement.objects.filter(created_at__gte=cutoff)
        movement_by_type = {}
        for mv in movements:
            mt = mv.movement_type
            if mt in movement_by_type:
                movement_by_type[mt]["count"] += 1
                movement_by_type[mt]["quantity"] += abs(mv.quantity_change)
            else:
                movement_by_type[mt] = {"count": 1, "quantity": abs(mv.quantity_change)}
        movement_summary = [
            {"movement_type": k, "label": dict(StockMovement.MOVEMENT_TYPES).get(k, k), **v}
            for k, v in sorted(movement_by_type.items(), key=lambda x: x[1]["count"], reverse=True)
        ]

        # ---- ABC classification (Pareto) ----
        sorted_vals = sorted(item_values, key=lambda x: x["stock_value"], reverse=True)
        cumulative = Decimal("0")
        abc = []
        for idx, iv in enumerate(sorted_vals):
            cumulative += iv["stock_value"]
            pct = (cumulative / total_cost_value * 100) if total_cost_value else Decimal("0")
            if pct <= 80:
                cls = "A"
            elif pct <= 95:
                cls = "B"
            else:
                cls = "C"
            abc.append({**iv, "class": cls, "cumulative_pct": round(float(pct), 1)})
        class_a = sum(1 for a in abc if a["class"] == "A")
        class_b = sum(1 for a in abc if a["class"] == "B")
        class_c = sum(1 for a in abc if a["class"] == "C")

        # ---- Low / out-of-stock details ----
        low_stock_items = [
            {
                "id": i.id,
                "product_name": i.product.name if i.product else "—",
                "product_sku": i.product.sku if i.product else "—",
                "category": i.product.category.name if i.product and i.product.category else None,
                "quantity_on_hand": i.quantity_on_hand,
                "reorder_level": i.reorder_level,
                "reorder_qty": i.reorder_quantity,
                "cost_price": i.product.cost_price or Decimal("0"),
                "branch_name": i.branch.name if i.branch else "—",
            }
            for i in qs.filter(quantity_on_hand__lte=F("reorder_level"))
        ]

        return Response({
            "kpis": {
                "total_skus": total_skus,
                "total_units": total_units,
                "total_cost_value": total_cost_value,
                "total_retail_value": total_retail_value,
                "potential_profit": potential_profit,
                "in_stock": in_stock,
                "low_stock": low_stock,
                "out_of_stock": out_of_stock,
                "reorder_items": reorder_items,
            },
            "by_category": by_category,
            "top_by_value": top_by_value,
            "movement_summary": movement_summary,
            "abc_analysis": abc,
            "abc_counts": {"A": class_a, "B": class_b, "C": class_c},
            "low_stock_items": low_stock_items,
        })


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.select_related("product", "variant", "branch").all()
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["branch", "movement_type", "product"]
    ordering_fields = ["created_at"]


class StockTransferViewSet(viewsets.ModelViewSet):
    queryset = StockTransfer.objects.all()
    serializer_class = StockTransferSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["from_branch", "to_branch", "status"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def ship(self, request, pk=None):
        transfer = self.get_object()
        with transaction.atomic():
            transfer.status = "in_transit"
            transfer.shipped_at = timezone.now()
            transfer.save()
            # Deduct from source
            for line in transfer.lines.all():
                item, _ = StockItem.objects.get_or_create(
                    product=line.product, variant=line.variant, branch=transfer.from_branch,
                    defaults={},
                )
                item.quantity_on_hand -= line.quantity
                item.save()
                StockMovement.objects.create(
                    product=line.product, variant=line.variant, branch=transfer.from_branch,
                    movement_type="transfer_out", quantity_change=-line.quantity,
                    quantity_after=item.quantity_on_hand, reference=transfer.transfer_number,
                    performed_by=request.user,
                )
        return Response(StockTransferSerializer(transfer).data)

    @action(detail=True, methods=["post"])
    def receive(self, request, pk=None):
        transfer = self.get_object()
        with transaction.atomic():
            transfer.status = "received"
            transfer.received_at = timezone.now()
            transfer.save()
            for line in transfer.lines.all():
                item, _ = StockItem.objects.get_or_create(
                    product=line.product, variant=line.variant, branch=transfer.to_branch,
                    defaults={},
                )
                recv_qty = request.data.get(
                    f"line_{line.id}", line.quantity
                )
                line.received_quantity = recv_qty
                line.save()
                item.quantity_on_hand += recv_qty
                item.save()
                StockMovement.objects.create(
                    product=line.product, variant=line.variant, branch=transfer.to_branch,
                    movement_type="transfer_in", quantity_change=recv_qty,
                    quantity_after=item.quantity_on_hand, reference=transfer.transfer_number,
                    performed_by=request.user,
                )
        return Response(StockTransferSerializer(transfer).data)


class StockCountViewSet(viewsets.ModelViewSet):
    queryset = StockCount.objects.all()
    serializer_class = StockCountSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["branch", "status"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def reconcile(self, request, pk=None):
        count = self.get_object()
        with transaction.atomic():
            for line in count.lines.all():
                item, _ = StockItem.objects.get_or_create(
                    product=line.product, variant=line.variant, branch=count.branch,
                    defaults={},
                )
                diff = line.counted_quantity - line.system_quantity
                item.quantity_on_hand = line.counted_quantity
                item.save()
                line.variance = diff
                line.save()
                StockMovement.objects.create(
                    product=line.product, variant=line.variant, branch=count.branch,
                    movement_type="adjustment", quantity_change=diff,
                    quantity_after=item.quantity_on_hand, reference=count.count_number,
                    performed_by=request.user, notes=f"Stock count {count.count_number}",
                )
            count.status = "reconciled"
            count.completed_at = timezone.now()
            count.save()
        return Response(StockCountSerializer(count).data)


class StockAdjustmentViewSet(viewsets.ModelViewSet):
    queryset = StockAdjustment.objects.select_related(
        "branch", "created_by", "approved_by"
    ).prefetch_related("lines__product")
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["branch", "status", "reason", "adjustment_type"]
    search_fields = ["adjustment_number", "notes", "lines__product__name"]
    ordering_fields = ["created_at", "adjustment_date", "total_value_impact"]

    def get_serializer_class(self):
        if self.action in ("create",):
            return StockAdjustmentCreateSerializer
        return StockAdjustmentSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        """Move from draft to pending approval."""
        adj = self.get_object()
        if adj.status != "draft":
            return Response(
                {"detail": "Only draft adjustments can be submitted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        adj.status = "pending"
        adj.requested_by = request.user
        adj.save()
        return Response(StockAdjustmentSerializer(adj).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """Approve a pending adjustment."""
        adj = self.get_object()
        if adj.status != "pending":
            return Response(
                {"detail": "Only pending adjustments can be approved."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        adj.status = "approved"
        adj.approved_by = request.user
        adj.approved_at = timezone.now()
        adj.save()
        return Response(StockAdjustmentSerializer(adj).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        """Reject a pending adjustment."""
        adj = self.get_object()
        if adj.status not in ("pending", "approved"):
            return Response(
                {"detail": "Only pending or approved adjustments can be rejected."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        adj.status = "rejected"
        adj.save()
        return Response(StockAdjustmentSerializer(adj).data)

    @action(detail=True, methods=["post"])
    def post_adjustment(self, request, pk=None):
        """Apply the approved adjustment to stock and create audit movements."""
        adj = self.get_object()
        if adj.status not in ("approved", "draft"):
            return Response(
                {"detail": "Only approved or draft adjustments can be posted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        with transaction.atomic():
            for line in adj.lines.all():
                item, _ = StockItem.objects.get_or_create(
                    product=line.product, variant=line.variant, branch=adj.branch,
                    defaults={},
                )
                item.quantity_on_hand = (item.quantity_on_hand or 0) + line.quantity_change
                item.save()
                StockMovement.objects.create(
                    product=line.product, variant=line.variant, branch=adj.branch,
                    movement_type="adjustment",
                    quantity_change=line.quantity_change,
                    quantity_after=item.quantity_on_hand,
                    reference=adj.adjustment_number,
                    performed_by=request.user,
                    notes=f"Stock adjustment {adj.adjustment_number} - {adj.get_reason_display()}",
                )
            adj.status = "posted"
            adj.posted_at = timezone.now()
            if not adj.approved_by:
                adj.approved_by = request.user
                adj.approved_at = timezone.now()
            adj.save()
        return Response(StockAdjustmentSerializer(adj).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel a draft/pending/approved adjustment."""
        adj = self.get_object()
        if adj.status in ("posted", "cancelled"):
            return Response(
                {"detail": "Posted or cancelled adjustments cannot be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        adj.status = "cancelled"
        adj.save()
        return Response(StockAdjustmentSerializer(adj).data)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Dashboard summary of adjustments."""
        from django.db.models import Sum, Count, Q

        qs = self.queryset
        total = qs.count()
        pending = qs.filter(status="pending").count()
        approved = qs.filter(status="approved").count()
        posted = qs.filter(status="posted").count()
        draft = qs.filter(status="draft").count()
        total_value = qs.filter(status="posted").aggregate(
            v=Sum("total_value_impact")
        )["v"] or 0
        return Response({
            "total": total,
            "pending": pending,
            "approved": approved,
            "posted": posted,
            "draft": draft,
            "total_value_impact": total_value,
        })

