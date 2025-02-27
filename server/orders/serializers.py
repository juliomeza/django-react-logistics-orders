from rest_framework import serializers
from .models import OrderStatus, OrderClass, OrderType, Order, OrderLine

class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatus
        fields = '__all__'

class OrderTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderType
        fields = '__all__'
        
class OrderClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderClass
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    order_status_name = serializers.CharField(source='order_status.status_name', read_only=True)
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['lookup_code_order', 'lookup_code_shipment']

class OrderLineSerializer(serializers.ModelSerializer):
    license_plate = serializers.CharField(source='license_plate.license_plate', read_only=True, allow_null=True)
    class Meta:
        model = OrderLine
        fields = '__all__'
