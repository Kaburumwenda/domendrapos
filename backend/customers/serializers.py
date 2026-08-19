from rest_framework import serializers
from .models import Customer, CustomerGroup, CustomerInteraction


class CustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Customer
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at", "full_name", "loyalty_points")


class CustomerGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerGroup
        fields = "__all__"


class CustomerInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerInteraction
        fields = "__all__"
        read_only_fields = ("created_at",)
