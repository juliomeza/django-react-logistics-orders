import React, { useState, useContext, useEffect } from 'react';
import { Container, Typography, Button, Box, Alert, Snackbar } from '@mui/material';
import { useNavigate, Navigate } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import OrderDetailsStep from '../components/orderDetails/OrderDetailsStep';
import MaterialSelectionStep from '../components/materialSelection/MaterialSelectionStep';
import ReviewStep from '../components/review/ReviewStep';
import apiProtected from '../../../services/api/secureApi';
import StepperHeader from '../components/StepperHeader';

const MultiStepCreateOrder = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
    selectedInventories: []
  });

  const [orderId, setOrderId] = useState(null);
  const [orderTypes, setOrderTypes] = useState([]);
  const [orderClasses, setOrderClasses] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [carrierServices, setCarrierServices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [inventoriesLoading, setInventoriesLoading] = useState(true);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchReferenceData = async () => {
      setOptionsLoading(true);
      try {
        const [
          orderTypesRes,
          orderClassesRes,
          projectsRes,
          warehousesRes,
          contactsRes,
          addressesRes,
          carriersRes,
          carrierServicesRes
        ] = await Promise.all([
          apiProtected.get('order-types/'),
          apiProtected.get('order-classes/'),
          apiProtected.get('projects/'),
          apiProtected.get('warehouses/'),
          apiProtected.get('contacts/'),
          apiProtected.get('addresses/'),
          apiProtected.get('carriers/'),
          apiProtected.get('carrier-services/')
        ]);
        setOrderTypes(orderTypesRes.data);
        setOrderClasses(orderClassesRes.data);
        const userId = parseInt(user.id, 10);
        setProjects(
          projectsRes.data.filter(
            (proj) => Array.isArray(proj.users) && proj.users.includes(userId)
          )
        );
        setWarehouses(warehousesRes.data);
        setContacts(contactsRes.data);
        setAddresses(addressesRes.data);
        setCarriers(carriersRes.data);
        setCarrierServices(carrierServicesRes.data);
      } catch (error) {
        console.error('Error fetching reference data:', error);
        setError('Failed to load reference data. Please try again.');
        setOpenSnackbar(true);
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchReferenceData();
  }, [user]);

  useEffect(() => {
    if (!user || !formData.warehouse) return;
    const fetchInventoriesAndMaterials = async () => {
      setInventoriesLoading(true);
      try {
        const [inventoriesRes, materialsRes] = await Promise.all([
          apiProtected.get('inventories/'),
          apiProtected.get('materials/')
        ]);
        const warehouseInventories = inventoriesRes.data.filter(
          inv => inv.warehouse === parseInt(formData.warehouse, 10)
        );
        setInventories(warehouseInventories);
        setMaterials(materialsRes.data);
      } catch (error) {
        console.error('Error fetching inventories or materials:', error);
        setError('Failed to load inventory data. Please try again.');
        setOpenSnackbar(true);
      } finally {
        setInventoriesLoading(false);
      }
    };
    fetchInventoriesAndMaterials();
  }, [user, formData.warehouse]);

  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Order Details', 'Materials', 'Review'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: false }));
  };

  // Step 2: Function to save order lines (delete existing lines first)
  const saveOrderLines = async () => {
    if (!formData.selectedInventories || formData.selectedInventories.length === 0) {
      setError('Please select at least one material before saving.');
      setOpenSnackbar(true);
      return;
    }
    try {
      // Delete all existing order lines for this order
      await apiProtected.delete(`order-lines/order/${orderId}/clear/`);

      // Save the current selected inventories as new lines
      const orderLinePromises = formData.selectedInventories.map(item => {
        const orderLineData = {
          order: orderId,
          material: item.material,
          quantity: item.orderQuantity || 1,
          license_plate: item.id
        };
        return apiProtected.post('order-lines/', orderLineData);
      });
      await Promise.all(orderLinePromises);
      setError('Materials saved successfully.');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error saving order lines:', error);
      setError('Failed to save materials. Please try again.');
      setOpenSnackbar(true);
    }
  };

  // Step 1 and 2: Handle navigation and order creation
  const handleNext = async () => {
    let newErrors = {};
    if (currentStep === 0) {
      // Step 1: Create the order
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
          order_status: orderStatusId
        };

        console.log('Sending order data:', orderData); // Debug data being sent
        const orderResponse = await apiProtected.post('orders/', orderData);
        setOrderId(orderResponse.data.id);
        setFormData(prev => ({
          ...prev,
          lookup_code_order: orderResponse.data.lookup_code_order
        }));
        setError('Order created successfully.'); // Success message for Step 1
        setOpenSnackbar(true);
      } catch (error) {
        console.error('Error creating order:', error);
        if (error.response && error.response.data) {
          const errorMessages = Object.entries(error.response.data)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          setError(`Failed to create order: \n${errorMessages}`);
        } else {
          setError('Failed to create order. Please try again.');
        }
        setOpenSnackbar(true);
        return;
      }
    } else if (currentStep === 1) {
      // Step 2: Save materials before moving to Review
      await saveOrderLines();
      if (openSnackbar && error.includes('Failed')) return; // Stop if save fails
      setError('Materials saved.'); // Success message for Step 2 to Step 3
      setOpenSnackbar(true);
    }

    setFormErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setFormErrors({});
    setCurrentStep(prev => prev - 1);
  };

  // Step 2: Handle Save button
  const handleSave = async () => {
    if (currentStep === 1) {
      await saveOrderLines();
    }
  };

  // Step 3: Submit the order and change status to "Submitted"
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep !== steps.length - 1) return;

    setError('');
    setFormErrors({});

    try {
      // Submit order lines (ensure all are saved)
      await saveOrderLines(); // This will overwrite existing lines
      if (openSnackbar && error.includes('Failed')) throw new Error('Failed to save lines');

      // Update order status to "Submitted" using PATCH
      const submittedStatusId = await getSubmittedOrderStatus();
      await apiProtected.patch(`orders/${orderId}/`, {
        order_status: submittedStatusId
      });

      setError('Order submitted successfully.'); // Success message for Submit
      setOpenSnackbar(true);
      
      // Delay navigation to show the message for 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting order:', error);
      if (error.response && error.response.data) {
        const errorMessages = Object.entries(error.response.data)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        setError(`Failed to submit order: \n${errorMessages}`);
      } else {
        setError('Failed to submit order. Please try again.');
      }
      setOpenSnackbar(true);
    }
  };

  const getFirstOrderStatus = async () => {
    try {
      const response = await apiProtected.get('order-statuses/');
      const createdStatus = response.data.find(status => status.status_name === 'Created');
      if (createdStatus) return createdStatus.id;
      throw new Error('Created status not found');
    } catch (error) {
      console.error('Error fetching order statuses:', error);
      return 1; // Fallback
    }
  };

  const getSubmittedOrderStatus = async () => {
    try {
      const response = await apiProtected.get('order-statuses/');
      const submittedStatus = response.data.find(status => status.status_name === 'Submitted');
      if (submittedStatus) return submittedStatus.id;
      throw new Error('Submitted status not found');
    } catch (error) {
      console.error('Error fetching submitted status:', error);
      return 2; // Fallback to ID 2
    }
  };

  if (loading) {
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
        // Step 1: Order Details
        return (
          <OrderDetailsStep
            formData={formData}
            handleChange={handleChange}
            orderTypes={orderTypes}
            orderClasses={orderClasses}
            warehouses={warehouses}
            projects={projects}
            carriers={carriers}
            carrierServices={carrierServices}
            contacts={contacts}
            addresses={addresses}
            formErrors={formErrors}
          />
        );
      case 1:
        // Step 2: Materials Selection
        return (
          <MaterialSelectionStep
            formData={formData}
            setFormData={setFormData}
            inventories={inventories}
            materials={materials}
            loading={inventoriesLoading}
          />
        );
      case 2:
        // Step 3: Review
        return (
          <ReviewStep
            formData={formData}
            orderTypes={orderTypes}
            orderClasses={orderClasses}
            warehouses={warehouses}
            projects={projects}
            carriers={carriers}
            carrierServices={carrierServices}
            contacts={contacts}
            addresses={addresses}
            materials={materials}
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
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Box>
              {currentStep === 1 && (
                // Step 2: Save button
                <Button
                  variant="outlined"
                  onClick={handleSave}
                  sx={{ mr: 2 }}
                  disabled={inventoriesLoading}
                >
                  Save
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 0 && optionsLoading) ||
                    (currentStep === 1 && inventoriesLoading)
                  }
                >
                  Next
                </Button>
              ) : (
                // Step 3: Submit button
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
            error.includes('Failed') || error.includes('Please fill in all required fields') 
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