import random
import string
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
    DEFAULT_NUMERIC_FIELDS,
)
from .models import Supplier, SupplierProduct
from .serializers import SupplierSerializer, SupplierProductSerializer


# ── Excel column definitions ─────────────────────────────────────────────────
SUPPLIER_HEADERS = [
    ("Supplier Code", "supplier_code"),
    ("Name", "name"),
    ("Contact Person", "contact_person"),
    ("Email", "email"),
    ("Phone", "phone"),
    ("Website", "website"),
    ("Address Line 1", "address_line1"),
    ("Address Line 2", "address_line2"),
    ("City", "city"),
    ("State/Province", "state_province"),
    ("Postal Code", "postal_code"),
    ("Country", "country"),
    ("Tax ID", "tax_id"),
    ("Payment Terms", "payment_terms"),
    ("Currency Code", "currency_code"),
    ("Lead Time Days", "lead_time_days"),
    ("Minimum Order Value", "minimum_order_value"),
    ("Rating", "rating"),
    ("Is Active", "is_active"),
    ("Notes", "notes"),
]

SUPPLIER_IMPORT_HEADERS = [
    "Supplier Code", "Name", "Contact Person", "Email", "Phone", "Website",
    "Address Line 1", "Address Line 2", "City", "State/Province",
    "Postal Code", "Country", "Tax ID", "Payment Terms", "Currency Code",
    "Lead Time Days", "Minimum Order Value", "Rating", "Is Active", "Notes",
]

SUPPLIER_HEADER_TO_FIELD = {
    "supplier code": "supplier_code",
    "name": "name",
    "contact person": "contact_person",
    "email": "email",
    "phone": "phone",
    "website": "website",
    "address line 1": "address_line1",
    "address line 2": "address_line2",
    "city": "city",
    "state/province": "state_province",
    "state": "state_province",
    "province": "state_province",
    "postal code": "postal_code",
    "country": "country",
    "tax id": "tax_id",
    "payment terms": "payment_terms",
    "currency code": "currency_code",
    "lead time days": "lead_time_days",
    "minimum order value": "minimum_order_value",
    "rating": "rating",
    "is active": "is_active",
    "notes": "notes",
}


def _generate_supplier_code(existing_codes):
    """Generate a unique supplier code like SUP-AB12CD."""
    pool = string.ascii_uppercase + string.digits
    existing_codes = set(existing_codes or [])
    for _ in range(200):
        suffix = "".join(random.choice(pool) for _ in range(6))
        code = f"SUP-{suffix}"
        if code not in existing_codes and not Supplier.objects.filter(supplier_code=code).exists():
            return code
    suffix = "".join(random.choice(pool) for _ in range(10))
    return f"SUP-{suffix}"


