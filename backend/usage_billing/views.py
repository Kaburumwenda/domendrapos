"""
Usage-billing API (tenant-facing).

  GET  /api/usage-billing/dashboard/         – current month usage + projection
  GET  /api/usage-billing/range/              – custom date range aggregation
  GET  /api/usage-billing/bills/<pk>/         – single bill detail
  GET  /api/usage-billing/billing-status/     – lightweight overdue/lock status
  GET  /api/usage-billing/payments/           – outstanding/paid bills, wallet, mpesa
  POST /api/usage-billing/payments/coupon/apply/ – apply a coupon to a bill
"""
import calendar
from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from tenants.views import IsSuperAdmin

from .models import BillingRate, DailyUsage, MonthlyBill, BillingCoupon
from .serializers import BillingRateSerializer, MonthlyBillSerializer


# Roles that are allowed to clear/pay bills on behalf of their tenant.
TENANT_BILLING_ADMIN_ROLES = {"super_admin", "tenant_admin", "manager"}

# Default number of days after a bill's due date before API access is locked.
OVERDUE_GRACE_DAYS = 7


# ── helpers ───────────────────────────────────────────────────────────────────

def _month_bounds(year: int, month: int):
    first = date(year, month, 1)
    last = date(year, month, calendar.monthrange(year, month)[1])
    return first, last


def _aggregate(tenant, start, end):
    qs = DailyUsage.objects.filter(tenant=tenant, date__gte=start, date__lte=end)
    total = qs.aggregate(total=Sum("request_count"))["total"] or 0
    daily = list(qs.order_by("date").values("date", "request_count"))
    return total, daily


def _project_month_total(total_so_far: int, day: date) -> int:
    days_in_month = calendar.monthrange(day.year, day.month)[1]
    days_elapsed = day.day
    if days_elapsed <= 0:
        return total_so_far
    avg = total_so_far / days_elapsed
    return int(round(avg * days_in_month))


def _due_date_for(year: int, month: int) -> date:
    """Bills are due 14 days after the end of the billed month."""
    _, last = _month_bounds(year, month)
    return last + timedelta(days=14)


def _last_completed_month(today: date):
    if today.month == 1:
        return today.year - 1, 12
    return today.year, today.month - 1


def _ensure_tenant_bills(tenant, rate, today: date):
    """Backfill ISSUED bills for completed months that have usage but no bill."""
    earliest = (
        DailyUsage.objects.filter(tenant=tenant, request_count__gt=0)
        .order_by("date")
        .values_list("date", flat=True)
        .first()
    )
    if not earliest:
        return

    last_y, last_m = _last_completed_month(today)
    existing = set(
        MonthlyBill.objects.filter(tenant=tenant).values_list("year", "month")
    )

    y, m = earliest.year, earliest.month
    to_create = []
    while (y, m) <= (last_y, last_m):
        if (y, m) not in existing:
            start, end = _month_bounds(y, m)
            total, _ = _aggregate(tenant, start, end)
            if total > 0:
                to_create.append(
                    MonthlyBill(
                        tenant=tenant,
                        year=y,
                        month=m,
                        total_requests=total,
                        requests_per_unit=rate.requests_per_unit,
                        unit_cost=rate.unit_cost,
                        amount=rate.cost_for(total),
                        currency=rate.currency,
                        status=MonthlyBill.Status.ISSUED,
                        due_date=_due_date_for(y, m),
                        issued_at=timezone.now(),
                    )
                )
        if m == 12:
            y, m = y + 1, 1
        else:
            m += 1

    if to_create:
        MonthlyBill.objects.bulk_create(to_create, ignore_conflicts=True)


def _billing_summary(tenant, currency):
    """Outstanding / paid / overdue totals across all of a tenant's bills."""
    bills = list(MonthlyBill.objects.filter(tenant=tenant))
    total_billed = Decimal("0")
    total_paid = Decimal("0")
    total_outstanding = Decimal("0")
    total_overdue = Decimal("0")
    outstanding_count = 0
    overdue_count = 0
    paid_count = 0
    for b in bills:
        amount = Decimal(b.amount or 0)
        total_billed += amount
        total_paid += Decimal(b.paid_amount or 0)
        if b.status == MonthlyBill.Status.PAID:
            paid_count += 1
        elif b.status in (
            MonthlyBill.Status.ISSUED,
            MonthlyBill.Status.DRAFT,
            MonthlyBill.Status.PARTIAL,
        ):
            balance = b.balance
            total_outstanding += balance
            outstanding_count += 1
            if b.is_overdue:
                total_overdue += balance
                overdue_count += 1
    return {
        "currency": currency,
        "total_bills": len(bills),
        "total_billed": str(total_billed),
        "total_paid": str(total_paid),
        "paid_count": paid_count,
        "total_outstanding": str(total_outstanding),
        "outstanding_count": outstanding_count,
        "total_overdue": str(total_overdue),
        "overdue_count": overdue_count,
    }


