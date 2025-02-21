// MultiStepCreateOrder.js
import React, { useState, useContext } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  TextField
} from '@mui/material';
import { useNavigate, Navigate } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';

// Subcomponente para el primer paso: Order Details
const OrderDetails = ({ formData, handleChange }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Order Details
      </Typography>
      <TextField
        label="Lookup Code Order"
        name="lookup_code_order"
        value={formData.lookup_code_order}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Lookup Code Shipment"
        name="lookup_code_shipment"
        value={formData.lookup_code_shipment}
        onChange={handleChange}
        fullWidth
        required
      />
    </Paper>
  );
};

// Subcomponente para el segundo paso: Inventory/Materials
const Inventory = ({ formData, handleChange }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Inventory / Materials
      </Typography>
      {/* Aquí irían los campos para seleccionar inventario.
          Por ahora dejamos un campo de ejemplo */}
      <TextField
        label="Material Code"
        name="material_code"
        value={formData.material_code || ''}
        onChange={handleChange}
        fullWidth
      />
    </Paper>
  );
};

// Subcomponente para el tercer paso: Review
const Review = ({ formData }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Review Order
      </Typography>
      <Typography variant="body1">
        <strong>Lookup Code Order:</strong> {formData.lookup_code_order}
      </Typography>
      <Typography variant="body1">
        <strong>Lookup Code Shipment:</strong> {formData.lookup_code_shipment}
      </Typography>
      <Typography variant="body1">
        <strong>Material Code:</strong> {formData.material_code || '-'}
      </Typography>
      {/* Agrega más campos según sea necesario */}
    </Paper>
  );
};

const MultiStepCreateOrder = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Order Details', 'Materials', 'Review'];

  // Estado del formulario (puedes inicializar con los campos necesarios)
  const [formData, setFormData] = useState({
    lookup_code_order: '',
    lookup_code_shipment: '',
    material_code: ''
    // ...otros campos que vayas a usar
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se enviaría el formulario, por ejemplo:
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

  // Renderiza el contenido según el paso actual
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <OrderDetails formData={formData} handleChange={handleChange} />;
      case 1:
        return <Inventory formData={formData} handleChange={handleChange} />;
      case 2:
        return <Review formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      {/* Stepper que se actualiza al cambiar de paso */}
      <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label} completed={currentStep > index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={handleSubmit}>
        {renderStepContent(currentStep)}

        {/* Botones de navegación */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
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
  );
};

export default MultiStepCreateOrder;
