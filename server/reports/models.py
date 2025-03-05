from django.db import models

class ReportDefinition(models.Model):
    """
    Define los reportes disponibles en el sistema
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    query = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name