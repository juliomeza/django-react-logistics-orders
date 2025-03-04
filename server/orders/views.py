from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
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
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Order.objects.none()
        user_projects = self.request.user.projects.all()
        return Order.objects.filter(project__in=user_projects)
    
    def perform_create(self, serializer):
        """Asigna el usuario autenticado como created_by al crear una orden."""
        serializer.save(created_by=self.request.user, modified_by=self.request.user)

    def perform_update(self, serializer):
        """Asigna el usuario autenticado como modified_by al actualizar una orden."""
        serializer.save(modified_by=self.request.user)

class OrderLineViewSet(viewsets.ModelViewSet):
    queryset = OrderLine.objects.all()
    serializer_class = OrderLineSerializer

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return OrderLine.objects.none()
        user_projects = self.request.user.projects.all()
        return OrderLine.objects.filter(order__project__in=user_projects)

    def perform_create(self, serializer):
        """Asigna el usuario autenticado como created_by al crear una línea de orden."""
        serializer.save(created_by=self.request.user, modified_by=self.request.user)

    def perform_update(self, serializer):
        """Asigna el usuario autenticado como modified_by al actualizar una línea de orden."""
        serializer.save(modified_by=self.request.user)

    # Custom action to delete all lines for an order
    @action(detail=False, methods=['delete'], url_path='order/(?P<order_id>[^/.]+)/clear')
    def clear_order_lines(self, request, order_id=None):
        """Delete all order lines for the specified order."""
        if not order_id:
            return Response({'detail': 'Order ID is required.'}, status=400)
        OrderLine.objects.filter(order_id=order_id).delete()
        return Response({'detail': 'All order lines deleted successfully.'})
    
    # Nueva acción personalizada para listar líneas por order_id
    @action(detail=False, methods=['get'], url_path='order/(?P<order_id>[^/.]+)')
    def list_order_lines(self, request, order_id=None):
        """List all order lines for the specified order."""
        if not order_id:
            return Response({'detail': 'Order ID is required.'}, status=400)
        lines = OrderLine.objects.filter(order_id=order_id)
        serializer = self.get_serializer(lines, many=True)
        return Response(serializer.data)

