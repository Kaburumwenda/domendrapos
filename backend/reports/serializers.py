from rest_framework import serializers
from .models import ReportSnapshot


class ReportSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportSnapshot
        fields = "__all__"