def compute_billing_lock(tenant):
    """Determine whether a tenant's API access should be locked for billing.

    A tenant is locked when it has any overdue bill past the grace period.
    Returns a JSON-friendly dict.
    """
    today = timezone.localdate()
    overdue_bills = [
        b for b in MonthlyBill.objects.filter(tenant=tenant)
        if b.is_overdue and b.balance > 0
    ]
    total_overdue = sum((b.balance for b in overdue_bills), Decimal("0"))
    overdue_count = len(overdue_bills)
    oldest_due = min((b.due_date for b in overdue_bills), default=None)
    days_overdue = (today - oldest_due).days if oldest_due else 0

    if overdue_count and days_overdue > OVERDUE_GRACE_DAYS:
        locked = True
        reason = (
            f"You have {overdue_count} overdue bill(s) totalling "
            f"{total_overdue} — {days_overdue} day(s) past due."
        )
    else:
        locked = False
        reason = ""

    return {
        "locked": locked,
        "reason": reason,
        "has_overdue": overdue_count > 0,
        "total_overdue": str(total_overdue),
        "overdue_count": overdue_count,
        "oldest_due_date": oldest_due,
        "days_overdue": days_overdue,
        "grace_days": OVERDUE_GRACE_DAYS,
    }


# ── billing status ────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def billing_status(request):
    """Lightweight overdue / lock status for the current tenant."""
    tenant = getattr(request, "tenant", None)
    if tenant is None or getattr(tenant, "schema_name", "public") == "public":
        return Response({
            "locked": False, "has_overdue": False, "overdue_count": 0,
            "total_overdue": "0", "is_billing_admin": True,
            "tenant_name": None,
            "currency": "KSH",
        })
    rate = BillingRate.current()
    _ensure_tenant_bills(tenant, rate, timezone.localdate())
    lock = compute_billing_lock(tenant)
    lock["is_billing_admin"] = request.user.role in TENANT_BILLING_ADMIN_ROLES
    lock["tenant_name"] = tenant.name
    lock["currency"] = rate.currency
    return Response(lock)


