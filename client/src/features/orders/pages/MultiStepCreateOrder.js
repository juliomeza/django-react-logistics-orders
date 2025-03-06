import React, { useState, useContext, useReducer, useEffect } from 'react';
import { Container, Typography, Button, Box, Snackbar, Alert } from '@mui/material';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import OrderDetailsForm from '../components/OrderDetailsForm';
import MaterialSelectionStep from '../components/MaterialSelectionStep';
import ReviewStep from '../components/ReviewStep';
import apiProtected from '../../../services/api/secureApi';
import StepperHeader from '../components/StepperHeader';
import { formReducer, initialFormState } from '../reducers/formReducer';
import useReferenceData from '../hooks/useReferenceData';
import useInventoriesAndMaterials from '../hooks/useInventoriesAndMaterials';
import { saveOrderLines, getFirstOrderStatus, getSubmittedOrderStatus, handleApiError } from '../utils/apiUtils';

const MultiStepCreateOrder = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { orderId: orderIdFromParams } = useParams();

  const [formData, dispatch] = useReducer(formReducer, initialFormState);
  const { data: referenceData, refetchReferenceData } = useReferenceData(user); // Eliminamos loading y refError
  const inventoriesAndMaterials = useInventoriesAndMaterials(user, formData.warehouse);

  const [orderId, setOrderId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const steps = ['Order Details', 'Materials', 'Review'];

  const isOrderLocked = !!(orderId || orderIdFromParams);

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderIdFromParams && user) {
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
          setCurrentStep(0);
        } catch (err) {
          setError('Failed to load order details or lines.');
          setOpenSnackbar(true);
          console.error('Error:', err);
        }
      }
    };
    fetchOrder();
  }, [orderIdFromParams, user]);

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
        order_status: formData.order_status || (await getFirstOrderStatus()),
      };

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
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to save order. Please try again.');
      setError(errorMessage);
      setOpenSnackbar(true);
    }
  };

  const handleMaterialsNext = async () => {
    const success = await saveOrderLines(formData, orderId || formData.id, setError, setOpenSnackbar);
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
      await saveOrderLines(formData, orderId || formData.id, setError, setOpenSnackbar);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep !== steps.length - 1) return;

    try {
      const success = await saveOrderLines(formData, orderId || formData.id, setError, setOpenSnackbar);
      if (!success) throw new Error('Failed to save lines');
      const submittedStatusId = await getSubmittedOrderStatus();
      await apiProtected.patch(`orders/${orderId || formData.id}/`, { order_status: submittedStatusId });
      setError('Order submitted successfully.');
      setOpenSnackbar(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
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
          <OrderDetailsForm
            formData={formData}
            handleChange={handleChange}
            orderTypes={referenceData.orderTypes}
            orderClasses={referenceData.orderClasses}
            warehouses={referenceData.warehouses}
            projects={referenceData.projects}
            carriers={referenceData.carriers}
            carrierServices={referenceData.carrierServices}
            contacts={referenceData.contacts}
            addresses={referenceData.addresses}
            formErrors={formErrors}
            isOrderLocked={isOrderLocked}
            user={user}
            refetchReferenceData={refetchReferenceData}
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
            orderTypes={referenceData.orderTypes}
            orderClasses={referenceData.orderClasses}
            warehouses={referenceData.warehouses}
            projects={referenceData.projects}
            carriers={referenceData.carriers}
            carrierServices={referenceData.carrierServices}
            contacts={referenceData.contacts}
            addresses={referenceData.addresses}
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