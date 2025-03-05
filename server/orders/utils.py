# orders/utils.py
import csv
from django.utils import timezone

def generate_order_csv(order):
    """Genera un archivo CSV para la orden en la ruta de red."""
    file_path = f"\\\\wd02\\Datex\\Import\\CRM_Orders_Import\\Test\\order_{order.lookup_code_order}.csv"
    with open(file_path, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        # Por ahora, mantenemos las columnas básicas; luego las ajustaremos
        writer.writerow(['lookup_code_order', 'order_type', 'order_status'])
        writer.writerow([
            order.lookup_code_order,
            order.order_type.type_name,
            order.order_status.status_name
        ])
    # Actualizamos los campos file_generated y file_generated_at en el objeto order
    order.file_generated = True
    order.file_generated_at = timezone.now()