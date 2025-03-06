import React from 'react';
import { Paper, Typography, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import SelectField from '../SelectField';

const BasicOrderInfoStep = ({
  formData,
  handleChange,
  orderTypes = [],
  orderClasses = [],
  formErrors = {}
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Basic Order Information
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
            error={formErrors.order_type}
            helperText={formErrors.order_type && "This field is required"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            id="reference_number"
            label="Reference Number"
            name="reference_number"
            value={formData.reference_number}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            id="lookup_code_order"
            label="Order Number"
            name="lookup_code_order"
            value={formData.lookup_code_order || 'Will be generated on Next'}
            disabled
            fullWidth
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BasicOrderInfoStep;