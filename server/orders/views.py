from rest_framework import viewsets
from .models import OrderClass, OrderType, Order, OrderLine
from .serializers import (
    OrderClassSerializer,
    OrderTypeSerializer,
    OrderSerializer,
    OrderLineSerializer
)

class OrderClassViewSet(viewsets.ModelViewSet):
    queryset = OrderClass.objects.all()
    serializer_class = OrderClassSerializer

class OrderTypeViewSet(viewsets.ModelViewSet):
    queryset = OrderType.objects.all()
    serializer_class = OrderTypeSerializer

class OrderViewSet(viewsets.ModelViewSet):
    # Agregamos un queryset por defecto para que el router pueda determinar el basename
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Order.objects.none()
        
        # Filtramos las órdenes por los proyectos asociados al usuario.
        user_projects = self.request.user.projects.all()
        return Order.objects.filter(project__in=user_projects)

class OrderLineViewSet(viewsets.ModelViewSet):
    queryset = OrderLine.objects.all()
    serializer_class = OrderLineSerializer
