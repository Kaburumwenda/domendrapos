from rest_framework import serializers
from .models import Customer, CustomerGroup, CustomerInteraction


class CustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    customer_code = serializers.CharField(read_only=True)

    class Meta:
        model = Customer
        fields = "__all__"
        read_only_fields = (
            "created_at", "updated_at", "full_name", "loyalty_points",
            "customer_code",
        )

    def create(self, validated_data):
        if not validated_data.get("customer_code"):
            from .views import _generate_customer_code
            validated_data["customer_code"] = _generate_customer_code(
                Customer.objects.values_list("customer_code", flat=True)
            )
        return super().create(validated_data)


class CustomerGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerGroup
        fields = "__all__"


class CustomerInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerInteraction
        fields = "__all__"
        read_only_fields = ("created_at",)
