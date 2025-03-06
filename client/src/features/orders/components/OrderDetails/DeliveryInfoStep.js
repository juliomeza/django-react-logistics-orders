import React, { useState } from 'react';
import { Paper, Typography, TextField, Autocomplete, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Grid from '@mui/material/Grid2';
import apiProtected from '../../../../services/api/secureApi';
import { formatDateForInput, formatAddress, buildContactOptions, createCustomFilterOptions } from '../../utils/DeliveryInfoUtils';
import ContactFormModal from '../Contacts/ContactFormModal';

// Componente de diálogo de advertencia
const ProjectWarningDialog = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="project-required-dialog-title"
    >
      <DialogTitle id="project-required-dialog-title">
        Project Required
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="text.secondary">
          Please select a Project in the "Logistics Information" section before adding a new contact.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          color="primary"
        >
          CANCEL
        </Button>
        <Button 
          onClick={onClose} 
          color="primary" 
          variant="contained"
          autoFocus
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DeliveryInfoStep = ({
  formData,
  handleChange,
  contacts = [],
  addresses = [],
  formErrors = {},
  projects = [],
  user,
  isOrderLocked,
  refetchReferenceData,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [openWarningDialog, setOpenWarningDialog] = useState(false);
  const [newContact, setNewContact] = useState({
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
      entity_type: 'recipient',
      address_type: 'shipping',
    },
    billing_address: {
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      entity_type: 'recipient',
      address_type: 'billing',
    },
  });
  const [sameBillingAddress, setSameBillingAddress] = useState(true);
  const [modalErrors, setModalErrors] = useState({});

  const contactOptions = buildContactOptions(contacts, addresses);
  const customFilterOptions = createCustomFilterOptions();

  const selectedContact = formData.contact
    ? contactOptions.find((c) => c.id === formData.contact) || null
    : null;

  const selectedShippingAddress = formData.shipping_address
    ? addresses.find((a) => a.id === formData.shipping_address)
    : null;

  const selectedBillingAddress = formData.billing_address
    ? addresses.find((a) => a.id === formData.billing_address)
    : null;

  const handleContactChange = (event, selectedOption) => {
    // Si se selecciona la opción "Add New Contact"
    if (selectedOption && selectedOption.isAddOption) {
      handleOpenModal();
      return;
    }
    
    if (!selectedOption) {
      handleChange({ target: { name: 'contact', value: '' } });
      handleChange({ target: { name: 'shipping_address', value: '' } });
      handleChange({ target: { name: 'billing_address', value: '' } });
      return;
    }

    handleChange({ target: { name: 'contact', value: selectedOption.id } });
    handleChange({ target: { name: 'shipping_address', value: '' } });
    handleChange({ target: { name: 'billing_address', value: '' } });

    if (selectedOption.addresses?.length > 0) {
      const contactAddressList = addresses.filter((addr) =>
        selectedOption.addresses.includes(addr.id)
      );
      const shippingAddr = contactAddressList.find((addr) => addr.address_type === 'shipping');
      const billingAddr = contactAddressList.find((addr) => addr.address_type === 'billing');
      if (shippingAddr) handleChange({ target: { name: 'shipping_address', value: shippingAddr.id } });
      if (billingAddr) handleChange({ target: { name: 'billing_address', value: billingAddr.id } });
    }
  };

  const handleNewContactChange = (e, addressType = null) => {
    const { name, value } = e.target;
    if (addressType) {
      setNewContact((prev) => ({
        ...prev,
        [addressType]: { ...prev[addressType], [name]: value },
      }));

      // Si se cambió shipping_address y el checkbox de misma dirección está marcado,
      // actualizar también billing_address
      if (addressType === 'shipping_address' && sameBillingAddress) {
        setNewContact((prev) => ({
          ...prev,
          billing_address: { ...prev.billing_address, [name]: value },
        }));
      }
    } else {
      setNewContact((prev) => ({ ...prev, [name]: value }));
    }
    setModalErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleSameAddressChange = (e) => {
    const checked = e.target.checked;
    setSameBillingAddress(checked);
    
    if (checked) {
      // Si se marca el checkbox, copiar todos los campos de shipping a billing
      setNewContact((prev) => ({
        ...prev,
        billing_address: {
          ...prev.shipping_address,
          address_type: 'billing',
        },
      }));
    } else {
      // Si se desmarca el checkbox, resetear los campos de billing
      setNewContact((prev) => ({
        ...prev,
        billing_address: {
          address_line_1: '',
          address_line_2: '',
          city: '',
          state: '',
          postal_code: '',
          country: '',
          entity_type: 'recipient',
          address_type: 'billing',
        },
      }));
    }
  };

  const validateForm = () => {
    let errors = {};
    if (!newContact.company_name) errors.company_name = true;
    if (!newContact.contact_name) errors.contact_name = true;
    if (!newContact.phone) errors.phone = true;
    
    // Validar shipping_address
    const shipping = newContact.shipping_address;
    if (!shipping.address_line_1) errors.shipping_address_address_line_1 = true;
    if (!shipping.city) errors.shipping_address_city = true;
    if (!shipping.state) errors.shipping_address_state = true;
    if (!shipping.postal_code) errors.shipping_address_postal_code = true;
    if (!shipping.country) errors.shipping_address_country = true;
    
    // Validar billing_address solo si no es la misma que shipping
    if (!sameBillingAddress) {
      const billing = newContact.billing_address;
      if (!billing.address_line_1) errors.billing_address_address_line_1 = true;
      if (!billing.city) errors.billing_address_city = true;
      if (!billing.state) errors.billing_address_state = true;
      if (!billing.postal_code) errors.billing_address_postal_code = true;
      if (!billing.country) errors.billing_address_country = true;
    }
    
    setModalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = () => {
    if (!formData.project) {
      setOpenWarningDialog(true);
      return;
    }
    setOpenModal(true);
  };

  const handleSaveNewContact = async () => {
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    try {
      console.log('Starting save process');

      // 1. Crear shipping address
      const shippingAddressData = {
        address_line_1: newContact.shipping_address.address_line_1 || '',
        address_line_2: newContact.shipping_address.address_line_2 || '',
        city: newContact.shipping_address.city || '',
        state: newContact.shipping_address.state || '',
        postal_code: newContact.shipping_address.postal_code || '',
        country: newContact.shipping_address.country || '',
        entity_type: 'recipient',
        address_type: 'shipping',
        notes: '',
      };
      console.log('Sending shipping address:', shippingAddressData);
      const shippingResponse = await apiProtected.post('addresses/', shippingAddressData);
      console.log('Shipping response:', shippingResponse.data);
      const shippingId = shippingResponse.data.id;

      // 2. Crear billing address
      const billingAddressData = {
        address_line_1: newContact.billing_address.address_line_1 || '',
        address_line_2: newContact.billing_address.address_line_2 || '',
        city: newContact.billing_address.city || '',
        state: newContact.billing_address.state || '',
        postal_code: newContact.billing_address.postal_code || '',
        country: newContact.billing_address.country || '',
        entity_type: 'recipient',
        address_type: 'billing',
        notes: '',
      };
      console.log('Sending billing address:', billingAddressData);
      const billingResponse = await apiProtected.post('addresses/', billingAddressData);
      console.log('Billing response:', billingResponse.data);
      const billingId = billingResponse.data.id;

      // 3. Crear el contacto
      const contactData = {
        company_name: newContact.company_name || '',
        contact_name: newContact.contact_name || '',
        attention: newContact.attention || '',
        phone: newContact.phone || '',
        email: newContact.email || '',
        mobile: newContact.mobile || '',
        title: newContact.title || '',
        notes: newContact.notes || '',
        addresses: [shippingId, billingId],
      };
      console.log('Sending contact:', contactData);
      const contactResponse = await apiProtected.post('contacts/', contactData);
      console.log('Contact response:', contactResponse.data);
      const newContactId = contactResponse.data.id;

      // 4. Asignar al proyecto usando formData.project
      console.log('User:', user);
      console.log('Projects:', projects);
      console.log('Selected project from formData:', formData.project);

      if (formData.project) {
        const selectedProject = projects.find((p) => p.id === formData.project);
        if (selectedProject) {
          console.log('Found selected project:', selectedProject);
          console.log('Project ID:', selectedProject.id);
          console.log('Current project contacts:', selectedProject.contacts || []);
          const updatedContacts = [...(selectedProject.contacts || []), newContactId];
          console.log('New contact list to send:', updatedContacts);
          await apiProtected.patch(`projects/${selectedProject.id}/`, { contacts: updatedContacts });
          console.log('Project updated successfully with new contact:', newContactId);
        } else {
          console.warn('Selected project not found in projects list:', formData.project, 'in', projects);
          setModalErrors({ general: 'Contact created, but selected project not found. Please assign manually.' });
        }
      } else {
        console.warn('No project selected in formData:', formData);
        setModalErrors({ general: 'Contact created, but no project selected. Please assign manually.' });
      }

      // 5. Actualizar formData
      handleChange({ target: { name: 'contact', value: newContactId } });
      handleChange({ target: { name: 'shipping_address', value: shippingId } });
      handleChange({ target: { name: 'billing_address', value: billingId } });

      // 6. Refrescar los datos de referencia
      await refetchReferenceData();

      // 7. Cerrar el modal
      setOpenModal(false);

      setNewContact({
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
          entity_type: 'recipient',
          address_type: 'shipping',
        },
        billing_address: {
          address_line_1: '',
          address_line_2: '',
          city: '',
          state: '',
          postal_code: '',
          country: '',
          entity_type: 'recipient',
          address_type: 'billing',
        },
      });

      console.log('Contact creation completed');
    } catch (error) {
      console.error('Error in save process:', error);
      if (error.response) {
        const errorMsg = error.response.data?.detail || JSON.stringify(error.response.data) || 'Unknown error';
        console.error('API error details:', error.response);
        setModalErrors({ general: `Failed to save: ${errorMsg}` });
      } else {
        setModalErrors({ general: 'Failed to save: Network or server error' });
      }
    }
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
            disabled={isOrderLocked}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            id="contact"
            options={contactOptions}
            value={selectedContact}
            onChange={handleContactChange}
            getOptionLabel={(option) => {
              // Evitar errores con opciones no válidas
              if (typeof option === 'string') return option;
              return option?.label || '';
            }}
            renderOption={(props, option) => {
              // Extraer la key del objeto props para evitar el warning
              const { key, ...otherProps } = props;
              
              // Renderizar la opción "Add New Contact" con estilo diferente
              if (option.isAddOption) {
                return (
                  <li key={key} {...otherProps} style={{ fontWeight: 'bold', color: '#1976d2' }}>
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                      + {option.label}
                    </Box>
                  </li>
                );
              }
              // Renderizar opciones normales
              return <li key={key} {...otherProps}>{option.label}</li>;
            }}
            filterOptions={customFilterOptions}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Company or Contact *"
                error={!!formErrors.contact}
                helperText={formErrors.contact && 'This field is required'}
                fullWidth
              />
            )}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            disabled={isOrderLocked}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              p: 1,
              backgroundColor: '#f5f5f5',
              opacity: 0.9,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Shipping Address *
            </Typography>
            <Typography
              variant="body2"
              sx={{ flexGrow: 1, color: formErrors.shipping_address ? 'error.main' : 'text.secondary' }}
            >
              {selectedShippingAddress ? formatAddress(selectedShippingAddress) : 'No address selected'}
            </Typography>
            {formErrors.shipping_address && (
              <Typography variant="caption" color="error">
                This field is required
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              p: 1,
              backgroundColor: '#f5f5f5',
              opacity: 0.9,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Billing Address *
            </Typography>
            <Typography
              variant="body2"
              sx={{ flexGrow: 1, color: formErrors.billing_address ? 'error.main' : 'text.secondary' }}
            >
              {selectedBillingAddress ? formatAddress(selectedBillingAddress) : 'No address selected'}
            </Typography>
            {formErrors.billing_address && (
              <Typography variant="caption" color="error">
                This field is required
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Contact Form Modal */}
      <ContactFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        newContact={newContact}
        modalErrors={modalErrors}
        sameBillingAddress={sameBillingAddress}
        handleNewContactChange={handleNewContactChange}
        handleSameAddressChange={handleSameAddressChange}
        handleSaveNewContact={handleSaveNewContact}
      />

      {/* Project Warning Dialog */}
      <ProjectWarningDialog
        open={openWarningDialog}
        onClose={() => setOpenWarningDialog(false)}
      />
    </Paper>
  );
};

export default DeliveryInfoStep;