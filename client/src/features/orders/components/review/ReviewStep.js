import React from 'react';
import { 
  Paper, 
  Typography, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

const ReviewStep = ({ 
  formData,
  orderTypes = [],
  orderClasses = [],
  warehouses = [],
  projects = [],
  carriers = [],
  carrierServices = [],
  contacts = [],
  addresses = [],
  materials = []
}) => {
  
  // Helper functions to get names from IDs
  const getOrderTypeName = id => {
    const item = orderTypes.find(item => item.id === id);
    return item ? item.type_name : 'Unknown';
  };

  const getOrderClassName = id => {
    const item = orderClasses.find(item => item.id === id);
    return item ? item.class_name : 'Unknown';
  };

  const getWarehouseName = id => {
    const item = warehouses.find(item => item.id === id);
    return item ? item.name : 'Unknown';
  };

  const getProjectName = id => {
    const item = projects.find(item => item.id === id);
    return item ? item.name : 'Unknown';
  };

  const getCarrierName = id => {
    const item = carriers.find(item => item.id === id);
    return item ? item.name : 'Unknown';
  };

  const getServiceName = id => {
    const item = carrierServices.find(item => item.id === id);
    return item ? item.name : 'Unknown';
  };

  const getContactName = id => {
    const item = contacts.find(item => item.id === id);
    return item ? `${item.first_name} ${item.last_name}` : 'Unknown';
  };

  const getAddressLine = id => {
    const item = addresses.find(item => item.id === id);
    return item ? item.address_line_1 : 'Unknown';
  };

  const getMaterialName = id => {
    const item = materials.find(item => item.id === id);
    return item ? item.name : 'Unknown';
  };

  // Check if materials are selected
  const hasMaterials = formData.selectedInventories && formData.selectedInventories.length > 0;

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Order Summary
        </Typography>
        
        <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
          Basic Order Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Order Type</Typography>
            <Typography variant="body1">{getOrderTypeName(formData.order_type)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Order Class</Typography>
            <Typography variant="body1">{getOrderClassName(formData.order_class)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Lookup Code Order</Typography>
            <Typography variant="body1">{formData.lookup_code_order}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Lookup Code Shipment</Typography>
            <Typography variant="body1">{formData.lookup_code_shipment}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Logistics Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Warehouse</Typography>
            <Typography variant="body1">{getWarehouseName(formData.warehouse)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Project</Typography>
            <Typography variant="body1">{getProjectName(formData.project)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Carrier</Typography>
            <Typography variant="body1">
              {formData.carrier ? getCarrierName(formData.carrier) : 'Not specified'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Service Type</Typography>
            <Typography variant="body1">
              {formData.service_type ? getServiceName(formData.service_type) : 'Not specified'}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Delivery Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">Contact</Typography>
            <Typography variant="body1">{getContactName(formData.contact)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">Expected Delivery Date</Typography>
            <Typography variant="body1">
              {formData.expected_delivery_date || 'Not specified'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">Shipping Address</Typography>
            <Typography variant="body1">{getAddressLine(formData.shipping_address)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">Billing Address</Typography>
            <Typography variant="body1">{getAddressLine(formData.billing_address)}</Typography>
          </Grid>
        </Grid>

        {formData.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Additional Information
            </Typography>
            <Typography variant="body2" color="text.secondary">Notes</Typography>
            <Typography variant="body1">{formData.notes}</Typography>
          </>
        )}
      </Paper>

      {hasMaterials ? (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Selected Materials
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Material</TableCell>
                  <TableCell>License Plate</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.selectedInventories.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{getMaterialName(item.material)}</TableCell>
                    <TableCell>{item.license_plate}</TableCell>
                    <TableCell>{item.location || 'Not specified'}</TableCell>
                    <TableCell align="right">{item.orderQuantity || 1}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" color="error" sx={{ mb: 1 }}>
            No Materials Selected
          </Typography>
          <Typography variant="body1">
            Please go back to the Materials step and select at least one material for this order.
          </Typography>
        </Paper>
      )}
    </>
  );
};

export default ReviewStep;