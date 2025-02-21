import React from 'react';
import { Paper, Typography, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import SelectField from '../components/SelectField';

const OrderDetails_DeliveryInformation = ({ formData, handleChange, contacts = [], addresses = [] }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Delivery Information
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            label="Contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
            options={contacts || []}
            getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
            getOptionValue={(option) => option.id}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Expected Delivery Date"
            name="expected_delivery_date"
            type="date"
            value={formData.expected_delivery_date}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            label="Shipping Address"
            name="shipping_address"
            value={formData.shipping_address}
            onChange={handleChange}
            required
            options={addresses || []}
            getOptionLabel={(option) => option.address_line_1}
            getOptionValue={(option) => option.id}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            label="Billing Address"
            name="billing_address"
            value={formData.billing_address}
            onChange={handleChange}
            required
            options={addresses || []}
            getOptionLabel={(option) => option.address_line_1}
            getOptionValue={(option) => option.id}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OrderDetails_DeliveryInformation;
