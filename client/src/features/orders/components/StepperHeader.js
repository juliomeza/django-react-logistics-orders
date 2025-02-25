import React from 'react';
import { Box, Stepper, Step, StepLabel, Container } from '@mui/material';

const StepperHeader = ({ activeStep, steps }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 64,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        zIndex: 1100,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ px: 2, py: 1 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label} completed={activeStep > index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Container>
    </Box>
  );
};

export default StepperHeader;