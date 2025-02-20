from rest_framework import viewsets
from .models import Enterprise, Client, Project
from .serializers import EnterpriseSerializer, ClientSerializer, ProjectSerializer

class EnterpriseViewSet(viewsets.ModelViewSet):
    queryset = Enterprise.objects.all()
    serializer_class = EnterpriseSerializer

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Project.objects.none()
        # Devuelve solo los proyectos a los que el usuario pertenece
        return self.request.user.projects.all()
