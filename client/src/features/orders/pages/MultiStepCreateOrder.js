import React, { useState, useContext, useReducer, useEffect } from 'react';
import { Container, Typography, Snackbar, Alert } from '@mui/material';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import OrderDetailsForm from '../components/OrderDetails/OrderDetailsForm';
import MaterialSelectionStep from '../components/Materials/MaterialSelectionStep';
import OrderSummary from '../components/OrderSummary';
import StepperHeader from '../components/StepperHeader';
import { formReducer, initialFormState } from '../reducers/formReducer';
import useReferenceData from '../hooks/useReferenceData';
import useInventoriesAndMaterials from '../hooks/useInventoriesAndMaterials';
import { saveOrderLines } from '../utils/apiUtils';
import { validateOrderDetails } from '../utils/OrderValidation';
import OrderStepActions from '../components/OrderStepActions';
import { saveOrderDetails, submitOrder, loadOrderData } from '../utils/OrderSubmission';

// Render step content based on current step
const renderStepContent = (
  step,
  formData,
  handleChange,
  referenceData,
  inventoriesAndMaterials,
  formErrors,
  isOrderLocked,
  user,
  refetchReferenceData,
  dispatch
) => {
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
      <OrderSummary
        orderData={formData}
        referenceData={referenceData}
        materials={inventoriesAndMaterials.materials}
        materialItems={formData.selectedInventories}
        isReviewMode={true}
      />
      );
    default:
    return null;
  }
};

const MultiStepCreateOrder = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { orderId: orderIdFromParams } = useParams();

  const [formData, dispatch] = useReducer(formReducer, initialFormState);
  const { data: referenceData, refetchReferenceData } = useReferenceData(user);
  const inventoriesAndMaterials = useInventoriesAndMaterials(user, formData.warehouse);

  // Component state
  const [orderId, setOrderId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  const steps = ['Order Details', 'Materials', 'Review'];
  const isOrderLocked = !!(orderId || orderIdFromParams);

  // Load existing order data if editing
  useEffect(() => {
    if (orderIdFromParams && user) {
      loadOrderData(orderIdFromParams, user, dispatch, setOrderId, setError, setOpenSnackbar);
    }
  }, [orderIdFromParams, user]);

  // Form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'UPDATE_FIELD', field: name, value });
    setFormErrors((prev) => ({ ...prev, [name]: false }));
  };

  // Step 1 - Order Details validation and save
  const handleOrderDetailsNext = async () => {
    const newErrors = validateOrderDetails(formData);

    if (Object.keys(newErrors).length > 0) {
      setError('Please fill in all required fields before proceeding.');
      setFormErrors(newErrors);
      setOpenSnackbar(true);
      return;
    }

    const success = await saveOrderDetails(
      formData, 
      orderId, 
      orderIdFromParams, 
      setOrderId, 
      dispatch, 
      setError, 
      setOpenSnackbar
    );
    
    if (success) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Step 2 - Materials validation and save
  const handleMaterialsNext = async () => {
    const success = await saveOrderLines(formData, orderId || formData.id, setError, setOpenSnackbar);
    if (success) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Generic next button handler
  const handleNext = () => {
    if (currentStep === 0) {
      handleOrderDetailsNext();
    } else if (currentStep === 1) {
      handleMaterialsNext();
    }
  };

  // Back button handler
  const handleBack = () => {
    setError('');
    setFormErrors({});
    setCurrentStep((prev) => prev - 1);
  };

  // Save button handler (only for materials step)
  const handleSave = async () => {
    if (currentStep === 1) {
      await saveOrderLines(formData, orderId || formData.id, setError, setOpenSnackbar);
    }
  };

  // Final submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep !== steps.length - 1) return;
    
    await submitOrder(formData, orderId, navigate, setError, setOpenSnackbar);
  };

  // Loading and auth states
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

  // Main render
  return (
    <>
      <StepperHeader activeStep={currentStep} steps={steps} />
      <Container sx={{ mt: 12, mb: 4 }}>
        <form>
          {renderStepContent(
            currentStep,
            formData,
            handleChange,
            referenceData,
            inventoriesAndMaterials,
            formErrors,
            isOrderLocked,
            user,
            refetchReferenceData,
            dispatch
          )}
          
          <OrderStepActions 
            currentStep={currentStep}
            totalSteps={steps.length}
            onBack={handleBack}
            onNext={handleNext}
            onSave={handleSave}
            onSubmit={handleSubmit}
            disableSubmit={!formData.selectedInventories || formData.selectedInventories.length === 0}
            disableSave={inventoriesAndMaterials.loading}
          />
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