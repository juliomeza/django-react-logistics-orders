import apiProtected from '../../../services/api/secureApi';

// Handle API errors (adjusted to match original behavior)
export const handleApiError = (error, defaultMessage) => {
  const message = error.response?.data
    ? Object.entries(error.response.data)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join('\n')
    : defaultMessage;
  return message; // Return message instead of setting state directly
};

// Save order lines
export const saveOrderLines = async (formData, orderId, setError, setOpenSnackbar) => {
  if (!Array.isArray(formData.selectedInventories) || formData.selectedInventories.length === 0) {
    setError('Please select at least one material before saving.');
    setOpenSnackbar(true);
    return false;
  }
  try {
    if (!orderId) {
      throw new Error('Order ID is not set. Cannot save materials.');
    }
    console.log('Saving lines with orderId:', orderId);
    console.log('Selected inventories:', formData.selectedInventories);

    await apiProtected.delete(`order-lines/order/${orderId}/clear/`);
    const orderLinePromises = formData.selectedInventories.map((item) => {
      const orderLineData = {
        order: orderId,
        material: item.material,
        quantity: item.orderQuantity || 1,
        license_plate: item.id,
      };
      return apiProtected.post('order-lines/', orderLineData);
    });
    await Promise.all(orderLinePromises);
    setError('Materials saved successfully');
    setOpenSnackbar(true);
    return true; // Success
  } catch (error) {
    console.error('Error saving lines:', error);
    const errorMessage = handleApiError(error, 'Failed to save materials. Please try again.');
    setError(errorMessage);
    setOpenSnackbar(true);
    return false; // Failure
  }
};

// Get first order status
export const getFirstOrderStatus = async () => {
  try {
    const response = await apiProtected.get('order-statuses/');
    const createdStatus = response.data.find((status) => status.status_name === 'Created');
    return createdStatus ? createdStatus.id : 1;
  } catch (error) {
    console.error('Error fetching statuses:', error);
    return 1; // Fallback
  }
};

// Get submitted order status
export const getSubmittedOrderStatus = async () => {
  try {
    const response = await apiProtected.get('order-statuses/');
    const submittedStatus = response.data.find((status) => status.status_name === 'Submitted');
    return submittedStatus ? submittedStatus.id : 2;
  } catch (error) {
    console.error('Error fetching submitted status:', error);
    return 2; // Fallback
  }
};