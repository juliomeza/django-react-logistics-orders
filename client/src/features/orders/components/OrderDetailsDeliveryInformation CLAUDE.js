import React, { useEffect, useState } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Autocomplete, 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider,
  Stack
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import apiProtected from '../../../services/api/secureApi'; // Importamos el servicio API protegido

const OrderDetailsDeliveryInformation = ({
  formData,
  handleChange,
  contacts = [],
  addresses = [],
  formErrors = {},
  projectId // Added project ID to connect new contacts to the project
}) => {
  // New state for managing the "Add Contact" dialog
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newContactForm, setNewContactForm] = useState({
    company_name: '',
    contact_name: '',
    attention: '',
    phone: '',
    email: '',
    mobile: '',
    title: '',
    notes: '',
    // Address fields
    shipping_address: {
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      address_type: 'shipping',
      entity_type: 'recipient' // Valor correcto según tu modelo
    },
    billing_address: {
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      address_type: 'billing',
      entity_type: 'recipient' // Valor correcto según tu modelo
    }
  });
  const [useShippingForBilling, setUseShippingForBilling] = useState(false);
  const [newContactErrors, setNewContactErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to get CSRF token from cookies if Django uses CSRF protection
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

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

  // Add "Add new contact" option
  const autocompleteOptions = [
    { id: 'new', label: '+ Add new contact', isAddNew: true },
    ...contactOptions
  ];

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
  const handleContactChange = (event, selectedOption) => {
    if (!selectedOption) {
      // If contact is cleared, reset addresses
      handleChange({ target: { name: 'contact', value: '' } });
      handleChange({ target: { name: 'shipping_address', value: '' } });
      handleChange({ target: { name: 'billing_address', value: '' } });
      return;
    }

    // Check if "Add new contact" option was selected
    if (selectedOption.isAddNew) {
      setOpenAddDialog(true);
      return;
    }

    // Update the contact field
    handleChange({ target: { name: 'contact', value: selectedOption.id } });
    
    // IMPORTANT: Clear any existing addresses first
    handleChange({ target: { name: 'shipping_address', value: '' } });
    handleChange({ target: { name: 'billing_address', value: '' } });
    
    // Find related addresses for this contact
    if (selectedOption.addresses && selectedOption.addresses.length > 0) {
      // Filter addresses that belong to this contact
      const contactAddressList = addresses.filter(addr => 
        selectedOption.addresses.includes(addr.id)
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

  // Handle new contact form changes
  const handleNewContactChange = (e) => {
    const { name, value } = e.target;
    
    // Handle address fields by parsing the name (e.g., "shipping_address.city")
    if (name.includes('.')) {
      const [addressType, field] = name.split('.');
      setNewContactForm(prev => ({
        ...prev,
        [addressType]: {
          ...prev[addressType],
          [field]: value
        }
      }));
    } else {
      // Handle regular fields
      setNewContactForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle checkbox for using shipping address as billing address
  const handleUseShippingForBilling = (e) => {
    const checked = e.target.checked;
    setUseShippingForBilling(checked);
    
    if (checked) {
      // Copy shipping address to billing address
      setNewContactForm(prev => ({
        ...prev,
        billing_address: {
          ...prev.shipping_address,
          address_type: 'billing'
        }
      }));
    }
  };

  // Update billing address when shipping address changes if useShippingForBilling is checked
  useEffect(() => {
    if (useShippingForBilling) {
      setNewContactForm(prev => ({
        ...prev,
        billing_address: {
          ...prev.shipping_address,
          address_type: 'billing'
        }
      }));
    }
  }, [useShippingForBilling, newContactForm.shipping_address]);

  // Validate new contact form
  const validateNewContactForm = () => {
    const errors = {};
    
    // Contact validation
    if (!newContactForm.company_name && !newContactForm.contact_name) {
      errors.contact_info = "Either Company Name or Contact Name is required";
    }
    
    if (!newContactForm.phone) {
      errors.phone = "Phone is required";
    }
    
    // Shipping address validation
    if (!newContactForm.shipping_address.address_line_1) {
      errors['shipping_address.address_line_1'] = "Address Line 1 is required";
    }
    
    if (!newContactForm.shipping_address.city) {
      errors['shipping_address.city'] = "City is required";
    }
    
    if (!newContactForm.shipping_address.state) {
      errors['shipping_address.state'] = "State is required";
    }
    
    if (!newContactForm.shipping_address.postal_code) {
      errors['shipping_address.postal_code'] = "Postal Code is required";
    }
    
    if (!newContactForm.shipping_address.country) {
      errors['shipping_address.country'] = "Country is required";
    }
    
    // Only validate billing address if not using shipping address
    if (!useShippingForBilling) {
      if (!newContactForm.billing_address.address_line_1) {
        errors['billing_address.address_line_1'] = "Address Line 1 is required";
      }
      
      if (!newContactForm.billing_address.city) {
        errors['billing_address.city'] = "City is required";
      }
      
      if (!newContactForm.billing_address.state) {
        errors['billing_address.state'] = "State is required";
      }
      
      if (!newContactForm.billing_address.postal_code) {
        errors['billing_address.postal_code'] = "Postal Code is required";
      }
      
      if (!newContactForm.billing_address.country) {
        errors['billing_address.country'] = "Country is required";
      }
    }
    
    setNewContactErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submission of new contact
  const handleSubmitNewContact = async () => {
    // Validate form first
    if (!validateNewContactForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Step 1: Create shipping address
      const shippingAddressPayload = {
        ...newContactForm.shipping_address,
        entity_type: 'recipient',  // Valor correcto basado en tu modelo
        // Explicitly set all required fields to ensure they have values
        address_line_1: newContactForm.shipping_address.address_line_1 || '',
        address_line_2: newContactForm.shipping_address.address_line_2 || '',
        city: newContactForm.shipping_address.city || '',
        state: newContactForm.shipping_address.state || '',
        postal_code: newContactForm.shipping_address.postal_code || '',
        country: newContactForm.shipping_address.country || '',
        address_type: 'shipping'
      };
      
      // Log the shipping payload specifically to see what we're sending
      console.log('Using entity_type:', shippingAddressPayload.entity_type);
      
      try {
        const shippingAddressResponse = await apiProtected.post('addresses/', shippingAddressPayload);
        const shippingAddressData = shippingAddressResponse.data;
        console.log('Shipping address created:', shippingAddressData);
        
        // Step 2: Create or reuse billing address
        let billingAddressData;
        
        if (useShippingForBilling) {
          // Create a copy of shipping address but mark as billing
          const billingAddressPayload = {
            ...shippingAddressPayload,
            address_type: 'billing'
          };
          
          console.log('Billing address payload (copied from shipping):', billingAddressPayload);
          
          const billingAddressResponse = await apiProtected.post('addresses/', billingAddressPayload);
          billingAddressData = billingAddressResponse.data;
          console.log('Billing address created:', billingAddressData);
        } else {
          // Create separate billing address
          const billingAddressPayload = {
            ...newContactForm.billing_address,
            entity_type: 'recipient',  // Valor correcto basado en tu modelo
            // Explicitly set all required fields to ensure they have values
            address_line_1: newContactForm.billing_address.address_line_1 || '',
            address_line_2: newContactForm.billing_address.address_line_2 || '',
            city: newContactForm.billing_address.city || '',
            state: newContactForm.billing_address.state || '',
            postal_code: newContactForm.billing_address.postal_code || '',
            country: newContactForm.billing_address.country || '',
            address_type: 'billing'
          };
          
          console.log('Billing address payload:', billingAddressPayload);
          
          const billingAddressResponse = await apiProtected.post('addresses/', billingAddressPayload);
          billingAddressData = billingAddressResponse.data;
          console.log('Billing address created:', billingAddressData);
        }
        
        // Step 3: Create the contact with references to both addresses
        const contactPayload = {
          company_name: newContactForm.company_name || '',
          contact_name: newContactForm.contact_name || '',
          attention: newContactForm.attention || '',
          phone: newContactForm.phone || '',
          email: newContactForm.email || '',
          mobile: newContactForm.mobile || '',
          title: newContactForm.title || '',
          notes: newContactForm.notes || '',
          addresses: [shippingAddressData.id, billingAddressData.id]
        };
        
        // If project ID is provided, add it to the contact
        if (projectId) {
          contactPayload.project = projectId;
        }
        
        console.log('Contact payload:', contactPayload);
        
        const contactResponse = await apiProtected.post('contacts/', contactPayload);
        const contactData = contactResponse.data;
        console.log('Contact created:', contactData);
        
        // Paso adicional: Asociar el contacto con el proyecto actual si existe projectId
        if (projectId) {
          try {
            console.log(`Intentando asociar el contacto ${contactData.id} al proyecto ${projectId} mediante el endpoint directo`);
            
            // Método directo: Utilizando el ViewSet de relaciones en DRF
            await apiProtected.post(`projects/${projectId}/add_contact/`, {
              contact_id: contactData.id
            });
            console.log('Contacto añadido al proyecto correctamente');
          } catch (error) {
            console.error('Error al asociar contacto con proyecto:', error);
            
            // Implementemos un endpoint específico en el backend para esta operación
            const projectPatchData = {
              action: "add_contact",
              contact_id: contactData.id,
              project_id: projectId
            };
            
            try {
              // Intentar con un endpoint auxiliar para relaciones
              await apiProtected.post('project-contact-relationships/', projectPatchData);
              console.log('Contacto añadido al proyecto usando endpoint de relaciones');
            } catch (relationError) {
              console.error('Error con endpoint de relaciones:', relationError);
              
              // Último intento: modificar manualmente la tabla de relaciones
              alert(`
              ⚠️ Se creó el contacto correctamente, pero no se pudo asociar automáticamente al proyecto.
              
              Por favor, sigue estos pasos para asociarlo manualmente:
              1. Ve a Django Admin
              2. Abre el proyecto #${projectId}
              3. En la sección "Contacts", añade el contacto "${contactData.company_name || contactData.contact_name}" (ID: ${contactData.id})
              
              Alternativamente, puedes pedirle al desarrollador que implemente el siguiente endpoint:
              POST /api/projects/{projectId}/add_contact/
              con body: { "contact_id": contactId }
              `);
            }
          }
        }
        
        // Step 4: Update the form with the new contact and addresses
        handleChange({ target: { name: 'contact', value: contactData.id } });
        handleChange({ target: { name: 'shipping_address', value: shippingAddressData.id } });
        handleChange({ target: { name: 'billing_address', value: billingAddressData.id } });
        
        // Close dialog and reset form
        setOpenAddDialog(false);
        resetNewContactForm();
        
        // Show success message
        alert('Contact created successfully!');
      } catch (addressError) {
        console.error('Error creating address:', addressError);
        
        // Mostrar información detallada del error para depuración
        if (addressError.response) {
          console.error('Error response data:', addressError.response.data);
          console.error('Error response status:', addressError.response.status);
          console.error('Error response headers:', addressError.response.headers);
        }
        
        throw addressError; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      console.error('Error creating new contact:', error);
      let errorMessage = 'Error creating new contact';
      
      // Extract error details if available
      if (error.response && error.response.data) {
        console.error('Error response data:', error.response.data);
        
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (typeof error.response.data === 'object') {
          // Format error object into readable string
          const errorDetails = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          
          errorMessage = `${errorMessage}: ${errorDetails}`;
        }
      }
      
      // Show error message to user
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetNewContactForm = () => {
    setNewContactForm({
      company_name: '',
      contact_name: '',
      attention: '',
      phone: '',
      email: '',
      mobile: '',
      title: '',
      notes: '',
      shipping_address: {
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        address_type: 'shipping',
        entity_type: 'contact'
      },
      billing_address: {
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        address_type: 'billing',
        entity_type: 'contact'
      }
    });
    setUseShippingForBilling(false);
    setNewContactErrors({});
  };

  return (
    <>
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
              options={autocompleteOptions}
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
              renderOption={(props, option) => {
                // Extract key from props to avoid React warning
                const { key, ...otherProps } = props;
                
                // Custom rendering for the "Add new contact" option
                if (option.isAddNew) {
                  return (
                    <li key={key} {...otherProps} style={{ fontWeight: 'bold', color: '#1976d2' }}>
                      <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                      {option.label}
                    </li>
                  );
                }
                return <li key={key} {...otherProps}>{option.label}</li>;
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

      {/* Add New Contact Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Contact</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Contact Information */}
            <Grid xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Contact Information
              </Typography>
            </Grid>
            
            <Grid xs={12} md={6}>
              <TextField
                label="Company Name *"
                name="company_name"
                value={newContactForm.company_name}
                onChange={handleNewContactChange}
                fullWidth
                error={!!newContactErrors.contact_info && !newContactForm.company_name && !newContactForm.contact_name}
                helperText={newContactErrors.contact_info && !newContactForm.company_name && !newContactForm.contact_name ? newContactErrors.contact_info : ""}
                margin="normal"
              />
            </Grid>
            
            <Grid xs={12} md={6}>
              <TextField
                label="Contact Name *"
                name="contact_name"
                value={newContactForm.contact_name}
                onChange={handleNewContactChange}
                fullWidth
                error={!!newContactErrors.contact_info && !newContactForm.company_name && !newContactForm.contact_name}
                margin="normal"
              />
            </Grid>
            
            <Grid xs={12} md={6}>
              <TextField
                label="Phone *"
                name="phone"
                value={newContactForm.phone}
                onChange={handleNewContactChange}
                fullWidth
                error={!!newContactErrors.phone}
                helperText={newContactErrors.phone}
                margin="normal"
              />
            </Grid>
            
            <Grid xs={12} md={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={newContactForm.email}
                onChange={handleNewContactChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            
            <Grid xs={12} md={6}>
              <TextField
                label="Mobile"
                name="mobile"
                value={newContactForm.mobile}
                onChange={handleNewContactChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            
            <Grid xs={12} md={6}>
              <TextField
                label="Title"
                name="title"
                value={newContactForm.title}
                onChange={handleNewContactChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            
            <Grid xs={12}>
              <TextField
                label="Attention"
                name="attention"
                value={newContactForm.attention}
                onChange={handleNewContactChange}
                fullWidth
                margin="normal"
              />
            </Grid>

            <Grid xs={12}>
              <Divider sx={{ my: 2 }} />
              
              {/* Shipping Address */}
              <Typography variant="subtitle2" gutterBottom>
                Shipping Address
              </Typography>
            </Grid>
            
            <Grid xs={12}>
              <TextField
                label="Address Line 1 *"
                name="shipping_address.address_line_1"
                value={newContactForm.shipping_address.address_line_1}
                onChange={handleNewContactChange}
                fullWidth
                error={!!newContactErrors['shipping_address.address_line_1']}
                helperText={newContactErrors['shipping_address.address_line_1']}
                margin="normal"
              />
            </Grid>
            
            <Grid xs={12}>
              <TextField
                label="Address Line 2"
                name="shipping_address.address_line_2"
                value={newContactForm.shipping_address.address_line_2}
                onChange={handleNewContactChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            
            <Grid xs={12} md={4}>
              <TextField
                label="City *"
                name="shipping_address.city"
                value={newContactForm.shipping_address.city}
                onChange={handleNewContactChange}
                fullWidth
                error={!!newContactErrors['shipping_address.city']}
                helperText={newContactErrors['shipping_address.city']}
                margin="normal"
              />
            </Grid>
            
            <Grid xs={12} md={4}>
              <TextField
                label="State *"
                name="shipping_address.state"
                value={newContactForm.shipping_address.state}
                onChange={handleNewContactChange}
                fullWidth
                error={!!newContactErrors['shipping_address.state']}
                helperText={newContactErrors['shipping_address.state']}
                margin="normal"
              />
            </Grid>
            
            <Grid xs={12} md={4}>
              <TextField
                label="Postal Code *"
                name="shipping_address.postal_code"
                value={newContactForm.shipping_address.postal_code}
                onChange={handleNewContactChange}
                fullWidth
                error={!!newContactErrors['shipping_address.postal_code']}
                helperText={newContactErrors['shipping_address.postal_code']}
                margin="normal"
              />
            </Grid>
            
            <Grid xs={12}>
              <TextField
                label="Country *"
                name="shipping_address.country"
                value={newContactForm.shipping_address.country}
                onChange={handleNewContactChange}
                fullWidth
                error={!!newContactErrors['shipping_address.country']}
                helperText={newContactErrors['shipping_address.country']}
                margin="normal"
              />
            </Grid>

            <Grid xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={useShippingForBilling}
                    onChange={handleUseShippingForBilling}
                  />
                }
                label="Use shipping address as billing address"
              />
            </Grid>

            {/* Billing Address - only show if not using shipping address */}
            {!useShippingForBilling && (
              <>
                <Grid xs={12}>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Billing Address
                  </Typography>
                </Grid>
                
                <Grid xs={12}>
                  <TextField
                    label="Address Line 1 *"
                    name="billing_address.address_line_1"
                    value={newContactForm.billing_address.address_line_1}
                    onChange={handleNewContactChange}
                    fullWidth
                    error={!!newContactErrors['billing_address.address_line_1']}
                    helperText={newContactErrors['billing_address.address_line_1']}
                    margin="normal"
                  />
                </Grid>
                
                <Grid xs={12}>
                  <TextField
                    label="Address Line 2"
                    name="billing_address.address_line_2"
                    value={newContactForm.billing_address.address_line_2}
                    onChange={handleNewContactChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                
                <Grid xs={12} md={4}>
                  <TextField
                    label="City *"
                    name="billing_address.city"
                    value={newContactForm.billing_address.city}
                    onChange={handleNewContactChange}
                    fullWidth
                    error={!!newContactErrors['billing_address.city']}
                    helperText={newContactErrors['billing_address.city']}
                    margin="normal"
                  />
                </Grid>
                
                <Grid xs={12} md={4}>
                  <TextField
                    label="State *"
                    name="billing_address.state"
                    value={newContactForm.billing_address.state}
                    onChange={handleNewContactChange}
                    fullWidth
                    error={!!newContactErrors['billing_address.state']}
                    helperText={newContactErrors['billing_address.state']}
                    margin="normal"
                  />
                </Grid>
                
                <Grid xs={12} md={4}>
                  <TextField
                    label="Postal Code *"
                    name="billing_address.postal_code"
                    value={newContactForm.billing_address.postal_code}
                    onChange={handleNewContactChange}
                    fullWidth
                    error={!!newContactErrors['billing_address.postal_code']}
                    helperText={newContactErrors['billing_address.postal_code']}
                    margin="normal"
                  />
                </Grid>
                
                <Grid xs={12}>
                  <TextField
                    label="Country *"
                    name="billing_address.country"
                    value={newContactForm.billing_address.country}
                    onChange={handleNewContactChange}
                    fullWidth
                    error={!!newContactErrors['billing_address.country']}
                    helperText={newContactErrors['billing_address.country']}
                    margin="normal"
                  />
                </Grid>
              </>
            )}
            
            <Grid xs={12}>
              <TextField
                label="Notes"
                name="notes"
                value={newContactForm.notes}
                onChange={handleNewContactChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenAddDialog(false);
              resetNewContactForm();
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitNewContact} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Contact'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderDetailsDeliveryInformation;