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

/**
 * A reusable component to display order summary information
 * Used in both OrderView and ReviewStep components
 * 
 * @param {Object} orderData - The order data to display
 * @param {Object} referenceData - Object containing reference data collections (orderTypes, warehouses, etc.)
 * @param {Array} materials - List of available materials
 * @param {Array} materialItems - List of materials associated with this order
 * @param {Boolean} isReviewMode - Whether this component is used in review mode (affects empty states)
 */
const OrderSummary = ({ 
  orderData,
  referenceData,
  materials = [],
  materialItems = [],
  isReviewMode = false
}) => {
  
  // Helper function to display empty values
  const displayValue = (value) => {
    if (!value && value !== 0) {
      return <span style={{ color: 'rgba(0, 0, 0, 0.6)', fontStyle: 'italic' }}>Not specified</span>;
    }
    return value;
  };
  
  // Helper functions to get names from IDs
  const getOrderTypeName = (id) => {
    const item = referenceData.orderTypes?.find(item => item.id === id);
    return item ? item.type_name : 'Unknown';
  };

  const getOrderClassName = (id) => {
    const item = referenceData.orderClasses?.find(item => item.id === id);
    return item ? item.class_name : 'Unknown';
  };

  const getWarehouseName = (id) => {
    const item = referenceData.warehouses?.find(item => item.id === id);
    return item ? item.name : 'Unknown';
  };

  const getProjectName = (id) => {
    const item = referenceData.projects?.find(item => item.id === id);
    return item ? item.name : 'Unknown';
  };

  const getCarrierName = (id) => {
    const item = referenceData.carriers?.find(item => item.id === id);
    return item ? item.name : 'Unknown';
  };

  const getServiceName = (id) => {
    const item = referenceData.carrierServices?.find(item => item.id === id);
    return item ? item.name : 'Unknown';
  };

  const getContactName = (id) => {
    const item = referenceData.contacts?.find(item => item.id === id);
    if (!item) return <Typography variant="body1">Unknown</Typography>;
  
    const parts = [];
  
    if (item.company_name) {
      parts.push(
        <Typography key="company" variant="body1" component="span">
          {item.company_name}
        </Typography>
      );
    }
  
    if (item.contact_name) {
      if (parts.length > 0) {
        parts.push(
          <Typography key="contact" variant="body1" component="span" sx={{ display: 'block' }}>
            {item.contact_name}
          </Typography>
        );
      } else {
        parts.push(
          <Typography key="contact" variant="body1" component="span">
            {item.contact_name}
          </Typography>
        );
      }
    }
  
    if (item.attention) {
      parts.push(
        <Typography key="attention" variant="body2" component="span" color="text.secondary" sx={{ display: 'block' }}>
          Attn: {item.attention}
        </Typography>
      );
    }
  
    if (parts.length === 0) {
      return <Typography variant="body1" style={{ color: 'rgba(0, 0, 0, 0.6)', fontStyle: 'italic' }}>Not specified</Typography>;
    }
  
    return parts;
  };

  const getAddressLine = (id) => {
    const item = referenceData.addresses?.find(item => item.id === id);
    if (!item) return 'Unknown';
    
    const parts = [];
    
    if (item.address_line_1) parts.push(item.address_line_1);
    if (item.address_line_2) parts.push(item.address_line_2);
    
    const cityStateZip = [];
    if (item.city) cityStateZip.push(item.city);
    if (item.state) cityStateZip.push(item.state);
    if (item.postal_code) cityStateZip.push(item.postal_code);
    
    if (cityStateZip.length > 0) {
      parts.push(cityStateZip.join(', '));
    }
    
    if (item.country) parts.push(item.country);
    
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < parts.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const getMaterialName = (id) => {
    const item = materials?.find(item => item.id === id);
    return item ? item.name : 'Unknown';
  };

  // Check if materials are selected
  const hasMaterials = materialItems && materialItems.length > 0;

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
            <Typography variant="body1">{getOrderTypeName(orderData.order_type)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Order Class</Typography>
            <Typography variant="body1">{getOrderClassName(orderData.order_class)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Order Number</Typography>
            <Typography variant="body1" className="order-number">
              {orderData.lookup_code_order}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Reference Number</Typography>
            <Typography variant="body1">
              {displayValue(orderData.reference_number)}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Logistics Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Warehouse</Typography>
            <Typography variant="body1">{getWarehouseName(orderData.warehouse)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Project</Typography>
            <Typography variant="body1">{getProjectName(orderData.project)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Carrier</Typography>
            <Typography variant="body1">
              {orderData.carrier ? getCarrierName(orderData.carrier) : displayValue()}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Service Type</Typography>
            <Typography variant="body1">
              {orderData.service_type ? getServiceName(orderData.service_type) : displayValue()}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Delivery Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">Customer</Typography>
            <Typography variant="body1">{getContactName(orderData.contact)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">Expected Delivery Date</Typography>
            <Typography variant="body1">
              {displayValue(orderData.expected_delivery_date)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">Shipping Address</Typography>
            <Typography variant="body1">{getAddressLine(orderData.shipping_address)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">Billing Address</Typography>
            <Typography variant="body1">{getAddressLine(orderData.billing_address)}</Typography>
          </Grid>
        </Grid>

        {orderData.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Additional Information
            </Typography>
            <Typography variant="body2" color="text.secondary">Notes</Typography>
            <Typography variant="body1">{orderData.notes}</Typography>
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
                  <TableCell>Lot</TableCell>
                  <TableCell>License Plate</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materialItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{getMaterialName(item.material)}</TableCell>
                    <TableCell>{displayValue(item.lot)}</TableCell>
                    <TableCell>{displayValue(item.license_plate)}</TableCell>
                    <TableCell align="right">
                      {isReviewMode ? (item.orderQuantity || 1) : (item.quantity || 1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" color={isReviewMode ? "error" : "text.primary"} sx={{ mb: 1 }}>
            No Materials Selected
          </Typography>
          <Typography variant="body1">
            {isReviewMode 
              ? "Please go back to the Materials step and select at least one material for this order."
              : "This order does not have any materials associated with it."}
          </Typography>
        </Paper>
      )}
    </>
  );
};

export default OrderSummary;