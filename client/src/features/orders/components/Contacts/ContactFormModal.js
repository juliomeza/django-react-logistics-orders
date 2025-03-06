import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Paper, Typography, TextField, Box, FormControlLabel, Checkbox } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddressFormFields from './AddressFormFields';

const ContactFormModal = ({
  open,
  onClose,
  newContact,
  modalErrors,
  sameBillingAddress, 
  handleNewContactChange,
  handleSameAddressChange,
  handleSaveNewContact
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Contact</DialogTitle>
      <DialogContent>
        {/* Información de contacto */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Contact Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Company Name *"
                name="company_name"
                value={newContact.company_name}
                onChange={handleNewContactChange}
                fullWidth
                error={!!modalErrors.company_name}
                helperText={modalErrors.company_name && 'Required'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Contact Name *"
                name="contact_name"
                value={newContact.contact_name}
                onChange={handleNewContactChange}
                fullWidth
                error={!!modalErrors.contact_name}
                helperText={modalErrors.contact_name && 'Required'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone *"
                name="phone"
                value={newContact.phone}
                onChange={handleNewContactChange}
                fullWidth
                error={!!modalErrors.phone}
                helperText={modalErrors.phone && 'Required'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email"
                name="email"
                value={newContact.email}
                onChange={handleNewContactChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Dirección de envío */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Shipping Address
          </Typography>
          <AddressFormFields 
            addressType="shipping_address" 
            addressData={newContact.shipping_address}
            onChange={handleNewContactChange}
            errors={modalErrors}
          />
          
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sameBillingAddress}
                  onChange={handleSameAddressChange}
                  name="sameAddress"
                  color="primary"
                />
              }
              label="Billing address is the same as shipping address"
            />
          </Box>
        </Paper>

        {/* Dirección de facturación (se muestra solo si no es la misma que shipping) */}
        {!sameBillingAddress && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Billing Address
            </Typography>
            <AddressFormFields 
              addressType="billing_address" 
              addressData={newContact.billing_address}
              onChange={handleNewContactChange}
              errors={modalErrors}
            />
          </Paper>
        )}
        
        {modalErrors.general && (
          <Typography color="error" sx={{ mt: 2 }}>
            {modalErrors.general}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveNewContact} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactFormModal;