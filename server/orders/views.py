from rest_framework import viewsets
from .models import OrderStatus, OrderType, OrderClass, Order, OrderLine
from .serializers import (
    OrderStatusSerializer,
    OrderTypeSerializer,
    OrderClassSerializer,
    OrderSerializer,
    OrderLineSerializer
)

class OrderStatusViewSet(viewsets.ModelViewSet):
    queryset = OrderStatus.objects.all()
    serializer_class = OrderStatusSerializer

class OrderTypeViewSet(viewsets.ModelViewSet):
    queryset = OrderType.objects.all()
    serializer_class = OrderTypeSerializer

class OrderClassViewSet(viewsets.ModelViewSet):
    queryset = OrderClass.objects.all()
    serializer_class = OrderClassSerializer

class OrderViewSet(viewsets.ModelViewSet):
    # Add a default queryset so the router can determine the basename
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Order.objects.none()
        
        # Filter orders by the projects associated with the user
        user_projects = self.request.user.projects.all()
        return Order.objects.filter(project__in=user_projects)

class OrderLineViewSet(viewsets.ModelViewSet):
    queryset = OrderLine.objects.all()
    serializer_class = OrderLineSerializer
