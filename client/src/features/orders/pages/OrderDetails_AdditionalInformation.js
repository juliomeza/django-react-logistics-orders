import React from 'react';
import { Paper, Typography, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';

const OrderDetails_AdditionalInformation = ({ formData, handleChange }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Additional Information
      </Typography>
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={2}
            fullWidth
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OrderDetails_AdditionalInformation;
