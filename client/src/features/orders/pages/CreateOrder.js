import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate, Navigate } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import apiProtected from '../../../services/api/secureApi';
import SelectField from '../components/SelectField';

const CreateOrder = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [orderTypes, setOrderTypes] = useState([]);
  const [orderClasses, setOrderClasses] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [carrierServices, setCarrierServices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    lookup_code_order: '',
    lookup_code_shipment: '',
    expected_delivery_date: '',
    notes: '',
    order_type: '',
    order_class: '',
    order_status: '',
    project: '',
    warehouse: '',
    contact: '',
    shipping_address: '',
    billing_address: '',
    carrier: '',
    service_type: '',
  });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [
          orderTypesRes,
          orderClassesRes,
          projectsRes,
          warehousesRes,
          contactsRes,
          addressesRes,
          carriersRes,
          carrierServicesRes,
        ] = await Promise.all([
          apiProtected.get('order-types/'),
          apiProtected.get('order-classes/'),
          apiProtected.get('projects/'),
          apiProtected.get('warehouses/'),
          apiProtected.get('contacts/'),
          apiProtected.get('addresses/'),
          apiProtected.get('carriers/'),
          apiProtected.get('carrier-services/'),
        ]);

        setOrderTypes(orderTypesRes.data);
        setOrderClasses(orderClassesRes.data);

        const userId = parseInt(user.id, 10);
        setProjects(
          projectsRes.data.filter(
            (proj) => Array.isArray(proj.users) && proj.users.includes(userId)
          )
        );

        setWarehouses(warehousesRes.data);
        setContacts(contactsRes.data);
        setAddresses(addressesRes.data);
        setCarriers(carriersRes.data);
        setCarrierServices(carrierServicesRes.data);
      } catch (err) {
        setError('Error al cargar los datos de selección.');
      }
    };

    fetchData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiProtected.post('orders/', formData);
      navigate('/dashboard');
    } catch (err) {
      setError('Error al crear la orden.');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Create Order
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectField
              label="Order Type"
              name="order_type"
              value={formData.order_type}
              onChange={handleChange}
              required
              options={orderTypes}
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
              options={orderClasses}
              getOptionLabel={(option) => option.class_name}
              getOptionValue={(option) => option.id}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Order Status"
              name="order_status"
              type="number"
              value={formData.order_status}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Lookup Code Order"
              name="lookup_code_order"
              value={formData.lookup_code_order}
              onChange={handleChange}
              inputProps={{ maxLength: 50, minLength: 1 }}
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
              inputProps={{ maxLength: 50, minLength: 1 }}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectField
              label="Warehouse"
              name="warehouse"
              value={formData.warehouse}
              onChange={handleChange}
              required
              options={warehouses}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectField
              label="Project"
              name="project"
              value={formData.project}
              onChange={handleChange}
              required
              options={projects}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectField
              label="Carrier"
              name="carrier"
              value={formData.carrier}
              onChange={handleChange}
              options={carriers}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectField
              label="Service Type"
              name="service_type"
              value={formData.service_type}
              onChange={handleChange}
              options={carrierServices}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Expected Delivery Date"
              name="expected_delivery_date"
              type="datetime-local"
              value={formData.expected_delivery_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectField
              label="Contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              options={contacts}
              getOptionLabel={(option) =>
                `${option.first_name} ${option.last_name}`
              }
              getOptionValue={(option) => option.id}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectField
              label="Shipping Address"
              name="shipping_address"
              value={formData.shipping_address}
              onChange={handleChange}
              required
              options={addresses}
              getOptionLabel={(option) => option.address_line_1}
              getOptionValue={(option) => option.id}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectField
              label="Billing Address"
              name="billing_address"
              value={formData.billing_address}
              onChange={handleChange}
              required
              options={addresses}
              getOptionLabel={(option) => option.address_line_1}
              getOptionValue={(option) => option.id}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />
          </Grid>
          <Grid size={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Enviar Orden
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CreateOrder;
