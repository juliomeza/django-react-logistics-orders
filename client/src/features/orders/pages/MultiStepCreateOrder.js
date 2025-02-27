import React, { useState, useContext, useReducer } from 'react';
import { Container, Typography, Button, Box, Snackbar, Alert } from '@mui/material';
import { useNavigate, Navigate } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import OrderDetailsStep from '../components/orderDetails/OrderDetailsStep';
import MaterialSelectionStep from '../components/materialSelection/MaterialSelectionStep';
import ReviewStep from '../components/review/ReviewStep';
import apiProtected from '../../../services/api/secureApi'; // Added missing import
import StepperHeader from '../components/StepperHeader';
import { formReducer, initialFormState } from './formReducer';
import useReferenceData from './useReferenceData';
import useInventoriesAndMaterials from './useInventoriesAndMaterials';
import { saveOrderLines, getFirstOrderStatus, getSubmittedOrderStatus, handleApiError } from './apiUtils';

const MultiStepCreateOrder = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, dispatch] = useReducer(formReducer, initialFormState);
  const referenceData = useReferenceData(user);
  const inventoriesAndMaterials = useInventoriesAndMaterials(user, formData.warehouse);

  const [orderId, setOrderId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const steps = ['Order Details', 'Materials', 'Review'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'UPDATE_FIELD', field: name, value });
    setFormErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleOrderDetailsNext = async () => {
    let newErrors = {};
    if (!formData.order_type) newErrors.order_type = true;
    if (!formData.order_class) newErrors.order_class = true;
    if (!formData.project) newErrors.project = true;
    if (!formData.warehouse) newErrors.warehouse = true;
    if (!formData.contact) newErrors.contact = true;
    if (!formData.shipping_address) newErrors.shipping_address = true;
    if (!formData.billing_address) newErrors.billing_address = true;

    if (Object.keys(newErrors).length > 0) {
      setError('Please fill in all required fields before proceeding.');
      setFormErrors(newErrors);
      setOpenSnackbar(true);
      return;
    }

    try {
      const orderStatusId = await getFirstOrderStatus();
      const orderData = {
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
        order_status: orderStatusId,
      };

      console.log('Sending order data:', orderData); // Debug
      const orderResponse = await apiProtected.post('orders/', orderData);
      setOrderId(orderResponse.data.id);
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'lookup_code_order',
        value: orderResponse.data.lookup_code_order,
      });
      setError('Order created successfully');
      setOpenSnackbar(true);
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      console.error('Error creating order:', error); // Debug
      const errorMessage = handleApiError(error, 'Failed to create order. Please try again.');
      setError(errorMessage);
      setOpenSnackbar(true);
    }
  };

  const handleMaterialsNext = async () => {
    const success = await saveOrderLines(formData, orderId, setError, setOpenSnackbar);
    if (success) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      handleOrderDetailsNext();
    } else if (currentStep === 1) {
      handleMaterialsNext();
    }
  };

  const handleBack = () => {
    setError('');
    setFormErrors({});
    setCurrentStep((prev) => prev - 1);
  };

  const handleSave = async () => {
    if (currentStep === 1) {
      await saveOrderLines(formData, orderId, setError, setOpenSnackbar);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep !== steps.length - 1) return;

    try {
      const success = await saveOrderLines(formData, orderId, setError, setOpenSnackbar);
      if (!success) throw new Error('Failed to save lines');
      const submittedStatusId = await getSubmittedOrderStatus();
      await apiProtected.patch(`orders/${orderId}/`, { order_status: submittedStatusId });
      setError('Order submitted successfully.');
      setOpenSnackbar(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Error submitting order:', error); // Debug
      const errorMessage = handleApiError(error, 'Failed to submit order. Please try again.');
      setError(errorMessage);
      setOpenSnackbar(true);
    }
  };

  if (authLoading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <OrderDetailsStep
            formData={formData}
            handleChange={handleChange}
            orderTypes={referenceData.data.orderTypes}
            orderClasses={referenceData.data.orderClasses}
            warehouses={referenceData.data.warehouses}
            projects={referenceData.data.projects}
            carriers={referenceData.data.carriers}
            carrierServices={referenceData.data.carrierServices}
            contacts={referenceData.data.contacts}
            addresses={referenceData.data.addresses}
            formErrors={formErrors}
          />
        );
      case 1:
        return (
          <MaterialSelectionStep
            formData={formData}
            setFormData={(inventories) =>
              dispatch({ type: 'SET_INVENTORIES', inventories })
            }
            inventories={inventoriesAndMaterials.inventories}
            materials={inventoriesAndMaterials.materials}
            loading={inventoriesAndMaterials.loading}
          />
        );
      case 2:
        return (
          <ReviewStep
            formData={formData}
            orderTypes={referenceData.data.orderTypes}
            orderClasses={referenceData.data.orderClasses}
            warehouses={referenceData.data.warehouses}
            projects={referenceData.data.projects}
            carriers={referenceData.data.carriers}
            carrierServices={referenceData.data.carrierServices}
            contacts={referenceData.data.contacts}
            addresses={referenceData.data.addresses}
            materials={inventoriesAndMaterials.materials}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <StepperHeader activeStep={currentStep} steps={steps} />
      <Container sx={{ mt: 12, mb: 4 }}>
        <form>
          {renderStepContent(currentStep)}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={handleBack} disabled={currentStep === 0}>
              Back
            </Button>
            <Box>
              {currentStep === 1 && (
                <Button
                  variant="outlined"
                  onClick={handleSave}
                  sx={{ mr: 2 }}
                  disabled={inventoriesAndMaterials.loading}
                >
                  Save
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  color="primary"
                  disabled={!formData.selectedInventories || formData.selectedInventories.length === 0}
                >
                  Submit Order
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Container>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={
            error.includes('Failed') ||
            error.includes('Please fill in all required fields') ||
            error.includes('Please select at least one material')
              ? 'error'
              : 'success'
          }
          onClose={() => setOpenSnackbar(false)}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MultiStepCreateOrder;