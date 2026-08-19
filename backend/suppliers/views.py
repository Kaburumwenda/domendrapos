from rest_framework import viewsets, permissions
from .models import Supplier, SupplierProduct
from .serializers import SupplierSerializer, SupplierProductSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["is_active", "country"]
    search_fields = ["supplier_code", "name", "email", "phone", "contact_person"]
    ordering_fields = ["name", "rating", "created_at"]


class SupplierProductViewSet(viewsets.ModelViewSet):
    queryset = SupplierProduct.objects.all()
    serializer_class = SupplierProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["supplier", "product", "is_preferred"]

