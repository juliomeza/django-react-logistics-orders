from django.contrib import admin
from .models import ReportDefinition

@admin.register(ReportDefinition)
class ReportDefinitionAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at', 'updated_at')
    search_fields = ('name', 'description', 'query')
    readonly_fields = ('created_at', 'updated_at')