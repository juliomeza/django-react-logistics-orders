from rest_framework import serializers
from .models import ReportDefinition

class ReportDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportDefinition
        fields = ['id', 'name', 'description', 'query', 'created_at', 'updated_at']