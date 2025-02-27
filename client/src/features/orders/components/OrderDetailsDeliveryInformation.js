import React from 'react';
import { Paper, Typography, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import SelectField from './SelectField';

const OrderDetailsDeliveryInformation = ({
  formData,
  handleChange,
  contacts = [],
  addresses = [],
  formErrors = {} // Añadimos formErrors como prop
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Delivery Information
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            id="contact"
            label="Contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
            options={contacts || []}
            getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
            getOptionValue={(option) => option.id}
            error={formErrors.contact}
            helperText={formErrors.contact && "This field is required"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            id="expected_delivery_date"
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
            id="shipping_address"
            label="Shipping Address"
            name="shipping_address"
            value={formData.shipping_address}
            onChange={handleChange}
            required
            options={addresses || []}
            getOptionLabel={(option) => option.address_line_1}
            getOptionValue={(option) => option.id}
            error={formErrors.shipping_address}
            helperText={formErrors.shipping_address && "This field is required"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            id="billing_address"
            label="Billing Address"
            name="billing_address"
            value={formData.billing_address}
            onChange={handleChange}
            required
            options={addresses || []}
            getOptionLabel={(option) => option.address_line_1}
            getOptionValue={(option) => option.id}
            error={formErrors.billing_address}
            helperText={formErrors.billing_address && "This field is required"}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OrderDetailsDeliveryInformation;