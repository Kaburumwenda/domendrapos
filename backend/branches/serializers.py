from rest_framework import serializers
from .models import Branch, Register


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")


class BranchCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at", "is_headquarters")


class RegisterSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    branch_code = serializers.CharField(source="branch.code", read_only=True)

    class Meta:
        model = Register
        fields = "__all__"
        read_only_fields = ("terminal_id", "opened_at", "closed_at", "current_balance")
