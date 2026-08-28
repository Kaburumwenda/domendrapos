from decimal import Decimal
from django.db.models import Sum, Count, F, Q
from django.db.models.functions import (
    TruncDate,
    ExtractHour,
    ExtractIsoWeekDay,
)
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime, timedelta
import math

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
        from pos.models import POSTransaction
        from inventory.models import StockItem
        from customers.models import Customer

        today = datetime.now().date()
        sales_today = POSTransaction.objects.filter(
            created_at__date=today, status="completed"
        )
        agg = sales_today.aggregate(total=Sum("total"), count=Count("id"))
        total_sales_today = agg["total"] or Decimal("0")
        low_stock_count = StockItem.objects.filter(
            quantity_on_hand__lte=F("reorder_level")
        ).count()
        active_customers = Customer.objects.filter(is_active=True).count()
        return Response({
            "total_sales_today": _dec(total_sales_today),
            "transactions_today": agg["count"] or 0,
            "low_stock_items": low_stock_count,
            "active_customers": active_customers,
        })

    # ── Dashboard KPIs (date-range aware, server-side aggregation) ──

    @action(detail=False, methods=["get"])
    def dashboard_kpis(self, request):
        """All KPI numbers for the dashboard stat cards, computed server-side.

        Accepts ``date_from`` / ``date_to`` (YYYY-MM-DD) and ``branch`` (id)
        query parameters so the frontend can slice KPIs by period and branch
        without fetching every transaction record.
        """
        from pos.models import POSTransaction, POSTransactionItem
        from inventory.models import StockItem

        date_from, date_to = _date_range(request)
        branch = request.query_params.get("branch")

        def _base_qs():
            qs = POSTransaction.objects.filter(status="completed")
            if branch:
                qs = qs.filter(branch_id=branch)
            if date_from:
                qs = qs.filter(created_at__date__gte=date_from)
            if date_to:
                qs = qs.filter(created_at__date__lte=date_to)
            return qs

        # ── Current-period aggregates ──────────────────────────────
        cur = _base_qs()
        agg = cur.aggregate(
            revenue=Sum("total"),
            tx_count=Count("id"),
            total_tax=Sum("tax"),
            total_discounts=Sum("discount"),
        )
        revenue = agg["revenue"] or Decimal("0")
        tx_count = agg["tx_count"] or 0

        # Items sold + COGS from line items
        item_qs = POSTransactionItem.objects.filter(transaction__in=cur)
        item_agg = item_qs.aggregate(
            items_sold=Sum("quantity"),
            total_cost=Sum(F("quantity") * F("product__cost_price")),
        )
        items_sold = item_agg["items_sold"] or 0
        total_cost = item_agg["total_cost"] or Decimal("0")
        gross_profit = revenue - total_cost
        gross_margin = (
            (gross_profit / revenue * 100) if revenue else Decimal("0")
        )
        aov = (revenue / tx_count) if tx_count else Decimal("0")

        # ── Previous-period revenue (for growth %) ─────────────────
        growth_pct = Decimal("0")
        prev_revenue = Decimal("0")
        if date_from and date_to:
            from_dt = datetime.strptime(date_from, "%Y-%m-%d").date()
            to_dt = datetime.strptime(date_to, "%Y-%m-%d").date()
            range_days = (to_dt - from_dt).days + 1
            prev_to = from_dt - timedelta(days=1)
            prev_from = prev_to - timedelta(days=range_days - 1)
            pqs = POSTransaction.objects.filter(
                status="completed",
                created_at__date__gte=prev_from,
                created_at__date__lte=prev_to,
            )
            if branch:
                pqs = pqs.filter(branch_id=branch)
            prev_revenue = pqs.aggregate(t=Sum("total"))["t"] or Decimal("0")
            if prev_revenue:
                growth_pct = ((revenue - prev_revenue) / prev_revenue * 100)

        # ── Stock aggregates ────────────────────────────────────────
        stock_qs = StockItem.objects.all()
        if branch:
            stock_qs = stock_qs.filter(branch_id=branch)
        stock_agg = stock_qs.aggregate(
            stock_value=Sum(F("quantity_on_hand") * F("product__cost_price")),
            stock_items=Count("id"),
            stock_qty=Sum("quantity_on_hand"),
        )
        stock_value = stock_agg["stock_value"] or Decimal("0")
        stock_items = stock_agg["stock_items"] or 0
        stock_qty = stock_agg["stock_qty"] or 0

        return Response({
            "revenue": _dec(revenue),
            "transaction_count": tx_count,
            "items_sold": _dec(items_sold),
            "average_sale": _dec(aov),
            "gross_profit": _dec(gross_profit),
            "gross_margin": _dec(gross_margin),
            "total_cost": _dec(total_cost),
            "total_tax": _dec(agg["total_tax"] or Decimal("0")),
            "total_discounts": _dec(agg["total_discounts"] or Decimal("0")),
            "growth_pct": _dec(growth_pct),
            "previous_revenue": _dec(prev_revenue),
            "stock_value": _dec(stock_value),
            "stock_items": stock_items,
            "stock_qty": _dec(stock_qty),
        })

    # ── Sales Summary ──────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def sales_summary(self, request):
        from pos.models import POSTransaction

        date_from, date_to = _date_range(request)
        branch = request.query_params.get("branch")
        qs = POSTransaction.objects.filter(status="completed")
        if branch:
            qs = qs.filter(branch_id=branch)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        agg = qs.aggregate(
            total_revenue=Sum("total"),
            total_tax=Sum("tax"),
            total_discounts=Sum("discount"),
            transaction_count=Count("id"),
        )
        total_revenue = agg["total_revenue"] or Decimal("0")
        txn = agg["transaction_count"] or 0

        # Compute total cost from line items' product cost_price
        from pos.models import POSTransactionItem
        from django.db.models import Sum as DbSum
        item_cost = POSTransactionItem.objects.filter(
            transaction__in=qs
        ).aggregate(
            total_cost=DbSum(F("quantity") * F("product__cost_price"))
        )
        total_cost = item_cost["total_cost"] or Decimal("0")

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
            "items_sold": _dec(
                POSTransactionItem.objects.filter(transaction__in=qs).aggregate(
                    s=DbSum("quantity")
                )["s"] or 0
            ),
            "total_products": _dec(
                POSTransactionItem.objects.filter(transaction__in=qs).values("product").distinct().count()
            ),
        })

    # ── Sales by Product ───────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def sales_by_product(self, request):
        from pos.models import POSTransactionItem

        date_from, date_to = _date_range(request)
        branch = request.query_params.get("branch")
        qs = POSTransactionItem.objects.filter(transaction__status="completed")
        if branch:
            qs = qs.filter(transaction__branch_id=branch)
        if date_from:
            qs = qs.filter(transaction__created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(transaction__created_at__date__lte=date_to)

        data = (
            qs.values("product__name", "product__sku")
            .annotate(
                qty_sold=Sum("quantity"),
                revenue=Sum("line_total"),
                cost=Sum(F("quantity") * F("product__cost_price")),
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
        from pos.models import POSTransaction
        from pos.models import POSTransactionItem

        date_from, date_to = _date_range(request)
        qs = POSTransaction.objects.filter(status="completed")
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        # Compute total_cost per branch from line items
        item_cost_qs = POSTransactionItem.objects.filter(
            transaction__status="completed"
        )
        if date_from:
            item_cost_qs = item_cost_qs.filter(transaction__created_at__date__gte=date_from)
        if date_to:
            item_cost_qs = item_cost_qs.filter(transaction__created_at__date__lte=date_to)
        cost_by_branch = dict(
            item_cost_qs.values("transaction__branch__name")
            .annotate(total_cost=Sum(F("quantity") * F("product__cost_price")))
            .values_list("transaction__branch__name", "total_cost")
        )

        data = (
            qs.values("branch__name", "branch__code")
            .annotate(
                total_sales=Sum("total"),
                transaction_count=Count("id"),
            )
            .order_by("-total_sales")
        )
        rows = []
        for d in data:
            rev = d["total_sales"] or Decimal("0")
            cost = cost_by_branch.get(d["branch__name"], Decimal("0"))
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
        from pos.models import POSTransaction

        date_from, date_to = _date_range(request)
        qs = POSTransaction.objects.filter(status="completed")
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        data = (
            qs.values("cashier__first_name", "cashier__last_name")
            .annotate(
                total_sales=Sum("total"),
                transaction_count=Count("id"),
            )
            .order_by("-total_sales")
        )
        # Collect total for sharepercentage computation
        grand_total = sum((d["total_sales"] or Decimal("0")) for d in data)
        rows = []
        for d in data:
            name = f"{d['cashier__first_name'] or ''} {d['cashier__last_name'] or ''}".strip()
            sales = d["total_sales"] or Decimal("0")
            txn = d["transaction_count"]
            rows.append({
                "cashier": name or "Unknown",
                "total_sales": _dec(sales),
                "transaction_count": txn,
                "average_sale": _dec(sales / txn) if txn else "0",
                "share_pct": _dec((sales / grand_total * 100) if grand_total else 0),
            })
        return Response(rows)

    # ── Daily Revenue ───────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def daily_revenue(self, request):
        from pos.models import POSTransaction, POSTransactionItem

        date_from, date_to = _date_range(request)
        branch = request.query_params.get("branch")
        qs = POSTransaction.objects.filter(status="completed")
        if branch:
            qs = qs.filter(branch_id=branch)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        # Daily revenue + transaction count
        data = (
            qs.annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(
                revenue=Sum("total"),
                transactions=Count("id"),
            )
            .order_by("day")
        )
        day_to_ids = {}
        for d in data:
            day_to_ids.setdefault(d["day"], set())
        # Daily COGS from line items (one query, grouped by date)
        tx_ids = list(qs.values_list("id", flat=True))
        cost_by_day = {}
        if tx_ids:
            item_qs = (
                POSTransactionItem.objects
                .filter(transaction_id__in=tx_ids)
                .annotate(day=TruncDate("transaction__created_at"))
                .values("day")
                .annotate(cost=Sum(F("quantity") * F("product__cost_price")))
            )
            for r in item_qs:
                cost_by_day[r["day"]] = r["cost"] or Decimal("0")

        rows = []
        for d in data:
            rev = d["revenue"] or Decimal("0")
            cost = cost_by_day.get(d["day"], Decimal("0"))
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
        from pos.models import POSTransaction
        from collections import defaultdict

        date_from, date_to = _date_range(request)
        branch = request.query_params.get("branch")
        qs = POSTransaction.objects.filter(status="completed")
        if branch:
            qs = qs.filter(branch_id=branch)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        data = (
            qs.values("payment_method")
            .annotate(total=Sum("total"), count=Count("id"))
            .order_by("-total")
        )
        rows = [
            {
                "method": d["payment_method"].replace("_", " ").title() if d["payment_method"] else "Unknown",
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
        from pos.models import POSTransaction

        date_from, date_to = _date_range(request)
        qs = POSTransaction.objects.filter(status="completed")
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        data = (
            qs.exclude(customer_name="", customer_phone="")
            .values("customer_name", "customer_phone")
            .annotate(
                total_spent=Sum("total"),
                visits=Count("id"),
            )
            .order_by("-total_spent")[:20]
        )
        rows = [
            {
                "customer": d["customer_name"] or "Walk-in",
                "email": "",
                "tier": "",
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
        from pos.models import POSTransactionItem

        date_from, date_to = _date_range(request)
        qs = POSTransactionItem.objects.filter(transaction__status="completed")
        if date_from:
            qs = qs.filter(transaction__created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(transaction__created_at__date__lte=date_to)
        data = (
            qs.values("product__name", "product__sku")
            .annotate(
                qty_sold=Sum("quantity"),
                revenue=Sum("line_total"),
                cost=Sum(F("quantity") * F("product__cost_price")),
            )
            .order_by("-revenue")
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
        from pos.models import POSTransaction

        date_from, date_to = _date_range(request)
        qs = POSTransaction.objects.filter(status="completed")
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        agg = qs.aggregate(
            total_tax=Sum("tax"),
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

    # ── Sales by Category ────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def sales_by_category(self, request):
        """Revenue, cost, profit, and units grouped by product category."""
        from pos.models import POSTransactionItem

        date_from, date_to = _date_range(request)
        branch = request.query_params.get("branch")
        qs = POSTransactionItem.objects.filter(transaction__status="completed")
        if branch:
            qs = qs.filter(transaction__branch_id=branch)
        if date_from:
            qs = qs.filter(transaction__created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(transaction__created_at__date__lte=date_to)

        data = (
            qs.values("product__category__name")
            .annotate(
                qty_sold=Sum("quantity"),
                revenue=Sum("line_total"),
                cost=Sum(F("quantity") * F("product__cost_price")),
            )
            .order_by("-revenue")
        )
        rows = []
        for d in data:
            rev = d["revenue"] or Decimal("0")
            cost = d["cost"] or Decimal("0")
            rows.append({
                "category": d["product__category__name"] or "Uncategorized",
                "qty_sold": _dec(d["qty_sold"]),
                "revenue": _dec(rev),
                "cost": _dec(cost),
                "profit": _dec(rev - cost),
                "margin": _dec(((rev - cost) / rev * 100) if rev else 0),
            })
        return Response(rows)

    # ── Hourly Sales ────────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def hourly_sales(self, request):
        """Revenue and transaction count grouped by hour of day (0-23)."""
        from pos.models import POSTransaction

        date_from, date_to = _date_range(request)
        branch = request.query_params.get("branch")
        qs = POSTransaction.objects.filter(status="completed")
        if branch:
            qs = qs.filter(branch_id=branch)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        data = (
            qs.annotate(hour=ExtractHour("created_at"))
            .values("hour")
            .annotate(revenue=Sum("total"), transactions=Count("id"))
            .order_by("hour")
        )
        # Fill all 24 hours
        by_hour = {h: {"revenue": Decimal("0"), "transactions": 0} for h in range(24)}
        for d in data:
            h = d["hour"]
            by_hour[h] = {
                "revenue": d["revenue"] or Decimal("0"),
                "transactions": d["transactions"],
            }
        rows = [
            {
                "hour": h,
                "revenue": _dec(by_hour[h]["revenue"]),
                "transactions": by_hour[h]["transactions"],
            }
            for h in range(24)
        ]
        return Response(rows)

    # ── Time of Day Breakdown ───────────────────────────────────────

    @action(detail=False, methods=["get"])
    def time_of_day(self, request):
        """Revenue and transactions grouped by time-of-day ranges."""
        from pos.models import POSTransaction

        date_from, date_to = _date_range(request)
        branch = request.query_params.get("branch")
        qs = POSTransaction.objects.filter(status="completed")
        if branch:
            qs = qs.filter(branch_id=branch)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        data = (
            qs.annotate(hour=ExtractHour("created_at"))
            .values("hour")
            .annotate(revenue=Sum("total"), transactions=Count("id"))
        )

        # Define time ranges
        ranges = [
            {"label": "Morning", "sub": "6am–12pm", "hours": list(range(6, 12)), "color": "#f59e0b", "icon": "mdi-weather-sunny"},
            {"label": "Afternoon", "sub": "12pm–4pm", "hours": list(range(12, 16)), "color": "#3b82f6", "icon": "mdi-weather-sunny-up"},
            {"label": "Evening", "sub": "4pm–8pm", "hours": list(range(16, 20)), "color": "#ea580c", "icon": "mdi-weather-sunset"},
            {"label": "Night", "sub": "8pm–12am", "hours": list(range(20, 24)), "color": "#6366f1", "icon": "mdi-weather-night"},
            {"label": "Late Night", "sub": "12am–6am", "hours": list(range(0, 6)), "color": "#7c3aed", "icon": "mdi-moon-phases"},
        ]

        hour_map = {d["hour"]: {"revenue": d["revenue"] or Decimal("0"), "transactions": d["transactions"]} for d in data}
        total_revenue = sum((v["revenue"] for v in hour_map.values()), Decimal("0"))
        total_txns = sum(v["transactions"] for v in hour_map.values())

        rows = []
        for r in ranges:
            revenue = sum((hour_map.get(h, {}).get("revenue", Decimal("0")) for h in r["hours"]), Decimal("0"))
            transactions = sum(hour_map.get(h, {}).get("transactions", 0) for h in r["hours"])
            rows.append({
                "label": r["label"],
                "sub": r["sub"],
                "color": r["color"],
                "icon": r["icon"],
                "revenue": _dec(revenue),
                "transactions": transactions,
                "revenue_pct": _dec((revenue / total_revenue * 100) if total_revenue else 0),
                "share_pct": _dec((transactions / total_txns * 100) if total_txns else 0),
            })

        return Response({
            "ranges": rows,
            "kpis": {
                "total_revenue": _dec(total_revenue),
                "total_transactions": total_txns,
            },
        })

    # ── Revenue Trend ───────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def revenue_trend(self, request):
        """Daily revenue and cost trend over the selected period."""
        from pos.models import POSTransaction, POSTransactionItem

        date_from, date_to = _date_range(request)
        branch = request.query_params.get("branch")
        qs = POSTransaction.objects.filter(status="completed")
        if branch:
            qs = qs.filter(branch_id=branch)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        daily = (
            qs.annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(revenue=Sum("total"))
            .order_by("day")
        )

        # Compute daily cost from line items
        item_cost = (
            POSTransactionItem.objects.filter(transaction__in=qs)
            .annotate(day=TruncDate("transaction__created_at"))
            .values("day")
            .annotate(cost=Sum(F("quantity") * F("product__cost_price")))
            .order_by("day")
        )
        cost_map = {d["day"]: d["cost"] or Decimal("0") for d in item_cost}

        rows = []
        for d in daily:
            day = d["day"]
            revenue = d["revenue"] or Decimal("0")
            cost = cost_map.get(day, Decimal("0"))
            rows.append({
                "date": day.isoformat() if day else "",
                "revenue": _dec(revenue),
                "cost": _dec(cost),
                "profit": _dec(revenue - cost),
            })

        total_revenue = sum((Decimal(r["revenue"]) for r in rows), Decimal("0"))
        total_cost = sum((Decimal(r["cost"]) for r in rows), Decimal("0"))

        return Response({
            "trend": rows,
            "kpis": {
                "total_revenue": _dec(total_revenue),
                "total_cost": _dec(total_cost),
                "total_profit": _dec(total_revenue - total_cost),
                "days": len(rows),
            },
        })

    # ── Weekday Sales ───────────────────────────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def weekday_sales(self, request):
        """Average revenue grouped by day of week (Mon=0 ... Sun=6)."""
        from pos.models import POSTransaction

        date_from, date_to = _date_range(request)
        branch = request.query_params.get("branch")
        qs = POSTransaction.objects.filter(status="completed")
        if branch:
            qs = qs.filter(branch_id=branch)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        # ExtractIsoWeekDay: Monday=1 ... Sunday=7
        data = (
            qs.annotate(weekday=ExtractIsoWeekDay("created_at"))
            .values("weekday")
            .annotate(revenue=Sum("total"), transactions=Count("id"))
            .order_by("weekday")
        )
        names = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        rows = []
        for d in data:
            wd = d["weekday"]
            txn = d["transactions"]
            rev = d["revenue"] or Decimal("0")
            rows.append({
                "weekday": wd - 1,  # Mon=0
                "name": names[wd] if wd < len(names) else "",
                "revenue": _dec(rev),
                "transactions": txn,
                "avg_revenue": _dec(rev / txn) if txn else "0",
            })
        return Response(rows)

    # ── Peak Hours Heatmap ──────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def peak_hours_heatmap(self, request):
        """24x7 grid of revenue: [hour][weekday Mon=0 ... Sun=6]."""
        from pos.models import POSTransaction

        date_from, date_to = _date_range(request)
        branch = request.query_params.get("branch")
        qs = POSTransaction.objects.filter(status="completed")
        if branch:
            qs = qs.filter(branch_id=branch)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        data = (
            qs.annotate(
                hour=ExtractHour("created_at"),
                weekday=ExtractIsoWeekDay("created_at"),
            )
            .values("hour", "weekday")
            .annotate(revenue=Sum("total"))
        )
        grid = [[Decimal("0") for _ in range(7)] for _ in range(24)]
        for d in data:
            h = d["hour"]
            wd = d["weekday"] - 1  # Mon=0
            if 0 <= h < 24 and 0 <= wd < 7:
                grid[h][wd] += d["revenue"]

        return Response({
            "grid": [[_dec(cell) for cell in row] for row in grid],
            "hours": list(range(24)),
            "weekdays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        })

    # ── Sales Growth ────────────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def sales_growth(self, request):
        """Period-over-period revenue growth percentage."""
        from pos.models import POSTransaction

        date_from, date_to = _date_range(request)
        branch = request.query_params.get("branch")

        if not date_from or not date_to:
            return Response({
                "current_revenue": "0",
                "previous_revenue": "0",
                "growth_pct": "0",
            })

        from_dt = datetime.strptime(date_from, "%Y-%m-%d").date()
        to_dt = datetime.strptime(date_to, "%Y-%m-%d").date()
        range_days = (to_dt - from_dt).days + 1
        prev_to = from_dt - timedelta(days=1)
        prev_from = prev_to - timedelta(days=range_days - 1)

        def _revenue(start, end):
            qs = POSTransaction.objects.filter(
                status="completed",
                created_at__date__gte=start,
                created_at__date__lte=end,
            )
            if branch:
                qs = qs.filter(branch_id=branch)
            return qs.aggregate(t=Sum("total"))["t"] or Decimal("0")

        current_rev = _revenue(from_dt, to_dt)
        previous_rev = _revenue(prev_from, prev_to)
        growth = (
            ((current_rev - previous_rev) / previous_rev * 100)
            if previous_rev else 0
        )
        return Response({
            "current_revenue": _dec(current_rev),
            "previous_revenue": _dec(previous_rev),
            "growth_pct": _dec(growth),
        })

    # ── Product Analytics ───────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def product_analytics(self, request):
        """Product-level analytics: top products, ABC by revenue, dead stock, KPIs."""
        from pos.models import POSTransactionItem
        from products.models import Product
        from inventory.models import StockItem

        date_from, date_to = _date_range(request)
        branch = request.query_params.get("branch")
        qs = POSTransactionItem.objects.filter(transaction__status="completed")
        if branch:
            qs = qs.filter(transaction__branch_id=branch)
        if date_from:
            qs = qs.filter(transaction__created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(transaction__created_at__date__lte=date_to)

        data = (
            qs.values("product__name", "product__sku", "product__category__name")
            .annotate(
                qty_sold=Sum("quantity"),
                revenue=Sum("line_total"),
                cost=Sum(F("quantity") * F("product__cost_price")),
            )
            .order_by("-revenue")
        )
        total_revenue = sum((d["revenue"] or Decimal("0")) for d in data)

        # ABC classification by revenue (Pareto: A=top 80%, B=next 15%, C=bottom 5%)
        abc_rows = []
        cumulative = Decimal("0")
        for d in data:
            rev = d["revenue"] or Decimal("0")
            cumulative += rev
            pct = (cumulative / total_revenue * 100) if total_revenue else 0
            cls = "A" if pct <= 80 else ("B" if pct <= 95 else "C")
            abc_rows.append({
                "product": d["product__name"] or "",
                "sku": d["product__sku"] or "",
                "category": d["product__category__name"] or "Uncategorized",
                "qty_sold": _dec(d["qty_sold"]),
                "revenue": _dec(rev),
                "cost": _dec(d["cost"] or Decimal("0")),
                "profit": _dec(rev - (d["cost"] or Decimal("0"))),
                "margin": _dec(
                    ((rev - (d["cost"] or Decimal("0"))) / rev * 100) if rev else 0
                ),
                "abc_class": cls,
                "revenue_share": _dec((rev / total_revenue * 100) if total_revenue else 0),
            })

        abc_counts = {"A": 0, "B": 0, "C": 0}
        for r in abc_rows:
            abc_counts[r["abc_class"]] += 1

        # Dead stock (products never sold in the period)
        sold_skus = {d["product__sku"] for d in data if d["product__sku"]}
        all_products = Product.objects.select_related("category").all()
        dead_stock = []
        for p in all_products:
            if p.sku and p.sku not in sold_skus:
                # Calculate stock value from stock items
                stock_qty = StockItem.objects.filter(
                    product=p
                ).aggregate(total=Sum("quantity_on_hand"))["total"] or Decimal("0")
                dead_stock.append({
                    "name": p.name,
                    "sku": p.sku,
                    "cost_price": _dec(p.cost_price),
                    "retail_price": _dec(p.retail_price),
                    "quantity_on_hand": _dec(stock_qty),
                    "stock_value": _dec(stock_qty * p.cost_price),
                })

        # Stock value across all products
        stock_qs = StockItem.objects.all()
        if branch:
            stock_qs = stock_qs.filter(branch_id=branch)
        stock_agg = stock_qs.aggregate(
            value=Sum(F("quantity_on_hand") * F("product__cost_price"))
        )
        stock_value = stock_agg["value"] or Decimal("0")

        return Response({
            "top_products": abc_rows[:20],
            "abc_analysis": abc_rows,
            "abc_counts": abc_counts,
            "kpis": {
                "total_products": all_products.count(),
                "products_sold": len(sold_skus),
                "products_never_sold": len(dead_stock),
                "total_revenue": _dec(total_revenue),
                "stock_value": _dec(stock_value),
                "top_product_revenue": _dec(
                    abc_rows[0]["revenue"] if abc_rows else 0
                ),
                "top_product_share": _dec(
                    abc_rows[0]["revenue_share"] if abc_rows else 0
                ),
            },
            "dead_stock": dead_stock[:50],
        })

    # ── Category Analytics ─────────────────────────────────────────

    @action(detail=False, methods=["get"])
    def category_analytics(self, request):
        """Category-level analytics: revenue, units, stock value per category."""
        from pos.models import POSTransactionItem
        from products.models import Product
        from inventory.models import StockItem

        date_from, date_to = _date_range(request)
        branch = request.query_params.get("branch")
        qs = POSTransactionItem.objects.filter(transaction__status="completed")
        if branch:
            qs = qs.filter(transaction__branch_id=branch)
        if date_from:
            qs = qs.filter(transaction__created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(transaction__created_at__date__lte=date_to)

        data = (
            qs.values("product__category__name")
            .annotate(
                qty_sold=Sum("quantity"),
                revenue=Sum("line_total"),
                cost=Sum(F("quantity") * F("product__cost_price")),
            )
            .order_by("-revenue")
        )
        total_revenue = sum((d["revenue"] or Decimal("0")) for d in data)

        # Stock value per category
        stock_qs = StockItem.objects.all()
        if branch:
            stock_qs = stock_qs.filter(branch_id=branch)
        stock_data = (
            stock_qs.values("product__category__name")
            .annotate(
                stock_value=Sum(F("quantity_on_hand") * F("product__cost_price")),
                unit_count=Sum("quantity_on_hand"),
                sku_count=Count("product", distinct=True),
            )
        )
        stock_map = {
            d["product__category__name"] or "Uncategorized": d
            for d in stock_data
        }

        rows = []
        for d in data:
            cat = d["product__category__name"] or "Uncategorized"
            rev = d["revenue"] or Decimal("0")
            cost = d["cost"] or Decimal("0")
            s = stock_map.get(cat, {})
            rows.append({
                "category": cat,
                "qty_sold": _dec(d["qty_sold"]),
                "revenue": _dec(rev),
                "cost": _dec(cost),
                "profit": _dec(rev - cost),
                "margin": _dec(((rev - cost) / rev * 100) if rev else 0),
                "revenue_share": _dec((rev / total_revenue * 100) if total_revenue else 0),
                "stock_value": _dec(s.get("stock_value") or Decimal("0")),
                "unit_count": _dec(s.get("unit_count") or 0),
                "sku_count": s.get("sku_count") or 0,
            })

        return Response({
            "categories": rows,
            "kpis": {
                "total_revenue": _dec(total_revenue),
                "total_categories": len(rows),
                "top_category": rows[0]["category"] if rows else "",
                "top_category_revenue": _dec(rows[0]["revenue"] if rows else 0),
                "top_category_share": _dec(rows[0]["revenue_share"] if rows else 0),
            },
        })


class ReportSnapshotViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ReportSnapshot.objects.all()
    serializer_class = ReportSnapshotSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["report_type", "branch"]

