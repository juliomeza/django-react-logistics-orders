import React from 'react';
import { Box, Stepper, Step, StepLabel } from '@mui/material';

const StepperHeader = ({ activeStep, steps }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 64, // Ajusta este valor según la altura de tu header principal
        left: 0,
        right: 0,
        backgroundColor: 'white',
        zIndex: 1100,
        px: 2,
        py: 1,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label} completed={activeStep > index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default StepperHeader;
