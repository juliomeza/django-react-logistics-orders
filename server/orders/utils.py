# import csv
# from django.utils import timezone

# def generate_order_csv(order):
#     """Genera un archivo TAB para la orden en la ruta de red con las columnas especificadas."""
#     file_path = f"\\\\wd02\\Datex\\Import\\CRM_Orders_Import\\Test\\order_{order.lookup_code_order}.tab"  # Cambié a .tab
#     with open(file_path, 'w', newline='') as tabfile:
#         writer = csv.writer(tabfile, delimiter='\t')  # Cambié el delimitador a tabulación
#         # Definimos las columnas en el orden exacto
#         columns = [
#             'OrderDate', 'Owner', 'Project', 'OrderNumber', 'Status', 'ReferenceNumber', 'Notes',
#             'Material', 'Lot', 'Quantity', 'UOM', 'AccountID', 'AccountName', 'ContactLookup',
#             'Title', 'FirstName', 'MiddleName', 'LastName', 'Addr1', 'Addr2', 'City', 'State',
#             'Zip', 'Territory', 'CountryName', 'Phone', 'Carrier', 'ServiceType', 'StateLic',
#             'StateofLicensure', 'StateLicExp', 'DEANumber', 'DEAExp', 'ME', 'Email', 'Fax',
#             'OrderFullfillmentDate'
#         ]
#         writer.writerow(columns)

#         # Obtenemos las líneas de la orden
#         order_lines = order.lines.all()

#         # Si no hay líneas, escribimos una fila con datos de la orden y campos vacíos
#         if not order_lines:
#             writer.writerow([
#                 order.modified_date.strftime('%m/%d/%Y') if order.modified_date else '',  # OrderDate
#                 order.project.client.lookup_code if order.project.client else '',          # Owner
#                 order.project.lookup_code,                                                 # Project
#                 order.lookup_code_order,                                                   # OrderNumber
#                 '',                                                                        # Status
#                 order.reference_number or '',                                              # ReferenceNumber
#                 order.notes or '',                                                         # Notes
#                 '',                                                                        # Material
#                 '',                                                                        # Lot
#                 '',                                                                        # Quantity
#                 '',                                                                        # UOM (pendiente)
#                 order.contact.id if order.contact else '',                                 # AccountID
#                 order.contact.company_name if order.contact and hasattr(order.contact, 'company_name') else '',  # AccountName
#                 order.contact.id if order.contact else '',                                 # ContactLookup
#                 '',                                                                        # Title
#                 order.contact.company_name if order.contact and hasattr(order.contact, 'company_name') else '',  # FirstName
#                 '',                                                                        # MiddleName
#                 '',                                                                        # LastName
#                 order.shipping_address.address_line_1 if order.shipping_address else '',   # Addr1
#                 order.shipping_address.address_line_2 if order.shipping_address else '',   # Addr2
#                 order.shipping_address.city if order.shipping_address else '',             # City
#                 order.shipping_address.state if order.shipping_address else '',            # State
#                 order.shipping_address.postal_code if order.shipping_address else '',      # Zip
#                 '',                                                                        # Territory
#                 order.shipping_address.country if order.shipping_address else '',          # CountryName
#                 order.contact.phone if order.contact and hasattr(order.contact, 'phone') else '',  # Phone
#                 order.carrier.name if order.carrier and hasattr(order.carrier, 'name') else '',    # Carrier
#                 order.service_type.service_name if order.service_type and hasattr(order.service_type, 'service_name') else '',  # ServiceType
#                 '', '', '', '', '', '', '', '', ''                                         # Campos en blanco
#             ])
#         else:
#             # Escribimos una fila por cada OrderLine
#             for line in order_lines:
#                 writer.writerow([
#                     order.modified_date.strftime('%m/%d/%Y') if order.modified_date else '',  # OrderDate
#                     order.project.client.lookup_code if order.project.client else '',          # Owner
#                     order.project.lookup_code,                                                 # Project
#                     order.lookup_code_order,                                                   # OrderNumber
#                     '',                                                                        # Status
#                     order.reference_number or '',                                              # ReferenceNumber
#                     order.notes or '',                                                         # Notes
#                     line.material.lookup_code if hasattr(line.material, 'lookup_code') else line.material.name,  # Material
#                     '',                                                                        # Lot
#                     str(line.quantity),                                                        # Quantity
#                     '',                                                                        # UOM (pendiente)
#                     order.contact.id if order.contact else '',                                 # AccountID
#                     order.contact.company_name if order.contact and hasattr(order.contact, 'company_name') else '',  # AccountName
#                     order.contact.id if order.contact else '',                                 # ContactLookup
#                     '',                                                                        # Title
#                     order.contact.company_name if order.contact and hasattr(order.contact, 'company_name') else '',  # FirstName
#                     '',                                                                        # MiddleName
#                     '',                                                                        # LastName
#                     order.shipping_address.address_line_1 if order.shipping_address else '',   # Addr1
#                     order.shipping_address.address_line_2 if order.shipping_address else '',   # Addr2
#                     order.shipping_address.city if order.shipping_address else '',             # City
#                     order.shipping_address.state if order.shipping_address else '',            # State
#                     order.shipping_address.postal_code if order.shipping_address else '',      # Zip
#                     '',                                                                        # Territory
#                     order.shipping_address.country if order.shipping_address else '',          # CountryName
#                     order.contact.phone if order.contact and hasattr(order.contact, 'phone') else '',  # Phone
#                     order.carrier.name if order.carrier and hasattr(order.carrier, 'name') else '',    # Carrier
#                     order.service_type.service_name if order.service_type and hasattr(order.service_type, 'service_name') else '',  # ServiceType
#                     '', '', '', '', '', '', '', '', ''                                         # Campos en blanco
#                 ])

