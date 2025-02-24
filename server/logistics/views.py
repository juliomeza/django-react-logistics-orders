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

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Contact.objects.none()
        
        user_projects = self.request.user.projects.all()
        # Filter contacts associated with the user's projects
        return Contact.objects.filter(projects__in=user_projects).distinct()

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Warehouse.objects.none()
        
        user_projects = self.request.user.projects.all()
        # Filter warehouses associated with the user's projects
        return Warehouse.objects.filter(projects__in=user_projects).distinct()

class CarrierViewSet(viewsets.ModelViewSet):
    queryset = Carrier.objects.all()
    serializer_class = CarrierSerializer

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Carrier.objects.none()
        
        user_projects = self.request.user.projects.all()
        # Filter carriers associated with the user's projects
        return Carrier.objects.filter(projects__in=user_projects).distinct()

class CarrierServiceViewSet(viewsets.ModelViewSet):
    queryset = CarrierService.objects.all()
    serializer_class = CarrierServiceSerializer

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return CarrierService.objects.none()
        
        user_projects = self.request.user.projects.all()
        # Filter carrier services associated with the user's projects
        return CarrierService.objects.filter(projects__in=user_projects).distinct()
