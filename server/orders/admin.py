from django.contrib import admin
from .models import OrderClass, OrderType, OrderStatus, Order, OrderLine, OrderCounter

@admin.register(OrderStatus)
class OrderClassAdmin(admin.ModelAdmin):
    list_display = ('status_name','lookup_code')
    search_fields = ('status_name','lookup_code')

@admin.register(OrderType)
class OrderTypeAdmin(admin.ModelAdmin):
    list_display = ('type_name', 'lookup_code')
    search_fields = ('type_name', 'lookup_code')

@admin.register(OrderClass)
class OrderClassAdmin(admin.ModelAdmin):
    list_display = ('class_name','lookup_code', 'order_type')
    search_fields = ('class_name','lookup_code', 'order_type__type_name')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('lookup_code_order', 'order_type', 'project', 'order_status', 'delivery_date', 'file_generated', 'file_generated_at')
    search_fields = ('lookup_code_order', 'lookup_code_shipment')

@admin.register(OrderLine)
class OrderLineAdmin(admin.ModelAdmin):
    list_display = ('order', 'material', 'quantity')
    search_fields = ('order__lookup_code_order', 'material__name')

@admin.register(OrderCounter)
class OrderCounterAdmin(admin.ModelAdmin):
    list_display = ('project', 'last_number')
    search_fields = ('project__name',)