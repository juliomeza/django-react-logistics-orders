import React from 'react';
import { Box, Button } from '@mui/material';

const OrderStepActions = ({ 
  currentStep, 
  totalSteps, 
  onBack, 
  onNext, 
  onSave, 
  onSubmit, 
  disableSubmit, 
  disableSave 
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
      <Button variant="outlined" onClick={onBack} disabled={currentStep === 0}>
        Back
      </Button>
      <Box>
        {currentStep === 1 && (
          <Button
            variant="outlined"
            onClick={onSave}
            sx={{ mr: 2 }}
            disabled={disableSave}
          >
            Save
          </Button>
        )}
        {currentStep < totalSteps - 1 ? (
          <Button variant="contained" onClick={onNext}>
            Next
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            variant="contained"
            color="primary"
            disabled={disableSubmit}
          >
            Submit Order
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default OrderStepActions;