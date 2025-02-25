import React from 'react';
import { Paper, Typography, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import SelectField from '../SelectField';

const OrderDetailsBasicOrderInformation = ({
  formData,
  handleChange,
  orderTypes = [],
  orderClasses = [],
  formErrors = {} // Añadimos formErrors como prop
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Basic Order Information
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            id="order_type"
            label="Order Type"
            name="order_type"
            value={formData.order_type}
            onChange={handleChange}
            required
            options={orderTypes || []}
            getOptionLabel={(option) => option.type_name}
            getOptionValue={(option) => option.id}
            error={formErrors.order_type} // Indicamos error si existe
            helperText={formErrors.order_type && "This field is required"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            id="order_class"
            label="Order Class"
            name="order_class"
            value={formData.order_class}
            onChange={handleChange}
            required
            options={orderClasses || []}
            getOptionLabel={(option) => option.class_name}
            getOptionValue={(option) => option.id}
            error={formErrors.order_class}
            helperText={formErrors.order_class && "This field is required"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            id="lookup_code_order"
            label="Lookup Code Order"
            name="lookup_code_order"
            value={formData.lookup_code_order}
            onChange={handleChange}
            fullWidth
            required
            error={formErrors.lookup_code_order}
            helperText={formErrors.lookup_code_order && "This field is required"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            id="lookup_code_shipment"
            label="Lookup Code Shipment"
            name="lookup_code_shipment"
            value={formData.lookup_code_shipment}
            onChange={handleChange}
            fullWidth
            required
            error={formErrors.lookup_code_shipment}
            helperText={formErrors.lookup_code_shipment && "This field is required"}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OrderDetailsBasicOrderInformation;