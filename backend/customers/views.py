from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Customer, CustomerGroup, CustomerInteraction
from .serializers import (
    CustomerSerializer,
    CustomerGroupSerializer,
    CustomerInteractionSerializer,
)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = [
        "customer_type", "is_active", "loyalty_tier",
        "preferred_branch", "groups",
    ]
    search_fields = [
        "customer_code", "first_name", "last_name", "company_name",
        "email", "phone",
    ]
    ordering_fields = ["created_at", "loyalty_points", "last_name"]

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

