import apiProtected from '../../../services/api/secureApi';
import { saveOrderLines, getSubmittedOrderStatus, handleApiError } from './apiUtils';
import { prepareOrderData } from './OrderValidation';

// Handle saving order details (step 1)
export const saveOrderDetails = async (formData, orderId, orderIdFromParams, setOrderId, dispatch, setError, setOpenSnackbar) => {
  try {
    const orderData = await prepareOrderData(formData);
    let response;
    const effectiveOrderId = orderId || orderIdFromParams;
    
    if (effectiveOrderId) {
      response = await apiProtected.patch(`orders/${effectiveOrderId}/`, orderData);
      console.log('Order updated:', response.data);
    } else {
      response = await apiProtected.post('orders/', orderData);
      setOrderId(response.data.id);
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'lookup_code_order',
        value: response.data.lookup_code_order,
      });
      console.log('Order created:', response.data);
    }
    
    setError(effectiveOrderId ? 'Order updated successfully' : 'Order created successfully');
    setOpenSnackbar(true);
    return true;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Failed to save order. Please try again.');
    setError(errorMessage);
    setOpenSnackbar(true);
    return false;
  }
};

// Handle final submission of the order
export const submitOrder = async (formData, orderId, navigate, setError, setOpenSnackbar) => {
  try {
    const success = await saveOrderLines(formData, orderId || formData.id, setError, setOpenSnackbar);
    if (!success) throw new Error('Failed to save lines');
    
    const submittedStatusId = await getSubmittedOrderStatus();
    await apiProtected.patch(`orders/${orderId || formData.id}/`, { order_status: submittedStatusId });
    
    setError('Order submitted successfully.');
    setOpenSnackbar(true);
    
    // Navigate after successful submission
    setTimeout(() => navigate('/dashboard'), 2000);
    return true;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Failed to submit order. Please try again.');
    setError(errorMessage);
    setOpenSnackbar(true);
    return false;
  }
};

// Load existing order data
export const loadOrderData = async (orderIdFromParams, user, dispatch, setOrderId, setError, setOpenSnackbar) => {
  try {
    const orderResponse = await apiProtected.get(`orders/${orderIdFromParams}/`);
    const order = orderResponse.data;
    console.log('Loaded order data:', order);

    const linesResponse = await apiProtected.get(`order-lines/order/${orderIdFromParams}/`);
    console.log('Loaded order lines:', linesResponse.data);

    dispatch({
      type: 'SET_FORM_DATA',
      data: {
        ...order,
        reference_number: order.reference_number ?? '',
        notes: order.notes ?? '',
        order_type: order.order_type ?? '',
        order_class: order.order_class ?? '',
        warehouse: order.warehouse ?? '',
        project: order.project ?? '',
        carrier: order.carrier ?? '',
        service_type: order.service_type ?? '',
        contact: order.contact ?? '',
        expected_delivery_date: order.expected_delivery_date ?? '',
        shipping_address: order.shipping_address ?? '',
        billing_address: order.billing_address ?? '',
        lookup_code_order: order.lookup_code_order ?? '',
        selectedInventories: linesResponse.data.map((line) => ({
          id: line.id,
          material: line.material,
          license_plate: line.license_plate,
          orderQuantity: line.quantity,
        })),
      },
    });
    
    setOrderId(orderIdFromParams);
    return true;
  } catch (err) {
    setError('Failed to load order details or lines.');
    setOpenSnackbar(true);
    console.error('Error:', err);
    return false;
  }
};