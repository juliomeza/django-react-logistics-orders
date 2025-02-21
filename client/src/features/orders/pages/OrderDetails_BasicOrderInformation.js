import React from 'react';
import { Paper, Typography, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import SelectField from '../components/SelectField';

const OrderDetails_BasicOrderInformation = ({
  formData,
  handleChange,
  orderTypes = [],
  orderClasses = []
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Basic Order Information
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            label="Order Type"
            name="order_type"
            value={formData.order_type}
            onChange={handleChange}
            required
            options={orderTypes || []}
            getOptionLabel={(option) => option.type_name}
            getOptionValue={(option) => option.id}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            label="Order Class"
            name="order_class"
            value={formData.order_class}
            onChange={handleChange}
            required
            options={orderClasses || []}
            getOptionLabel={(option) => option.class_name}
            getOptionValue={(option) => option.id}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Lookup Code Order"
            name="lookup_code_order"
            value={formData.lookup_code_order}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Lookup Code Shipment"
            name="lookup_code_shipment"
            value={formData.lookup_code_shipment}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OrderDetails_BasicOrderInformation;