#     # Actualizamos los campos file_generated y file_generated_at en el objeto order
#     order.file_generated = True
#     order.file_generated_at = timezone.now()

import csv
from django.utils import timezone

def generate_order_csv(order):
    """Genera un archivo TAB para la orden en la ruta de red con las columnas especificadas."""
    file_path = f"\\\\wd02\\Datex\\Import\\CRM_Orders_Import\\Test\\order_{order.lookup_code_order}.tab"
    with open(file_path, 'w', newline='') as tabfile:
        writer = csv.writer(tabfile, delimiter='\t')
        # Definimos las columnas en el orden exacto
        columns = [
            'OrderDate', 'Owner', 'Project', 'OrderNumber', 'Status', 'ReferenceNumber', 'Notes',
            'Material', 'Lot', 'Quantity', 'UOM', 'AccountID', 'AccountName', 'ContactLookup',
            'Title', 'FirstName', 'MiddleName', 'LastName', 'Addr1', 'Addr2', 'City', 'State',
            'Zip', 'Territory', 'CountryName', 'Phone', 'Carrier', 'ServiceType', 'StateLic',
            'StateofLicensure', 'StateLicExp', 'DEANumber', 'DEAExp', 'ME', 'Email', 'Fax',
            'OrderFullfillmentDate'
        ]
        writer.writerow(columns)

        # Obtenemos las líneas de la orden
        order_lines = order.lines.all()

        # Si no hay líneas, escribimos una fila con datos de la orden y campos vacíos
        if not order_lines:
            writer.writerow([
                order.modified_date.strftime('%m/%d/%Y') if order.modified_date else '',  # OrderDate
                order.project.client.lookup_code if order.project.client else '',          # Owner
                order.project.lookup_code,                                                 # Project
                order.lookup_code_order,                                                   # OrderNumber
                '',                                                                        # Status
                order.reference_number or '',                                              # ReferenceNumber
                order.notes or '',                                                         # Notes
                '',                                                                        # Material
                '',                                                                        # Lot
                '',                                                                        # Quantity
                '',                                                                        # UOM
                order.contact.id if order.contact else '',                                 # AccountID
                order.contact.company_name if order.contact and hasattr(order.contact, 'company_name') else '',  # AccountName
                order.contact.id if order.contact else '',                                 # ContactLookup
                '',                                                                        # Title
                order.contact.company_name if order.contact and hasattr(order.contact, 'company_name') else '',  # FirstName
                '',                                                                        # MiddleName
                '',                                                                        # LastName
                order.shipping_address.address_line_1 if order.shipping_address else '',   # Addr1
                order.shipping_address.address_line_2 if order.shipping_address else '',   # Addr2
                order.shipping_address.city if order.shipping_address else '',             # City
                order.shipping_address.state if order.shipping_address else '',            # State
                order.shipping_address.postal_code if order.shipping_address else '',      # Zip
                '',                                                                        # Territory
                order.shipping_address.country if order.shipping_address else '',          # CountryName
                order.contact.phone if order.contact and hasattr(order.contact, 'phone') else '',  # Phone
                order.carrier.name if order.carrier and hasattr(order.carrier, 'name') else '',    # Carrier
                order.service_type.service_name if order.service_type and hasattr(order.service_type, 'service_name') else '',  # ServiceType
                '', '', '', '', '', '', '', '', ''                                         # Campos en blanco
            ])
        else:
            # Escribimos una fila por cada OrderLine
            for line in order_lines:
                # Obtener el lookup_code del UOM desde la línea o el material si no está en la línea
                uom_lookup_code = ''
                if hasattr(line, 'uom') and line.uom:
                    uom_lookup_code = line.uom.lookup_code  # Usar lookup_code en lugar de name
                elif line.material and line.material.uom:
                    uom_lookup_code = line.material.uom.lookup_code  # Usar lookup_code en lugar de name

                writer.writerow([
                    order.modified_date.strftime('%m/%d/%Y') if order.modified_date else '',  # OrderDate
                    order.project.client.lookup_code if order.project.client else '',          # Owner
                    order.project.lookup_code,                                                 # Project
                    order.lookup_code_order,                                                   # OrderNumber
                    '',                                                                        # Status
                    order.reference_number or '',                                              # ReferenceNumber
                    order.notes or '',                                                         # Notes
                    line.material.lookup_code if hasattr(line.material, 'lookup_code') else line.material.name,  # Material
                    '',                                                                        # Lot
                    str(line.quantity),                                                        # Quantity
                    uom_lookup_code,                                                           # UOM
                    order.contact.id if order.contact else '',                                 # AccountID
                    order.contact.company_name if order.contact and hasattr(order.contact, 'company_name') else '',  # AccountName
                    order.contact.id if order.contact else '',                                 # ContactLookup
                    '',                                                                        # Title
                    order.contact.company_name if order.contact and hasattr(order.contact, 'company_name') else '',  # FirstName
                    '',                                                                        # MiddleName
                    '',                                                                        # LastName
                    order.shipping_address.address_line_1 if order.shipping_address else '',   # Addr1
                    order.shipping_address.address_line_2 if order.shipping_address else '',   # Addr2
                    order.shipping_address.city if order.shipping_address else '',             # City
                    order.shipping_address.state if order.shipping_address else '',            # State
                    order.shipping_address.postal_code if order.shipping_address else '',      # Zip
                    '',                                                                        # Territory
                    order.shipping_address.country if order.shipping_address else '',          # CountryName
                    order.contact.phone if order.contact and hasattr(order.contact, 'phone') else '',  # Phone
                    order.carrier.name if order.carrier and hasattr(order.carrier, 'name') else '',    # Carrier
                    order.service_type.service_name if order.service_type and hasattr(order.service_type, 'service_name') else '',  # ServiceType
                    '', '', '', '', '', '', '', '', ''                                         # Campos en blanco
                ])

    # Actualizamos los campos file_generated y file_generated_at en el objeto order
    order.file_generated = True
    order.file_generated_at = timezone.now()