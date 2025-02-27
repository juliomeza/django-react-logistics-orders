import React, { useState, useContext, useEffect, useReducer } from 'react';
import { Container, Typography, Button, Box, Alert, Snackbar } from '@mui/material';
import { useNavigate, Navigate } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import OrderDetailsStep from '../components/orderDetails/OrderDetailsStep';
import MaterialSelectionStep from '../components/materialSelection/MaterialSelectionStep';
import ReviewStep from '../components/review/ReviewStep';
import apiProtected from '../../../services/api/secureApi';
import StepperHeader from '../components/StepperHeader';

// Form state reducer
const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_INVENTORIES':
      return { ...state, selectedInventories: action.inventories };
    default:
      return state;
  }
};

// Custom hook for loading reference data
const useReferenceData = (user) => {
  const [data, setData] = useState({
    orderTypes: [],
    orderClasses: [],
    projects: [],
    warehouses: [],
    contacts: [],
    addresses: [],
    carriers: [],
    carrierServices: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          orderTypesRes,
          orderClassesRes,
          projectsRes,
          warehousesRes,
          contactsRes,
          addressesRes,
          carriersRes,
          carrierServicesRes,
        ] = await Promise.all([
          apiProtected.get('order-types/'),
          apiProtected.get('order-classes/'),
          apiProtected.get('projects/'),
          apiProtected.get('warehouses/'),
          apiProtected.get('contacts/'),
          apiProtected.get('addresses/'),
          apiProtected.get('carriers/'),
          apiProtected.get('carrier-services/'),
        ]);
        const userId = parseInt(user.id, 10);
        setData({
          orderTypes: orderTypesRes.data,
          orderClasses: orderClassesRes.data,
          projects: projectsRes.data.filter(
            (proj) => Array.isArray(proj.users) && proj.users.includes(userId)
          ),
          warehouses: warehousesRes.data,
          contacts: contactsRes.data,
          addresses: addressesRes.data,
          carriers: carriersRes.data,
          carrierServices: carrierServicesRes.data,
        });
      } catch (err) {
        setError('Failed to load reference data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return { data, loading, error };
};

// Custom hook for loading inventories and materials
const useInventoriesAndMaterials = (user, warehouse) => {
  const [inventories, setInventories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !warehouse) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invRes, matRes] = await Promise.all([
          apiProtected.get('inventories/'),
          apiProtected.get('materials/'),
        ]);
        setInventories(
          invRes.data.filter((inv) => inv.warehouse === parseInt(warehouse, 10))
        );
        setMaterials(matRes.data);
      } catch (err) {
        setError('Failed to load inventories');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, warehouse]);

  return { inventories, materials, loading, error };
};

// Main component
const MultiStepCreateOrder = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form state with useReducer
  const [formData, dispatch] = useReducer(formReducer, {
    lookup_code_order: '',
    reference_number: '',
    notes: '',
    order_type: '',
    order_class: '',
    warehouse: '',
    project: '',
    carrier: '',
    service_type: '',
    contact: '',
    expected_delivery_date: '',
    shipping_address: '',
    billing_address: '',
    selectedInventories: [],
  });

  // Using custom hooks
  const referenceData = useReferenceData(user);
  const inventoriesAndMaterials = useInventoriesAndMaterials(user, formData.warehouse);

  const [orderId, setOrderId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const steps = ['Order Details', 'Materials', 'Review'];

  // Function to handle API errors
  const handleApiError = (error, defaultMessage) => {
    const message = error.response?.data
      ? Object.entries(error.response.data)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n')
      : defaultMessage;
    setError(message);
    setOpenSnackbar(true);
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'UPDATE_FIELD', field: name, value });
    setFormErrors((prev) => ({ ...prev, [name]: false }));
  };

  // Save order lines
  const saveOrderLines = async () => {
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
      handleApiError(error, 'Failed to save materials. Please try again.');
      return false; // Failure
    }
  };

  // Handle navigation for step 1
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
      handleApiError(error, 'Failed to create order. Please try again.');
    }
  };

  // Handle navigation for step 2
  const handleMaterialsNext = async () => {
    const success = await saveOrderLines();
    if (success) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // General navigation
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
      await saveOrderLines();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep !== steps.length - 1) return;

    try {
      const success = await saveOrderLines();
      if (!success) throw new Error('Failed to save lines');
      const submittedStatusId = await getSubmittedOrderStatus();
      await apiProtected.patch(`orders/${orderId}/`, { order_status: submittedStatusId });
      setError('Order submitted successfully.');
      setOpenSnackbar(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      handleApiError(error, 'Failed to submit order. Please try again.');
    }
  };

  const getFirstOrderStatus = async () => {
    try {
      const response = await apiProtected.get('order-statuses/');
      const createdStatus = response.data.find((status) => status.status_name === 'Created');
      return createdStatus ? createdStatus.id : 1;
    } catch (error) {
      console.error('Error fetching statuses:', error);
      return 1; // Fallback
    }
  };

  const getSubmittedOrderStatus = async () => {
    try {
      const response = await apiProtected.get('order-statuses/');
      const submittedStatus = response.data.find((status) => status.status_name === 'Submitted');
      return submittedStatus ? submittedStatus.id : 2;
    } catch (error) {
      console.error('Error fetching submitted status:', error);
      return 2; // Fallback
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
                  disabled={
                    !formData.selectedInventories || formData.selectedInventories.length === 0
                  }
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