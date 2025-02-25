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

  // Form state
  const [formData, setFormData] = useState({
    lookup_code_order: '',
    lookup_code_shipment: '',
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

  // States for options
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

  // Loading states
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [inventoriesLoading, setInventoriesLoading] = useState(true);

  // Error states
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Load reference data
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

  // Load inventories and materials when warehouse changes
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
    // Limpiar errores al cambiar valor
    setFormErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleNext = () => {
    let newErrors = {};
    if (currentStep === 0) {
      // Validación de campos obligatorios en el paso 0
      if (!formData.order_type) newErrors.order_type = true;
      if (!formData.order_class) newErrors.order_class = true;
      if (!formData.lookup_code_order) newErrors.lookup_code_order = true;
      if (!formData.lookup_code_shipment) newErrors.lookup_code_shipment = true;
      if (!formData.warehouse) newErrors.warehouse = true;
      if (!formData.project) newErrors.project = true;
      if (!formData.contact) newErrors.contact = true;
      if (!formData.shipping_address) newErrors.shipping_address = true;
      if (!formData.billing_address) newErrors.billing_address = true;

      if (Object.keys(newErrors).length > 0) {
        setError('Please fill in all required fields before proceeding.');
        setFormErrors(newErrors);
        setOpenSnackbar(true);
        return;
      }
    } else if (currentStep === 1) {
      if (!formData.selectedInventories || formData.selectedInventories.length === 0) {
        setError('Please select at least one material for this order.');
        setOpenSnackbar(true);
        return;
      }
    }

    setError('');
    setFormErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setFormErrors({});
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep !== steps.length - 1) return;

    setError('');
    setFormErrors({});

    try {
      const orderStatusId = await getFirstOrderStatus();
      const orderData = {
        lookup_code_order: formData.lookup_code_order,
        lookup_code_shipment: formData.lookup_code_shipment,
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

      const orderResponse = await apiProtected.post('orders/', orderData);
      const orderId = orderResponse.data.id;

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
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting order:', error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        setError(`Failed to create order: \n${errorMessages}`);
      } else {
        setError('Failed to create order. Please check your input and try again.');
      }
      setOpenSnackbar(true);
    }
  };

  const getFirstOrderStatus = async () => {
    try {
      const response = await apiProtected.get('order-statuses/');
      if (response.data && response.data.length > 0) {
        return response.data[0].id;
      }
      throw new Error('No order statuses found');
    } catch (error) {
      console.error('Error fetching order statuses:', error);
      return 1; // Fallback
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
            formErrors={formErrors} // Pasar errores al componente
          />
        );
      case 1:
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
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
                disabled={!formData.selectedInventories || formData.selectedInventories.length === 0}
              >
                Create Order
              </Button>
            )}
          </Box>
        </form>
      </Container>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setOpenSnackbar(false)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MultiStepCreateOrder;