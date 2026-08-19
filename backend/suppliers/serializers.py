from rest_framework import serializers
from .models import Supplier, SupplierProduct


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")


class SupplierProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplierProduct
        fields = "__all__"
