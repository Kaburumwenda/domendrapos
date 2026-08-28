from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from .models import Permission, RolePermission
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    ProfileUpdateSerializer,
    ChangePasswordSerializer,
    PermissionSerializer,
    RolePermissionSerializer,
)

User = get_user_model()


class IsManagerOrAbove(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_manager_or_above or request.user.is_superuser


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_superuser=False).order_by("-date_joined")
    permission_classes = [IsManagerOrAbove]
    filterset_fields = ["role", "is_active_employee", "default_branch_id"]
    search_fields = ["email", "first_name", "last_name", "employee_id"]
    ordering_fields = ["date_joined", "first_name", "role", "is_active_employee"]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action in ("create",):
            return UserCreateSerializer
        return UserSerializer

    @action(detail=False, methods=["get", "patch", "put"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Self-service endpoint: GET own profile, PATCH personal details."""
        user = request.user
        if request.method == "GET":
            data = UserSerializer(user).data
            # Include billing status so the frontend can check the lock gate
            insect = getattr(request, "tenant", None)
            if insect is not None and getattr(insect, "schema_name", "public") != "public":
                from users.serializers import _compute_billing_status
                billing = _compute_billing_status(insect)
                if billing is not None:
                    data["billing"] = billing
            return Response(data)
        serializer = ProfileUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(user).data)

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated], url_path="me/change-password")
    def change_password(self, request):
        """Self-service password change. Requires current password."""
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data["current_password"]):
            return Response(
                {"current_password": ["Current password is incorrect."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"status": "password changed"})

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active_employee = False
        user.is_active = False
        user.save()
        return Response({"status": "deactivated"})

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active_employee = True
        user.is_active = True
        user.save()
        return Response({"status": "activated"})

    @action(detail=True, methods=["post"], url_path="reset-password")
    def admin_reset_password(self, request, pk=None):
        """Admin-initiated password reset for a staff member."""
        new_password = request.data.get("new_password", "")
        if not new_password or len(new_password) < 8:
            return Response(
                {"detail": "Password must be at least 8 characters long."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = self.get_object()
        user.set_password(new_password)
        user.save()
        return Response({"status": "password reset"})

    def destroy(self, request, *args, **kwargs):
        """Soft-delete: deactivate instead of hard delete, unless ?hard=1."""
        user = self.get_object()
        if request.query_params.get("hard") == "1":
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        user.is_active_employee = False
        user.is_active = False
        user.termination_date = user.termination_date or timezone.now().date()
        user.save()
        return Response({"status": "deactivated"})


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated]


class RolePermissionViewSet(viewsets.ModelViewSet):
    queryset = RolePermission.objects.select_related("permission").all()
    serializer_class = RolePermissionSerializer
    permission_classes = [IsManagerOrAbove]
    filterset_fields = ["role"]
    ordering_fields = ["role"]

    @action(detail=False, methods=["post"], url_path="bulk")
    def bulk_set(self, request):
        """Atomic upsert of multiple role-permission rows in one call.

        Payload:
            {
                "role": "cashier",
                "permissions": [1, 5, 12, ...]   # Permission IDs to GRANT
            }

        All existing RolePermission rows for the given role that are NOT in
        the provided set are removed; the provided set is created if missing.
        Idempotent — safe to re-run.
        """
        role = request.data.get("role")
        perm_ids = request.data.get("permissions", [])

        if not role:
            return Response(
                {"detail": "role is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not isinstance(perm_ids, list):
            return Response(
                {"detail": "permissions must be a list of permission IDs"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # Ensure the requested permission IDs exist
            existing = set(
                Permission.objects.filter(id__in=perm_ids).values_list("id", flat=True)
            )
            missing = set(perm_ids) - existing
            if missing:
                return Response(
                    {"detail": f"Unknown permission IDs: {sorted(missing)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Delete grants for this role that are NOT in the new set
            RolePermission.objects.filter(role=role).exclude(
                permission_id__in=perm_ids
            ).delete()

            # Upsert the provided set (skip those that already exist)
            current = set(
                RolePermission.objects.filter(role=role).values_list(
                    "permission_id", flat=True
                )
            )
            to_create = [
                RolePermission(role=role, permission_id=pid)
                for pid in perm_ids
                if pid not in current
            ]
            if to_create:
                RolePermission.objects.bulk_create(to_create, ignore_conflicts=True)

        result = RolePermission.objects.filter(role=role).select_related("permission")
        return Response(RolePermissionSerializer(result, many=True).data)

    @action(detail=False, methods=["get"], url_path="matrix", permission_classes=[permissions.IsAuthenticated])
    def matrix(self, request):
        """Return role → module → [actions] map for the permission matrix UI.

        Any authenticated user can read this — it only returns the permission
        map for roles, which is needed by the frontend to enforce RBAC.
        Non-manager callers automatically get only their own role's permissions
        to avoid leaking other roles' details.
        """
        role = request.query_params.get("role")
        qs = RolePermission.objects.select_related("permission")
        # Non-manager users can only see their own role's permissions
        if not (request.user.is_manager_or_above or request.user.is_superuser):
            role = request.user.role
        if role:
            qs = qs.filter(role=role)

        data = {}
        for rp in qs:
            if rp.role not in data:
                data[rp.role] = {}
            module = rp.permission.module
            if module not in data[rp.role]:
                data[rp.role][module] = []
            data[rp.role][module].append(rp.permission.action)
        return Response(data)

