from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import Branch, Register
from .serializers import BranchSerializer, RegisterSerializer
from users.views import IsManagerOrAbove


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    permission_classes = [IsManagerOrAbove]
    filterset_fields = ["is_active", "is_headquarters", "city", "country"]
    search_fields = ["name", "code", "phone", "email"]
    ordering_fields = ["name", "created_at"]


class RegisterViewSet(viewsets.ModelViewSet):
    queryset = Register.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["branch", "status", "current_cashier"]
    search_fields = ["name", "terminal_id"]

    @action(detail=True, methods=["post"])
    def open_register(self, request, pk=None):
        reg = self.get_object()
        if reg.status == "open":
            return Response({"detail": "Register already open"}, status=400)
        reg.status = "open"
        reg.current_cashier = request.user
        reg.opening_float = request.data.get("opening_float", reg.opening_float)
        reg.current_balance = reg.opening_float
        reg.opened_at = timezone.now()
        reg.closed_at = None
        reg.save()
        return Response(RegisterSerializer(reg).data)

    @action(detail=True, methods=["post"])
    def close_register(self, request, pk=None):
        reg = self.get_object()
        reg.status = "closed"
        reg.current_cashier = None
        reg.closed_at = timezone.now()
        counted_cash = request.data.get("counted_cash")
        if counted_cash is not None:
            reg.current_balance = counted_cash
        reg.save()
        return Response(RegisterSerializer(reg).data)

