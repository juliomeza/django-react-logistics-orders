import { getFirstOrderStatus } from '../utils/apiUtils';

// Validate required fields for order details
export const validateOrderDetails = (formData) => {
  let newErrors = {};
  if (!formData.order_type) newErrors.order_type = true;
  if (!formData.order_class) newErrors.order_class = true;
  if (!formData.project) newErrors.project = true;
  if (!formData.warehouse) newErrors.warehouse = true;
  if (!formData.contact) newErrors.contact = true;
  if (!formData.shipping_address) newErrors.shipping_address = true;
  if (!formData.billing_address) newErrors.billing_address = true;

  return newErrors;
};

// Prepare order data for API submission
export const prepareOrderData = async (formData) => {
  return {
    reference_number: formData.reference_number || null,
    order_type: formData.order_type,
    order_class: formData.order_class,
    project: formData.project,
    warehouse: formData.warehouse,
    contact: formData.contact,
    shipping_address: formData.shipping_address,
    billing_address: formData.billing_address,
    carrier: formData.carrier || null,
    service_type: formData.service_type || null,
    expected_delivery_date: formData.expected_delivery_date || null,
    notes: formData.notes || '',
    order_status: formData.order_status || (await getFirstOrderStatus()),
  };
};