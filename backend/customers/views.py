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
)
from .models import Customer, CustomerGroup, CustomerInteraction
from .serializers import (
    CustomerSerializer,
    CustomerGroupSerializer,
    CustomerInteractionSerializer,
)


# ── Excel column definitions ─────────────────────────────────────────────────
CUSTOMER_HEADERS = [
    ("Customer Code", "customer_code"),
    ("Type", "customer_type"),
    ("First Name", "first_name"),
    ("Last Name", "last_name"),
    ("Company Name", "company_name"),
    ("Email", "email"),
    ("Phone", "phone"),
    ("Secondary Phone", "secondary_phone"),
    ("Address Line 1", "address_line1"),
    ("Address Line 2", "address_line2"),
    ("City", "city"),
    ("State/Province", "state_province"),
    ("Postal Code", "postal_code"),
    ("Country", "country"),
    ("Loyalty Tier", "loyalty_tier"),
    ("Credit Limit", "credit_limit"),
    ("Current Credit Balance", "current_credit_balance"),
    ("Tax Exempt", "tax_exempt"),
    ("Tax ID", "tax_id"),
    ("Is Active", "is_active"),
    ("Notes", "notes"),
]

CUSTOMER_IMPORT_HEADERS = [
    "Customer Code", "Type", "First Name", "Last Name", "Company Name",
    "Email", "Phone", "Secondary Phone",
    "Address Line 1", "Address Line 2", "City", "State/Province",
    "Postal Code", "Country", "Loyalty Tier", "Credit Limit",
    "Current Credit Balance", "Tax Exempt", "Tax ID", "Is Active", "Notes",
]

CUSTOMER_HEADER_TO_FIELD = {
    "customer code": "customer_code",
    "type": "customer_type",
    "first name": "first_name",
    "last name": "last_name",
    "company name": "company_name",
    "email": "email",
    "phone": "phone",
    "secondary phone": "secondary_phone",
    "address line 1": "address_line1",
    "address line 2": "address_line2",
    "city": "city",
    "state/province": "state_province",
    "state": "state_province",
    "province": "state_province",
    "postal code": "postal_code",
    "country": "country",
    "loyalty tier": "loyalty_tier",
    "credit limit": "credit_limit",
    "current credit balance": "current_credit_balance",
    "tax exempt": "tax_exempt",
    "tax id": "tax_id",
    "is active": "is_active",
    "notes": "notes",
}

CUSTOMER_TYPE_OPTIONS = ["individual", "business"]


def _generate_customer_code(existing_codes):
    """Generate a unique customer code like CUS-AB12CD."""
    pool = string.ascii_uppercase + string.digits
    existing_codes = set(existing_codes or [])
    for _ in range(200):
        suffix = "".join(random.choice(pool) for _ in range(6))
        code = f"CUS-{suffix}"
        if code not in existing_codes and not Customer.objects.filter(customer_code=code).exists():
            return code
    suffix = "".join(random.choice(pool) for _ in range(10))
    return f"CUS-{suffix}"


