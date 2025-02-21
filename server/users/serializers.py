from rest_framework import serializers
from .models import CustomUser, Role

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

# class CustomUserSerializer(serializers.ModelSerializer):
#     role = RoleSerializer(read_only=True)
#     role_id = serializers.PrimaryKeyRelatedField(
#         queryset=Role.objects.all(), source='role', write_only=True
#     )
    
#     class Meta:
#         model = CustomUser
#         fields = ['id', 'first_name', 'last_name', 'email', 'role', 'role_id']

class CustomUserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), source='role', write_only=True
    )
    client_name = serializers.SerializerMethodField()

    def get_client_name(self, obj):
        # Se asume que todos los proyectos del usuario corresponden al mismo cliente.
        project = obj.projects.first()
        return project.client.name if project and project.client else None

    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'email', 'role', 'role_id', 'client_name']
