import React, { useEffect } from 'react';
import { Paper, Typography, TextField, Autocomplete, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';

const OrderDetailsDeliveryInformation = ({
  formData,
  handleChange,
  contacts = [],
  addresses = [],
  formErrors = {}
}) => {
  // Format date value for date input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // If it's a full ISO string, extract just the date part
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // Invalid date
      
      return date.toISOString().split('T')[0]; // Get YYYY-MM-DD part only
    } catch (e) {
      console.error("Error formatting date:", e);
      return '';
    }
  };

  // Format contact options to show either Company Name or Contact Name with City from shipping address only
  const contactOptions = contacts.map(contact => {
    // Find only shipping address for this contact to extract city
    const shippingAddress = addresses.find(addr => 
      contact.addresses && 
      contact.addresses.includes(addr.id) && 
      addr.address_type === 'shipping'
    );
    
    const city = shippingAddress ? shippingAddress.city : '';
    const displayName = contact.company_name || contact.contact_name;
    
    return {
      ...contact,
      label: city ? `${displayName} - ${city}` : displayName
    };
  });

  // Find the selected contact object by ID
  const selectedContactId = formData.contact;
  const selectedContact = selectedContactId 
    ? contactOptions.find(c => c.id === selectedContactId) || null
    : null;

  // Find the selected shipping and billing addresses
  const selectedShippingAddress = formData.shipping_address 
    ? addresses.find(a => a.id === formData.shipping_address) 
    : null;
    
  const selectedBillingAddress = formData.billing_address 
    ? addresses.find(a => a.id === formData.billing_address) 
    : null;

  // Handle selecting a contact - auto-populate addresses
  const handleContactChange = (event, selectedContact) => {
    if (!selectedContact) {
      // If contact is cleared, reset addresses
      handleChange({ target: { name: 'contact', value: '' } });
      handleChange({ target: { name: 'shipping_address', value: '' } });
      handleChange({ target: { name: 'billing_address', value: '' } });
      return;
    }

    // Update the contact field
    handleChange({ target: { name: 'contact', value: selectedContact.id } });
    
    // IMPORTANT: Clear any existing addresses first
    handleChange({ target: { name: 'shipping_address', value: '' } });
    handleChange({ target: { name: 'billing_address', value: '' } });
    
    // Find related addresses for this contact
    if (selectedContact.addresses && selectedContact.addresses.length > 0) {
      // Filter addresses that belong to this contact
      const contactAddressList = addresses.filter(addr => 
        selectedContact.addresses.includes(addr.id)
      );
      
      // Find shipping and billing addresses
      const shippingAddr = contactAddressList.find(addr => addr.address_type === 'shipping');
      const billingAddr = contactAddressList.find(addr => addr.address_type === 'billing');
      
      // Set shipping address if found
      if (shippingAddr) {
        handleChange({ target: { name: 'shipping_address', value: shippingAddr.id } });
      }
      
      // Set billing address if found
      if (billingAddr) {
        handleChange({ target: { name: 'billing_address', value: billingAddr.id } });
      }
    }
  };

  // Format address for display with line breaks
  const formatAddress = (address) => {
    if (!address) return "No address selected";
    
    return (
      <>
        {address.address_line_1}<br />
        {address.address_line_2 && <>{address.address_line_2}<br /></>}
        {address.city}, {address.state} {address.postal_code}<br />
        {address.country}
      </>
    );
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Delivery Information
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            id="expected_delivery_date"
            label="Expected Delivery Date"
            name="expected_delivery_date"
            type="date"
            value={formatDateForInput(formData.expected_delivery_date)}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            id="contact"
            options={contactOptions}
            value={selectedContact}
            onChange={handleContactChange}
            getOptionLabel={(option) => option?.label || ''}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Company or Contact *"
                error={!!formErrors.contact}
                helperText={formErrors.contact && "This field is required"}
                fullWidth
              />
            )}
            isOptionEqualToValue={(option, value) => {
              // Strong strict comparison for contact IDs
              if (!option || !value) return false;
              return String(option.id) === String(value.id);
            }}
          />
        </Grid>

        {/* Shipping address display */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            border: '1px solid #e0e0e0', 
            borderRadius: 1, 
            p: 1,
            backgroundColor: '#f5f5f5', // Light gray background to indicate locked
            opacity: 0.9            // Slightly reduce opacity
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Shipping Address *
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                flexGrow: 1,
                color: formErrors.shipping_address ? 'error.main' : 'text.secondary', // Darker text color for "locked" appearance
              }}
            >
              {selectedShippingAddress ? formatAddress(selectedShippingAddress) : "No address selected"}
            </Typography>
            {formErrors.shipping_address && (
              <Typography variant="caption" color="error">
                This field is required
              </Typography>
            )}
          </Box>
        </Grid>
        
        {/* Billing address display */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            border: '1px solid #e0e0e0', 
            borderRadius: 1, 
            p: 1,
            backgroundColor: '#f5f5f5', // Light gray background to indicate locked
            opacity: 0.9            // Slightly reduce opacity
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Billing Address *
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                flexGrow: 1,
                color: formErrors.billing_address ? 'error.main' : 'text.secondary', // Darker text color for "locked" appearance
              }}
            >
              {selectedBillingAddress ? formatAddress(selectedBillingAddress) : "No address selected"}
            </Typography>
            {formErrors.billing_address && (
              <Typography variant="caption" color="error">
                This field is required
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OrderDetailsDeliveryInformation;