def _normalize_supplier_entry(entry):
    cleaned = {}
    errors = []
    for k, val in entry.items():
        if k.startswith("_"):
            continue
        cleaned[k] = val
    normalize_bools(cleaned, ["is_active"])
    normalize_decimals(cleaned, ["minimum_order_value", "rating"])
    normalize_ints(cleaned, ["lead_time_days"])
    return cleaned, errors


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    filterset_fields = ["is_active", "country"]
    search_fields = ["supplier_code", "name", "email", "phone", "contact_person"]
    ordering_fields = ["name", "rating", "created_at"]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    # ── Export ────────────────────────────────────────────────────────────
    @action(detail=False, methods=["get"], url_path="export-excel")
    def export_excel(self, request):
        """Stream all matching suppliers as .xlsx."""
        qs = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(qs, many=True)
        buf = build_export_workbook(SUPPLIER_HEADERS, serializer.data)
        return excel_response(
            buf, f"suppliers_export_{__import__('datetime').datetime.now():%Y%m%d_%H%M%S}.xlsx"
        )

    # ── Template ──────────────────────────────────────────────────────────
    @action(detail=False, methods=["get"], url_path="import-excel-template")
    def import_excel_template(self, request):
        example = [
            "SUP-001", "Acme Supplies", "John Doe", "john@acme.com", "+1234567890",
            "https://acme.com", "123 Industrial Pkwy", "Unit 5", "Springfield",
            "Illinois", "62701", "United States", "TAX-12345", "Net 30", "USD",
            "7", "100.00", "4.5", "Yes", "Preferred supplier for electronics",
        ]
        instructions = [
            ("BULK IMPORT — SUPPLIERS", True),
            ("", False),
            ("Required fields", True),
            ("Supplier Code — must be unique. Blank = auto-generated.", False),
            ("Name — supplier name (cannot be blank).", False),
            ("", False),
            ("Optional fields", True),
            ("Contact Person / Email / Phone / Website — contact info.", False),
            ("Address fields — full postal address.", False),
            ("Country — defaults to 'United States' if blank.", False),
            ("Tax ID / Payment Terms / Currency Code — financial info.", False),
            ("Lead Time Days — integer (default 7).", False),
            ("Minimum Order Value / Rating — numeric.", False),
            ("Is Active — Yes/No (default Yes).", False),
            ("Notes — free text.", False),
            ("", False),
            ("Behavior", True),
            ("Existing Supplier Code → updates the row (upsert).", False),
            ("Blank Supplier Code → creates a new supplier with auto-generated code.", False),
            ("Invalid rows are skipped with a row-level error.", False),
        ]
        buf = build_template_workbook(SUPPLIER_IMPORT_HEADERS, example, instructions)
        return excel_response(buf, "suppliers_import_template.xlsx")

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
            wb, SUPPLIER_HEADER_TO_FIELD, required_fields=["name"]
        )
        wb.close()
        if missing_required:
            return Response(
                {"detail": f"Missing required header column(s): {', '.join(missing_required)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_codes = set(Supplier.objects.values_list("supplier_code", flat=True))
        countries = list(Supplier.objects.values_list("country", flat=True).distinct().order_by("country"))

        out_rows = []
        errors = []
        for entry in rows:
            cleaned, errs = _normalize_supplier_entry(dict(entry))
            code_val = cleaned.get("supplier_code")
            if not code_val or not str(code_val).strip():
                code_val = _generate_supplier_code(existing_codes)
                cleaned["supplier_code"] = code_val
            existing_codes.add(code_val)
            cleaned["_row"] = entry.get("_row")
            out_rows.append(cleaned)
            for e in errs:
                errors.append({"row": entry.get("_row"), "detail": e})

        return Response({
            "rows": out_rows,
            "skipped": skipped,
            "errors": errors,
            "countries": countries,
        }, status=status.HTTP_200_OK)

    # ── Bulk upsert ───────────────────────────────────────────────────────
    @action(detail=False, methods=["post"], url_path="bulk-upsert")
    def bulk_upsert(self, request):
        items = request.data.get("items") if isinstance(request.data, dict) else None
        if not items or not isinstance(items, list):
            return Response({"detail": "Body must be {\"items\": [...]}."}, status=status.HTTP_400_BAD_REQUEST)

        existing_codes = set(Supplier.objects.values_list("supplier_code", flat=True))
        created = 0
        updated = 0
        failed = 0
        errors = []
        for idx, item in enumerate(items, 1):
            cleaned, errs = _normalize_supplier_entry(dict(item))
            if errs:
                failed += 1
                errors.append({"row": idx, "detail": "; ".join(errs)})
                continue
            code_val = cleaned.get("supplier_code")
            if not code_val or not str(code_val).strip():
                code_val = _generate_supplier_code(existing_codes)
                cleaned["supplier_code"] = code_val
            existing_codes.add(code_val)

            existing = Supplier.objects.filter(supplier_code=code_val).first()
            if existing:
                serializer = SupplierSerializer(existing, data=cleaned, partial=True)
            else:
                serializer = SupplierSerializer(data=cleaned)
            if serializer and serializer.is_valid():
                try:
                    serializer.save()
                    if existing:
                        updated += 1
                    else:
                        created += 1
                except Exception as exc:
                    failed += 1
                    errors.append({"row": idx, "detail": f"Save error: {exc}"})
            else:
                failed += 1
                msg = "; ".join(f"{k}: {' / '.join(v)}" for k, v in serializer.errors.items() if v)
                errors.append({"row": idx, "detail": msg or "Validation failed"})

        return Response({
            "created": created, "updated": updated,
            "failed": failed, "total_processed": created + updated + failed,
            "errors": errors[:200], "errors_truncated": len(errors) > 200,
        }, status=status.HTTP_200_OK)


class SupplierProductViewSet(viewsets.ModelViewSet):
    queryset = SupplierProduct.objects.all()
    serializer_class = SupplierProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["supplier", "product", "is_preferred"]

