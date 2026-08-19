from decimal import Decimal
from django.db.models import Sum, Count, F
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime, timedelta

from .models import ReportSnapshot
from .serializers import ReportSnapshotSerializer


def _date_range(request):
    """Extract date_from / date_to from query params; return (date_from, date_to)."""
    return (
        request.query_params.get("date_from"),
        request.query_params.get("date_to"),
    )


def _dec(v) -> str:
    """Safely convert a value to a string decimal for JSON serialisation."""
    if v is None:
        return "0"
    if isinstance(v, Decimal):
        return str(v)
    return str(v)


class ReportViewSet(viewsets.ViewSet):
    """
    Provides on-the-fly generated reports and analytics.
    All endpoints accept optional ``date_from`` / ``date_to`` (YYYY-MM-DD)
    and ``branch`` (branch id) query parameters.
    """

    permission_classes = [permissions.IsAuthenticated]

    # ── Dashboard KPIs ──────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        """KPI cards for the dashboard."""
        from sales.models import Sale
        from inventory.models import StockItem
        from customers.models import Customer

        today = datetime.now().date()
        sales_today = Sale.objects.filter(
            sale_date__date=today, status="completed"
        )
        total_sales_today = sum(s.grand_total for s in sales_today)
        low_stock_count = StockItem.objects.filter(
            quantity_on_hand__lte=F("reorder_level")
        ).count()
        active_customers = Customer.objects.filter(is_active=True).count()
        return Response({
            "total_sales_today": _dec(total_sales_today),
            "transactions_today": sales_today.count(),
            "low_stock_items": low_stock_count,
            "active_customers": active_customers,
        })

    # ── Sales Summary ──────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def sales_summary(self, request):
        from sales.models import Sale

        date_from, date_to = _date_range(request)
        branch = request.query_params.get("branch")
        qs = Sale.objects.filter(status="completed")
        if branch:
            qs = qs.filter(branch_id=branch)
        if date_from:
            qs = qs.filter(sale_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(sale_date__date__lte=date_to)

        agg = qs.aggregate(
            total_revenue=Sum("grand_total"),
            total_tax=Sum("tax_total"),
            total_cost=Sum("total_cost"),
            total_discounts=Sum("discount_total"),
            transaction_count=Count("id"),
        )
        total_revenue = agg["total_revenue"] or Decimal("0")
        total_cost = agg["total_cost"] or Decimal("0")
        txn = agg["transaction_count"] or 0

        return Response({
            "total_revenue": _dec(total_revenue),
            "total_tax": _dec(agg["total_tax"]),
            "total_cost": _dec(total_cost),
            "gross_profit": _dec(total_revenue - total_cost),
            "gross_margin": _dec(
                ((total_revenue - total_cost) / total_revenue * 100)
                if total_revenue else 0
            ),
            "total_discounts": _dec(agg["total_discounts"]),
            "transaction_count": txn,
            "average_sale": _dec(total_revenue / txn) if txn else "0",
        })

    # ── Sales by Product ───────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def sales_by_product(self, request):
        from sales.models import SaleLine

        date_from, date_to = _date_range(request)
        branch = request.query_params.get("branch")
        qs = SaleLine.objects.filter(sale__status="completed")
        if branch:
            qs = qs.filter(sale__branch_id=branch)
        if date_from:
            qs = qs.filter(sale__sale_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(sale__sale_date__date__lte=date_to)

        data = (
            qs.values("product__name", "product__sku")
            .annotate(
                qty_sold=Sum("quantity"),
                revenue=Sum(F("quantity") * F("unit_price")),
                cost=Sum(F("quantity") * F("cost_price")),
            )
            .order_by("-revenue")
        )
        rows = []
        for d in data:
            rev = d["revenue"] or Decimal("0")
            cost = d["cost"] or Decimal("0")
            rows.append({
                "product": d["product__name"] or "",
                "sku": d["product__sku"] or "",
                "qty_sold": _dec(d["qty_sold"]),
                "revenue": _dec(rev),
                "cost": _dec(cost),
                "profit": _dec(rev - cost),
                "margin": _dec(((rev - cost) / rev * 100) if rev else 0),
            })
        return Response(rows)

    # ── Sales by Branch ────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def sales_by_branch(self, request):
        from sales.models import Sale

        date_from, date_to = _date_range(request)
        qs = Sale.objects.filter(status="completed")
        if date_from:
            qs = qs.filter(sale_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(sale_date__date__lte=date_to)

        data = (
            qs.values("branch__name", "branch__code")
            .annotate(
                total_sales=Sum("grand_total"),
                total_cost=Sum("total_cost"),
                transaction_count=Count("id"),
            )
            .order_by("-total_sales")
        )
        rows = []
        for d in data:
            rev = d["total_sales"] or Decimal("0")
            cost = d["total_cost"] or Decimal("0")
            rows.append({
                "branch": d["branch__name"] or "",
                "code": d["branch__code"] or "",
                "total_sales": _dec(rev),
                "total_cost": _dec(cost),
                "gross_profit": _dec(rev - cost),
                "transaction_count": d["transaction_count"],
                "average_sale": _dec(rev / d["transaction_count"]) if d["transaction_count"] else "0",
            })
        return Response(rows)

    # ── Sales by Cashier ───────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def sales_by_cashier(self, request):
        from sales.models import Sale

        date_from, date_to = _date_range(request)
        qs = Sale.objects.filter(status="completed")
        if date_from:
            qs = qs.filter(sale_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(sale_date__date__lte=date_to)

        data = (
            qs.values("cashier__first_name", "cashier__last_name")
            .annotate(
                total_sales=Sum("grand_total"),
                transaction_count=Count("id"),
            )
            .order_by("-total_sales")
        )
        rows = []
        for d in data:
            name = f"{d['cashier__first_name'] or ''} {d['cashier__last_name'] or ''}".strip()
            rows.append({
                "cashier": name or "Unknown",
                "total_sales": _dec(d["total_sales"]),
                "transaction_count": d["transaction_count"],
                "average_sale": _dec(d["total_sales"] / d["transaction_count"]) if d["transaction_count"] else "0",
            })
        return Response(rows)

    # ── Daily Revenue ───────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def daily_revenue(self, request):
        from sales.models import Sale

        date_from, date_to = _date_range(request)
        qs = Sale.objects.filter(status="completed")
        if date_from:
            qs = qs.filter(sale_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(sale_date__date__lte=date_to)

        data = (
            qs.extra({"day": "date(sale_date)"})
            .values("day")
            .annotate(
                revenue=Sum("grand_total"),
                cost=Sum("total_cost"),
                transactions=Count("id"),
            )
            .order_by("day")
        )
        rows = []
        for d in data:
            rev = d["revenue"] or Decimal("0")
            cost = d["cost"] or Decimal("0")
            rows.append({
                "date": d["day"],
                "revenue": _dec(rev),
                "cost": _dec(cost),
                "profit": _dec(rev - cost),
                "transactions": d["transactions"],
            })
        return Response(rows)

    # ── Inventory Valuation ────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def inventory_valuation(self, request):
        from inventory.models import StockItem

        branch = request.query_params.get("branch")
        qs = StockItem.objects.all()
        if branch:
            qs = qs.filter(branch_id=branch)
        data = (
            qs.values("product__sku", "product__name", "branch__name")
            .annotate(
                qty_on_hand=Sum("quantity_on_hand"),
                stock_value=Sum(F("quantity_on_hand") * F("product__cost_price")),
                retail_value=Sum(F("quantity_on_hand") * F("product__retail_price")),
            )
            .order_by("-stock_value")
        )
        rows = []
        for d in data:
            cost_val = d["stock_value"] or Decimal("0")
            retail_val = d["retail_value"] or Decimal("0")
            rows.append({
                "product": d["product__name"] or "",
                "sku": d["product__sku"] or "",
                "branch": d["branch__name"] or "",
                "qty_on_hand": _dec(d["qty_on_hand"]),
                "cost_value": _dec(cost_val),
                "retail_value": _dec(retail_val),
                "potential_profit": _dec(retail_val - cost_val),
            })
        return Response(rows)

    # ── Low Stock ──────────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def low_stock(self, request):
        from inventory.models import StockItem

        branch = request.query_params.get("branch")
        qs = StockItem.objects.filter(quantity_on_hand__lte=F("reorder_level"))
        if branch:
            qs = qs.filter(branch_id=branch)
        data = [
            {
                "product": item.product.name,
                "sku": item.product.sku,
                "branch": item.branch.name,
                "on_hand": _dec(item.quantity_on_hand),
                "reorder_level": _dec(item.reorder_level),
                "shortage": _dec(item.reorder_level - item.quantity_on_hand),
            }
            for item in qs.select_related("product", "branch")
        ]
        return Response(data)

    # ── Payment Methods ────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def payment_methods(self, request):
        from payments.models import Payment

        date_from, date_to = _date_range(request)
        qs = Payment.objects.filter(status="captured")
        if date_from:
            qs = qs.filter(processed_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(processed_at__date__lte=date_to)
        data = (
            qs.values("method")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("-total")
        )
        rows = [
            {
                "method": d["method"].replace("_", " ").title() if d["method"] else "Unknown",
                "total": _dec(d["total"]),
                "count": d["count"],
            }
            for d in data
        ]
        # Compute percentage
        grand_total = sum(Decimal(r["total"]) for r in rows)
        for r in rows:
            r["percentage"] = _dec(
                (Decimal(r["total"]) / grand_total * 100) if grand_total else 0
            )
        return Response(rows)

    # ── Top Customers ──────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def top_customers(self, request):
        from sales.models import Sale

        date_from, date_to = _date_range(request)
        qs = Sale.objects.filter(status="completed", customer__isnull=False)
        if date_from:
            qs = qs.filter(sale_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(sale_date__date__lte=date_to)
        data = (
            qs.values("customer__full_name", "customer__email", "customer__loyalty_tier")
            .annotate(
                total_spent=Sum("grand_total"),
                visits=Count("id"),
            )
            .order_by("-total_spent")[:20]
        )
        rows = [
            {
                "customer": d["customer__full_name"] or "",
                "email": d["customer__email"] or "",
                "tier": d["customer__loyalty_tier"] or "",
                "total_spent": _dec(d["total_spent"]),
                "visits": d["visits"],
                "average_spend": _dec(d["total_spent"] / d["visits"]) if d["visits"] else "0",
            }
            for d in data
        ]
        return Response(rows)

    # ── Profit Margin ──────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def profit_margin(self, request):
        from sales.models import SaleLine

        date_from, date_to = _date_range(request)
        qs = SaleLine.objects.filter(sale__status="completed")
        if date_from:
            qs = qs.filter(sale__sale_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(sale__sale_date__date__lte=date_to)
        data = (
            qs.values("product__name", "product__sku")
            .annotate(
                qty_sold=Sum("quantity"),
                revenue=Sum("line_total"),
                cost=Sum(F("quantity") * F("cost_price")),
            )
            .order_by("margin_abs" if False else "-revenue")
        )
        rows = []
        for d in data:
            rev = d["revenue"] or Decimal("0")
            cost = d["cost"] or Decimal("0")
            profit = rev - cost
            rows.append({
                "product": d["product__name"] or "",
                "sku": d["product__sku"] or "",
                "qty_sold": _dec(d["qty_sold"]),
                "revenue": _dec(rev),
                "cost": _dec(cost),
                "profit": _dec(profit),
                "margin": _dec((profit / rev * 100) if rev else 0),
            })
        # Sort by margin descending
        rows.sort(key=lambda r: float(r["margin"]), reverse=True)
        return Response(rows)

    # ── Tax Collected ──────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def tax_collected(self, request):
        from sales.models import Sale

        date_from, date_to = _date_range(request)
        qs = Sale.objects.filter(status="completed")
        if date_from:
            qs = qs.filter(sale_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(sale_date__date__lte=date_to)
        agg = qs.aggregate(
            total_tax=Sum("tax_total"),
            total_revenue=Sum("subtotal"),
        )
        tax = agg["total_tax"] or Decimal("0")
        revenue = agg["total_revenue"] or Decimal("0")
        return Response({
            "total_tax_collected": _dec(tax),
            "taxable_sales": _dec(revenue),
            "effective_rate": _dec((tax / revenue * 100) if revenue else 0),
            "transaction_count": qs.count(),
        })

    # ── Stock Movement ────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def stock_movement(self, request):
        from inventory.models import StockMovement

        date_from, date_to = _date_range(request)
        qs = StockMovement.objects.all()
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        data = (
            qs.values("movement_type", "product__name", "branch__name")
            .annotate(
                total_qty=Sum("quantity_change"),
                count=Count("id"),
            )
            .order_by("-count")
        )
        rows = [
            {
                "type": d["movement_type"].replace("_", " ").title() if d["movement_type"] else "",
                "product": d["product__name"] or "",
                "branch": d["branch__name"] or "",
                "quantity_change": _dec(d["total_qty"]),
                "movement_count": d["count"],
            }
            for d in data
        ]
        return Response(rows)


class ReportSnapshotViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ReportSnapshot.objects.all()
    serializer_class = ReportSnapshotSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["report_type", "branch"]

