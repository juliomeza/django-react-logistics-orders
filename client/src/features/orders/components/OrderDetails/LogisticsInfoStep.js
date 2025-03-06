import React from 'react';
import { Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import SelectField from '../SelectField';

const LogisticsInfoStep = ({
  formData,
  handleChange,
  warehouses = [],
  projects = [],
  carriers = [],
  carrierServices = [],
  formErrors = {},
  isOrderLocked = false,
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Logistics Information
      </Typography>
      <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectField
            id="project"
            label="Project"
            name="project"
            value={formData.project || ''}
            onChange={handleChange}
            required
            options={projects || []}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.id}
            error={formErrors.project}
            helperText={formErrors.project && "This field is required"}
            disabled={isOrderLocked}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectField
            id="warehouse"
            label="Warehouse"
            name="warehouse"
            value={formData.warehouse || ''}
            onChange={handleChange}
            required
            options={warehouses || []}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.id}
            error={formErrors.warehouse}
            helperText={formErrors.warehouse && "This field is required"}
            disabled={isOrderLocked}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectField
            id="carrier"
            label="Carrier"
            name="carrier"
            value={formData.carrier || ''}
            onChange={handleChange}
            options={carriers || []}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.id}
            disabled={false}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectField
            id="service_type"
            label="Service Type"
            name="service_type"
            value={formData.service_type || ''}
            onChange={handleChange}
            options={carrierServices || []}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.id}
            disabled={false}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LogisticsInfoStep;