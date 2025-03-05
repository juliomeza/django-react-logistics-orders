import csv
from django.db import models
from common.models import TimeStampedModel, Status
from enterprise.models import Project
from logistics.models import Warehouse, Contact, Address, Carrier, CarrierService
from materials.models import Material
from inventory.models import Inventory, InventorySerialNumber
from django.db import transaction
from django.utils import timezone
from .utils import generate_order_csv

class OrderStatus(TimeStampedModel):
    status_name = models.CharField(max_length=50)
    lookup_code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=50, blank=True)
    
    def __str__(self):
        return self.status_name

class OrderType(TimeStampedModel):
    type_name = models.CharField(max_length=50)
    lookup_code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.type_name

class OrderClass(TimeStampedModel):
    order_type = models.ForeignKey(
        OrderType,
        on_delete=models.PROTECT,
        related_name='order_classes')
    class_name = models.CharField(max_length=50)
    lookup_code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.class_name

class OrderCounter(TimeStampedModel):
    project = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
        related_name="counter",
        help_text="Project associated with this order counter"
    )
    last_number = models.PositiveIntegerField(
        default=0,
        help_text="Last order number used for this project"
    )

    def __str__(self):
        return f"Counter for {self.project.name}"

    def get_next_number(self):
        """Returns the next number and updates the counter."""
        with transaction.atomic():
            # Blocks it to avoid concurrency conflicts
            counter = OrderCounter.objects.select_for_update().get(id=self.id)
            counter.last_number += 1
            counter.save()
            return counter.last_number

class Order(TimeStampedModel):
    lookup_code_order = models.CharField(
        max_length=50,
        unique=True,
        help_text="Unique order identifier"
    )
    lookup_code_shipment = models.CharField(
        max_length=50,
        unique=True,
        help_text="Unique shipment identifier"
    )
    reference_number = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Reference number from the customer"
    )
    order_type = models.ForeignKey(OrderType, on_delete=models.PROTECT, related_name='orders')
    order_class = models.ForeignKey(OrderClass, on_delete=models.PROTECT, related_name='orders')
    order_status = models.ForeignKey(OrderStatus, on_delete=models.PROTECT, related_name='orders')
    project = models.ForeignKey(Project, on_delete=models.PROTECT, related_name='orders')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT, related_name='orders')
    contact = models.ForeignKey(Contact, on_delete=models.PROTECT, related_name='orders')
    shipping_address = models.ForeignKey(Address, on_delete=models.PROTECT, related_name='shipping_orders')
    billing_address = models.ForeignKey(Address, on_delete=models.PROTECT, related_name='billing_orders')
    carrier = models.ForeignKey(Carrier, on_delete=models.PROTECT, related_name='orders', null=True, blank=True)
    service_type = models.ForeignKey(CarrierService, on_delete=models.PROTECT, related_name='orders', null=True, blank=True)
    expected_delivery_date = models.DateTimeField(null=True, blank=True)
    delivery_date = models.DateTimeField(null=True, blank=True)
    file_generated = models.BooleanField(
        default=False,
        help_text="Indicates if a file has been generated for this order"
    )
    file_generated_at = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="Date and time when the file was generated"
    )
    notes = models.TextField(blank=True)

    def generate_order_code(self):
        """Genera el código de orden y envío basado en el prefijo del proyecto y el contador."""
        counter, _ = OrderCounter.objects.get_or_create(project=self.project)
        next_number = counter.get_next_number()
        code = f"{self.project.orders_prefix}-{str(next_number).zfill(6)}"
        return code
    
    def generate_csv_file(self):
        """Genera un archivo CSV para la orden usando la función en utils."""
        generate_order_csv(self)

    def save(self, *args, **kwargs):
        """Sobrescribe el método save para detectar cambios de estado y generar el CSV."""
        # Si el objeto ya existe en la base de datos, verificamos el cambio de estado
        if self.pk:
            old_instance = Order.objects.get(pk=self.pk)
            old_status_id = old_instance.order_status_id
            new_status_id = self.order_status_id

            # Si cambia de "Created" (id=1) a "Submitted" (id=2)
            if old_status_id == 1 and new_status_id == 2:
                self.generate_csv_file()
        
        """Genera automáticamente lookup_code_order y lookup_code_shipment si no están definidos."""
        if not self.lookup_code_order or not self.lookup_code_shipment:
            generated_code = self.generate_order_code()
            if not self.lookup_code_order:
                self.lookup_code_order = generated_code
            if not self.lookup_code_shipment:
                self.lookup_code_shipment = generated_code
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order_type} - {self.lookup_code_order}"

class OrderLine(TimeStampedModel):
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='lines')
    material = models.ForeignKey(Material, on_delete=models.PROTECT, related_name='order_lines')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    license_plate = models.ForeignKey(
        Inventory,
        on_delete=models.PROTECT,
        related_name='order_lines',
        null=True, blank=True
    )
    serial_number = models.ForeignKey(
        InventorySerialNumber,
        on_delete=models.PROTECT,
        related_name='order_lines',
        null=True, blank=True
    )
    lot = models.CharField(max_length=50, blank=True)
    vendor_lot = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Order {self.order.lookup_code_order} - {self.material.name} ({self.quantity})"