# ── apply coupon ───────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def apply_coupon(request):
    """Tenant applies a coupon/offer code to reduce an overdue/outstanding bill."""
    tenant = getattr(request, "tenant", None)
    if tenant is None or getattr(tenant, "schema_name", "public") == "public":
        return Response({"detail": "No tenant context."}, status=status.HTTP_400_BAD_REQUEST)

    code = (request.data.get("code") or "").strip()
    bill_id = request.data.get("bill_id")
    if not code:
        return Response({"detail": "Enter a coupon code."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        bill = MonthlyBill.objects.get(pk=bill_id, tenant=tenant)
    except MonthlyBill.DoesNotExist:
        return Response({"detail": "Bill not found."}, status=status.HTTP_404_NOT_FOUND)
    if bill.balance <= 0:
        return Response({"detail": "This bill is already settled."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        coupon = BillingCoupon.objects.get(code__iexact=code)
    except BillingCoupon.DoesNotExist:
        return Response({"detail": "Invalid coupon code."}, status=status.HTTP_404_NOT_FOUND)

    ok, why = coupon.is_valid_for(tenant, bill_balance=bill.balance)
    if not ok:
        return Response({"detail": why}, status=status.HTTP_400_BAD_REQUEST)

    discount = coupon.compute_discount(bill.balance)
    if discount <= 0:
        return Response({"detail": "This coupon has no value for this bill."},
                        status=status.HTTP_400_BAD_REQUEST)

    applied = bill.apply_discount(discount, note=f"Coupon {coupon.code} applied (-{discount} {bill.currency}).")
    coupon.times_used += 1
    if coupon.times_used >= coupon.max_uses:
        coupon.is_active = False
    coupon.save(update_fields=["times_used", "is_active"])

    return Response({
        "detail": f"Coupon applied — {applied} {bill.currency} off.",
        "discount_applied": str(applied),
        "bill_status": bill.effective_status,
        "bill_balance": str(bill.balance),
    })


# ── tenant dashboard ──────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tenant_dashboard(request):
    """Usage stats for the current authenticated tenant."""
    tenant = getattr(request, "tenant", None)
    if tenant is None or getattr(tenant, "schema_name", "public") == "public":
        return Response(
            {"detail": "No tenant context for this request."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    today = timezone.localdate()
    month_start, month_end = _month_bounds(today.year, today.month)
    total, daily = _aggregate(tenant, month_start, month_end)

    rate = BillingRate.current()
    cost_so_far = rate.cost_for(total)
    projected_requests = _project_month_total(total, today)
    projected_cost = rate.cost_for(projected_requests)

    # last 30 days for charting
    last_30_start = today - timedelta(days=29)
    last_30_total, last_30 = _aggregate(tenant, last_30_start, today)

    _ensure_tenant_bills(tenant, rate, today)

    recent_bills = MonthlyBill.objects.filter(tenant=tenant).order_by("-year", "-month")[:12]
    billing_summary = _billing_summary(tenant, rate.currency)

    # Previous month comparison
    if today.month == 1:
        prev_year, prev_month = today.year - 1, 12
    else:
        prev_year, prev_month = today.year, today.month - 1
    prev_start, prev_end = _month_bounds(prev_year, prev_month)
    prev_total, _ = _aggregate(tenant, prev_start, prev_end)

    cmp_end = min(prev_start.replace(day=today.day) if today.day <= calendar.monthrange(prev_year, prev_month)[1]
                  else prev_end, prev_end)
    prev_same_period_total, _ = _aggregate(tenant, prev_start, cmp_end)
    if prev_same_period_total > 0:
        mom_change_pct = round(((total - prev_same_period_total) / prev_same_period_total) * 100, 2)
    else:
        mom_change_pct = None

    # Trailing-7-day average and today vs yesterday
    week_start = today - timedelta(days=6)
    week_total, week_daily = _aggregate(tenant, week_start, today)
    avg_7d = round(week_total / 7, 2) if week_total else 0
    today_count = next((d["request_count"] for d in week_daily if d["date"] == today), 0)
    yesterday = today - timedelta(days=1)
    yesterday_count = next((d["request_count"] for d in week_daily if d["date"] == yesterday), 0)

    peak_day = max(daily, key=lambda d: d["request_count"], default=None)

    days_in_month = calendar.monthrange(today.year, today.month)[1]
    days_remaining = days_in_month - today.day
    daily_avg_so_far = round(total / max(today.day, 1), 2)

    # Weekday distribution over last 30 days
    weekday_counts = [0] * 7
    weekday_days = [0] * 7
    for d in last_30:
        wd = d["date"].weekday() if hasattr(d["date"], "weekday") else date.fromisoformat(str(d["date"])).weekday()
        weekday_counts[wd] += d["request_count"]
        weekday_days[wd] += 1
    weekday_breakdown = [
        {
            "weekday": i,
            "label": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
            "total": weekday_counts[i],
            "average": round(weekday_counts[i] / weekday_days[i], 2) if weekday_days[i] else 0,
        }
        for i in range(7)
    ]

    # Last 6 months series
    monthly_history = []
    cursor_y, cursor_m = today.year, today.month
    for _ in range(6):
        ms, me = _month_bounds(cursor_y, cursor_m)
        m_total, _ = _aggregate(tenant, ms, me)
        monthly_history.append(
            {
                "year": cursor_y,
                "month": cursor_m,
                "label": f"{cursor_y}-{cursor_m:02d}",
                "total_requests": m_total,
                "cost": str(rate.cost_for(m_total)),
            }
        )
        if cursor_m == 1:
            cursor_y, cursor_m = cursor_y - 1, 12
        else:
            cursor_m -= 1
    monthly_history.reverse()

    return Response(
        {
            "tenant": {
                "id": tenant.id,
                "name": tenant.name,
                "schema": tenant.schema_name,
            },
            "current_month": {
                "year": today.year,
                "month": today.month,
                "start": month_start,
                "end": month_end,
                "total_requests": total,
                "cost_so_far": str(cost_so_far),
                "projected_requests": projected_requests,
                "projected_cost": str(projected_cost),
                "days_elapsed": today.day,
                "days_remaining": days_remaining,
                "daily_average_so_far": daily_avg_so_far,
                "peak_day": peak_day,
            },
            "comparison": {
                "previous_month": {
                    "year": prev_year,
                    "month": prev_month,
                    "total_requests": prev_total,
                    "cost": str(rate.cost_for(prev_total)),
                },
                "previous_same_period_total": prev_same_period_total,
                "mom_change_pct": mom_change_pct,
                "today_requests": today_count,
                "yesterday_requests": yesterday_count,
                "trailing_7d_total": week_total,
                "trailing_7d_average": avg_7d,
            },
            "rate": BillingRateSerializer(rate).data,
            "daily_current_month": daily,
            "daily_last_30_days": last_30,
            "weekday_breakdown": weekday_breakdown,
            "monthly_history": monthly_history,
            "billing_summary": billing_summary,
            "recent_bills": MonthlyBillSerializer(recent_bills, many=True).data,
        }
    )


# ── tenant range query ────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tenant_range_usage(request):
    """Aggregated usage for an arbitrary date range.

    Query params:
      preset = today | yesterday | last_7_days | last_14_days | last_30_days |
               this_month | last_month | this_year | custom
      start  = YYYY-MM-DD (used when preset=custom or omitted)
      end    = YYYY-MM-DD (used when preset=custom or omitted)
    """
    tenant = getattr(request, "tenant", None)
    if tenant is None or getattr(tenant, "schema_name", "public") == "public":
        return Response(
            {"detail": "No tenant context for this request."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    today = timezone.localdate()
    preset = (request.GET.get("preset") or "").strip().lower()
    start_param = request.GET.get("start")
    end_param = request.GET.get("end")

    def parse(d):
        try:
            return date.fromisoformat(d)
        except (TypeError, ValueError):
            return None

    start = end = None
    if preset == "today":
        start = end = today
    elif preset == "yesterday":
        start = end = today - timedelta(days=1)
    elif preset == "last_7_days":
        start, end = today - timedelta(days=6), today
    elif preset == "last_14_days":
        start, end = today - timedelta(days=13), today
    elif preset == "last_30_days":
        start, end = today - timedelta(days=29), today
    elif preset == "this_month":
        start, end = _month_bounds(today.year, today.month)
        end = today
    elif preset == "last_month":
        if today.month == 1:
            ly, lm = today.year - 1, 12
        else:
            ly, lm = today.year, today.month - 1
        start, end = _month_bounds(ly, lm)
    elif preset == "this_year":
        start, end = date(today.year, 1, 1), today
    else:
        start = parse(start_param)
        end = parse(end_param)

    if not start or not end:
        return Response(
            {"detail": "Provide a valid preset or start/end (YYYY-MM-DD)."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if start > end:
        start, end = end, start

    total, daily = _aggregate(tenant, start, end)
    rate = BillingRate.current()
    span_days = (end - start).days + 1
    avg = round(total / span_days, 2) if span_days else 0
    peak = max(daily, key=lambda d: d["request_count"], default=None)

    return Response(
        {
            "preset": preset or "custom",
            "start": start,
            "end": end,
            "days": span_days,
            "total_requests": total,
            "daily_average": avg,
            "peak_day": peak,
            "cost": str(rate.cost_for(total)),
            "rate": BillingRateSerializer(rate).data,
            "daily": daily,
        }
    )


# ── tenant bill detail ────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tenant_bill_detail(request, pk):
    """Full breakdown + analysis for a single bill belonging to the tenant."""
    tenant = getattr(request, "tenant", None)
    if tenant is None or getattr(tenant, "schema_name", "public") == "public":
        return Response(
            {"detail": "No tenant context for this request."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        bill = MonthlyBill.objects.get(pk=pk, tenant=tenant)
    except MonthlyBill.DoesNotExist:
        return Response({"detail": "Bill not found."}, status=status.HTTP_404_NOT_FOUND)

    start, end = _month_bounds(bill.year, bill.month)
    total, daily = _aggregate(tenant, start, end)

    span_days = (end - start).days + 1
    active_days = [d for d in daily if d["request_count"] > 0]
    avg_all = round(total / span_days, 2) if span_days else 0
    avg_active = round(total / len(active_days), 2) if active_days else 0
    peak = max(daily, key=lambda d: d["request_count"], default=None)

    weekday_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekday_totals = [0] * 7
    for d in daily:
        dt = date.fromisoformat(d["date"]) if isinstance(d["date"], str) else d["date"]
        weekday_totals[dt.weekday()] += d["request_count"]
    weekday_breakdown = [
        {"weekday": weekday_names[i], "total": weekday_totals[i]} for i in range(7)
    ]

    billable_units = (
        (bill.total_requests + bill.requests_per_unit - 1) // bill.requests_per_unit
        if bill.requests_per_unit
        else 0
    )

    rate = BillingRate.current()

    return Response(
        {
            "bill": MonthlyBillSerializer(bill).data,
            "rate": BillingRateSerializer(rate).data,
            "breakdown": {
                "total_requests": bill.total_requests,
                "requests_per_unit": bill.requests_per_unit,
                "billable_units": billable_units,
                "unit_cost": str(bill.unit_cost),
                "amount": str(bill.amount),
                "currency": bill.currency,
            },
            "analysis": {
                "days_in_month": span_days,
                "active_days": len(active_days),
                "daily_average": avg_all,
                "active_day_average": avg_active,
                "peak_day": peak,
            },
            "daily": daily,
            "weekday_breakdown": weekday_breakdown,
        }
    )


# ── tenant payments ───────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tenant_payments(request):
    """Payment history, outstanding bills, wallet, and M-Pesa transactions."""
    tenant = getattr(request, "tenant", None)
    if tenant is None or getattr(tenant, "schema_name", "public") == "public":
        return Response(
            {"detail": "No tenant context for this request."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    today = timezone.localdate()
    rate = BillingRate.current()
    _ensure_tenant_bills(tenant, rate, today)

    all_bills = MonthlyBill.objects.filter(tenant=tenant).order_by("-year", "-month")
    paid_bills = [b for b in all_bills if b.status == MonthlyBill.Status.PAID]
    outstanding_bills = [
        b for b in all_bills
        if b.status in (
            MonthlyBill.Status.ISSUED,
            MonthlyBill.Status.DRAFT,
            MonthlyBill.Status.PARTIAL,
        )
    ]

    from .payment_models import MpesaTransaction, PaymentGatewayConfig, TenantWallet
    from .payment_serializers import (
        MpesaTransactionSerializer,
        PaymentMethodSerializer,
        WalletTransactionSerializer,
    )

    wallet, _ = TenantWallet.objects.get_or_create(
        tenant=tenant, defaults={"currency": rate.currency}
    )
    gateway = PaymentGatewayConfig.get_solo()
    mpesa_txns = MpesaTransaction.objects.filter(tenant=tenant).order_by("-created_at")[:50]
    wallet_txns = wallet.transactions.all()[:50]

    payment_methods = [
        {
            "key": "mpesa",
            "label": "M-Pesa",
            "description": "Pay instantly via M-Pesa STK push.",
            "icon": "mdi-cellphone",
            "available": gateway.is_active,
        },
        {
            "key": "wallet",
            "label": "Wallet balance",
            "description": "Use your pre-funded DomendraPOS wallet.",
            "icon": "mdi-wallet",
            "available": True,
        },
    ]

    return Response(
        {
            "summary": _billing_summary(tenant, rate.currency),
            "currency": rate.currency,
            "wallet_balance": str(wallet.balance),
            "phone": getattr(tenant, "contact_phone", "") or "",
            "payment_methods": PaymentMethodSerializer(payment_methods, many=True).data,
            "paid_bills": MonthlyBillSerializer(paid_bills, many=True).data,
            "outstanding_bills": MonthlyBillSerializer(outstanding_bills, many=True).data,
            "mpesa_transactions": MpesaTransactionSerializer(mpesa_txns, many=True).data,
            "wallet_transactions": WalletTransactionSerializer(wallet_txns, many=True).data,
        }
    )


# ── super-admin: gateway config ────────────────────────────────────────────────

@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsSuperAdmin])
def payment_config(request):
    from .payment_models import PaymentGatewayConfig
    from .payment_serializers import PaymentGatewayConfigSerializer

    config = PaymentGatewayConfig.get_solo()
    if request.method == "GET":
        return Response(PaymentGatewayConfigSerializer(config).data)

    serializer = PaymentGatewayConfigSerializer(config, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save(updated_by=request.user)
    return Response(serializer.data)


# ── super-admin: all M-Pesa transactions ──────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsSuperAdmin])
def admin_payments(request):
    from .payment_models import MpesaTransaction
    from .payment_serializers import MpesaTransactionSerializer

    qs = MpesaTransaction.objects.select_related("tenant", "bill").all()
    params = request.query_params
    if params.get("tenant"):
        qs = qs.filter(tenant_id=params["tenant"])
    if params.get("status"):
        qs = qs.filter(status=params["status"])
    if params.get("purpose"):
        qs = qs.filter(purpose=params["purpose"])

    totals = {
        "count": qs.count(),
        "success": qs.filter(status=MpesaTransaction.Status.SUCCESS).count(),
        "pending": qs.filter(status=MpesaTransaction.Status.PENDING).count(),
        "failed": qs.filter(status=MpesaTransaction.Status.FAILED).count(),
    }
    collected = sum(
        (Decimal(t.amount) for t in qs.filter(status=MpesaTransaction.Status.SUCCESS)),
        Decimal("0"),
    )

    return Response({
        "totals": {**totals, "collected": str(collected)},
        "transactions": MpesaTransactionSerializer(qs[:500], many=True).data,
    })