def _normalize_customer_entry(entry):
    cleaned = {}
    errors = []
    for k, val in entry.items():
        if k.startswith("_"):
            continue
        # Validate customer_type
        if k == "customer_type" and val:
            s = str(val).strip().lower()
            if s in ("individual", "business"):
                cleaned["customer_type"] = s
            else:
                errors.append(f"Unknown customer type '{val}' (use individual or business)")
            continue
        cleaned[k] = val
    normalize_bools(cleaned, ["is_active", "tax_exempt"])
    normalize_decimals(cleaned, ["credit_limit", "current_credit_balance"])
    return cleaned, errors


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    filterset_fields = [
        "customer_type", "is_active", "loyalty_tier",
        "preferred_branch", "groups",
    ]
    search_fields = [
        "customer_code", "first_name", "last_name", "company_name",
        "email", "phone",
    ]
    ordering_fields = ["created_at", "loyalty_points", "last_name"]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        """Auto-generate customer_code if not provided."""
        data = serializer.validated_data
        if not data.get("customer_code"):
            data["customer_code"] = _generate_customer_code(
                Customer.objects.values_list("customer_code", flat=True)
            )
        serializer.save()

    # ── Export ────────────────────────────────────────────────────────────
    @action(detail=False, methods=["get"], url_path="export-excel")
    def export_excel(self, request):
        qs = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(qs, many=True)
        buf = build_export_workbook(CUSTOMER_HEADERS, serializer.data)
        return excel_response(
            buf, f"customers_export_{__import__('datetime').datetime.now():%Y%m%d_%H%M%S}.xlsx"
        )

    # ── Template ──────────────────────────────────────────────────────────
    @action(detail=False, methods=["get"], url_path="import-excel-template")
    def import_excel_template(self, request):
        example = [
            "CUS-001", "individual", "Jane", "Smith", "",
            "jane@example.com", "+1234567890", "",
            "456 Oak Ave", "", "Riverside", "California",
            "92501", "United States", "bronze", "1000.00",
            "0.00", "No", "", "Yes", "VIP customer",
        ]
        instructions = [
            ("BULK IMPORT — CUSTOMERS", True),
            ("", False),
            ("Required fields", True),
            ("Customer Code — must be unique. Blank = auto-generated.", False),
            ("First Name + Last Name (individual) or Company Name (business).", False),
            ("", False),
            ("Optional fields", True),
            ("Type — individual or business (default individual).", False),
            ("Email / Phone / Secondary Phone — contact info.", False),
            ("Address fields — full postal address.", False),
            ("Country — defaults to 'United States' if blank.", False),
            ("Loyalty Tier — e.g. bronze, silver, gold, platinum.", False),
            ("Credit Limit / Current Credit Balance — numeric.", False),
            ("Tax Exempt — Yes/No (default No).", False),
            ("Tax ID — string.", False),
            ("Is Active — Yes/No (default Yes).", False),
            ("Notes — free text.", False),
            ("", False),
            ("Behavior", True),
            ("Existing Customer Code → updates the row (upsert).", False),
            ("Blank Customer Code → creates a new customer with auto-generated code.", False),
            ("Invalid rows are skipped with a row-level error.", False),
        ]
        buf = build_template_workbook(CUSTOMER_IMPORT_HEADERS, example, instructions)
        return excel_response(buf, "customers_import_template.xlsx")

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
            wb, CUSTOMER_HEADER_TO_FIELD, required_fields=["first_name", "last_name"]
        )
        wb.close()
        # For business type, company name is okay instead of first/last
        # We relax: at least one name field present
        if missing_required:
            return Response(
                {"detail": f"Missing required header column(s): {', '.join(missing_required)}. "
                 "Download the template first and keep its header row intact."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_codes = set(Customer.objects.values_list("customer_code", flat=True))

        out_rows = []
        errors = []
        for entry in rows:
            cleaned, errs = _normalize_customer_entry(dict(entry))
            code_val = cleaned.get("customer_code")
            if not code_val or not str(code_val).strip():
                code_val = _generate_customer_code(existing_codes)
                cleaned["customer_code"] = code_val
            existing_codes.add(code_val)
            cleaned["_row"] = entry.get("_row")
            out_rows.append(cleaned)
            for e in errs:
                errors.append({"row": entry.get("_row"), "detail": e})

        return Response({
            "rows": out_rows,
            "customer_types": CUSTOMER_TYPE_OPTIONS,
            "skipped": skipped,
            "errors": errors,
        }, status=status.HTTP_200_OK)

    # ── Bulk upsert ───────────────────────────────────────────────────────
    @action(detail=False, methods=["post"], url_path="bulk-upsert")
    def bulk_upsert(self, request):
        items = request.data.get("items") if isinstance(request.data, dict) else None
        if not items or not isinstance(items, list):
            return Response({"detail": "Body must be {\"items\": [...]}."}, status=status.HTTP_400_BAD_REQUEST)

        existing_codes = set(Customer.objects.values_list("customer_code", flat=True))
        created = 0
        updated = 0
        failed = 0
        errors = []
        for idx, item in enumerate(items, 1):
            cleaned, errs = _normalize_customer_entry(dict(item))
            if errs:
                failed += 1
                errors.append({"row": idx, "detail": "; ".join(errs)})
                continue
            code_val = cleaned.get("customer_code")
            if not code_val or not str(code_val).strip():
                code_val = _generate_customer_code(existing_codes)
                cleaned["customer_code"] = code_val
            existing_codes.add(code_val)

            existing = Customer.objects.filter(customer_code=code_val).first()
            if existing:
                serializer = CustomerSerializer(existing, data=cleaned, partial=True)
            else:
                serializer = CustomerSerializer(data=cleaned)
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

    @action(detail=True, methods=["post"])
    def add_points(self, request, pk=None):
        customer = self.get_object()
        points = int(request.data.get("points", 0))
        customer.loyalty_points += points
        customer.save()
        return Response({"loyalty_points": customer.loyalty_points})


class CustomerGroupViewSet(viewsets.ModelViewSet):
    queryset = CustomerGroup.objects.all()
    serializer_class = CustomerGroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class CustomerInteractionViewSet(viewsets.ModelViewSet):
    queryset = CustomerInteraction.objects.all()
    serializer_class = CustomerInteractionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["customer", "interaction_type", "handled_by"]

