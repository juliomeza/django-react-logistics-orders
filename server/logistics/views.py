from rest_framework import viewsets
from .models import Address, Contact, Warehouse, Carrier, CarrierService
from .serializers import (
    AddressSerializer,
    ContactSerializer,
    WarehouseSerializer,
    CarrierSerializer,
    CarrierServiceSerializer
)

class AddressViewSet(viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Warehouse.objects.none()
        
        user_projects = self.request.user.projects.all()
        # Se filtran los warehouses que están asociados a los proyectos del usuario
        return Warehouse.objects.filter(projects__in=user_projects).distinct()

class CarrierViewSet(viewsets.ModelViewSet):
    queryset = Carrier.objects.all()
    serializer_class = CarrierSerializer

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Carrier.objects.none()
        
        user_projects = self.request.user.projects.all()
        # Se filtran los carriers que están asociados a los proyectos del usuario
        return Carrier.objects.filter(projects__in=user_projects).distinct()

class CarrierServiceViewSet(viewsets.ModelViewSet):
    queryset = CarrierService.objects.all()
    serializer_class = CarrierServiceSerializer
