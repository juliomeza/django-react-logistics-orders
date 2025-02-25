import React, { useState, useContext, useEffect } from 'react';
import { Container, Typography, Button, Box, Alert } from '@mui/material';
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
  
  // Error state
  const [error, setError] = useState('');

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
        
        console.log('Fetched inventories:', inventoriesRes.data);
        console.log('Fetched materials:', materialsRes.data);
        
        // Filter inventories by warehouse if needed
        const warehouseInventories = inventoriesRes.data.filter(
          inv => inv.warehouse === parseInt(formData.warehouse, 10)
        );
        
        console.log('Filtered inventories for warehouse:', warehouseInventories);
        
        setInventories(warehouseInventories);
        setMaterials(materialsRes.data);
      } catch (error) {
        console.error('Error fetching inventories or materials:', error);
        setError('Failed to load inventory data. Please try again.');
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
  };

  const handleNext = () => {
    // Validate the current step
    if (currentStep === 0) {
      // Validate order details
      if (!formData.order_type || !formData.order_class || 
          !formData.lookup_code_order || !formData.lookup_code_shipment ||
          !formData.warehouse || !formData.project ||
          !formData.contact || !formData.shipping_address || !formData.billing_address) {
        setError('Please fill in all required fields before proceeding.');
        return;
      }
    } else if (currentStep === 1) {
      // Validate materials selection
      if (!formData.selectedInventories || formData.selectedInventories.length === 0) {
        setError('Please select at least one material for this order.');
        return;
      }
    }
    
    setError(''); // Clear any previous errors
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(''); // Clear any errors when going back
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only proceed with submission if we're on the last step and the form was actually submitted
    if (currentStep !== steps.length - 1) {
      return;
    }
    
    setError('');
    
    try {
      // Add order_status - this was missing and probably causing the 400 error
      // Default to the first order status (typically "New" or similar)
      const orderStatusId = await getFirstOrderStatus();
      
      // Create the order
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
        order_status: orderStatusId // Add the order status
      };
      
      console.log('Submitting order data:', orderData);
      
      // Submit the order
      const orderResponse = await apiProtected.post('orders/', orderData);
      const orderId = orderResponse.data.id;
      
      // Create the order lines for each selected inventory item
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
      
      // Redirect to dashboard after successful creation
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting order:', error);
      // Extract and display the specific error message if available
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        console.log('Server error details:', errorData);
        
        if (typeof errorData === 'object') {
          // For field-specific errors
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          setError(`Failed to create order: \n${errorMessages}`);
        } else {
          setError(`Failed to create order: ${errorData}`);
        }
      } else {
        setError('Failed to create order. Please check your input and try again.');
      }
    }
  };
  
  // Helper function to get the first order status (usually "New" or similar)
  const getFirstOrderStatus = async () => {
    try {
      const response = await apiProtected.get('order-statuses/');
      if (response.data && response.data.length > 0) {
        return response.data[0].id;
      }
      // Fallback in case no statuses are available
      throw new Error('No order statuses found');
    } catch (error) {
      console.error('Error fetching order statuses:', error);
      // Return a likely valid ID as fallback (adjust as needed)
      return 1;
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
      {/* Fixed component for the Stepper */}
      <StepperHeader activeStep={currentStep} steps={steps} />
      
      {/* Add top margin so the content is not hidden behind the Stepper */}
      <Container sx={{ mt: 12, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Note: Removed onSubmit to prevent auto-submission */}
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
                disabled={
                  !formData.selectedInventories || 
                  formData.selectedInventories.length === 0
                }
              >
                Create Order
              </Button>
            )}
          </Box>
        </form>
      </Container>
    </>
  );
};

export default MultiStepCreateOrder;