import React, { useState, useContext, useEffect } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate, Navigate } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import OrderDetailsStep from '../components/orderDetails/OrderDetailsStep';
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
    billing_address: ''
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

  // Load options
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
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
        console.error('Error fetching options:', error);
      }
    };
    fetchData();
  }, [user]);

  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Order Details', 'Materials', 'Review'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    navigate('/dashboard');
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
        return <Typography>Materials Step (to be implemented)</Typography>;
      case 2:
        return <Typography>Review Step (to be implemented)</Typography>;
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
        <form onSubmit={handleSubmit}>
          {renderStepContent(currentStep)}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={handleBack} disabled={currentStep === 0}>
              Back
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            )}
          </Box>
        </form>
      </Container>
    </>
  );
};

export default MultiStepCreateOrder;
