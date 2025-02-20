// CreateOrder.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, TextField, Button, MenuItem, Box } from '@mui/material';
import { useNavigate, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import apiProtected from '../services/api/secureApi';

const CreateOrder = () => {
  // Llamamos a todos los hooks incondicionalmente
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

  // Siempre se llama a useEffect; dentro verificamos si hay usuario
  useEffect(() => {
    if (!user) return; // Si no hay usuario, no hacemos la petición
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

        // Filtramos solo los proyectos del usuario
        const userId = parseInt(user.id, 10);
        setProjects(
          projectsRes.data.filter((proj) =>
            Array.isArray(proj.users) && proj.users.includes(userId)
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiProtected.post('orders/', formData);
      navigate('/secure');
    } catch (err) {
      setError('Error al crear la orden.');
    }
  };

  // En el render: si está cargando, mostramos loading.
  // Si ya terminó de cargar y no hay usuario, redirigimos a login.
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
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Create Order
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {/* Order Type */}
        <TextField
          select
          label="Order Type"
          name="order_type"
          value={formData.order_type}
          onChange={handleChange}
          fullWidth
          required
        >
          {orderTypes.map((ot) => (
            <MenuItem key={ot.id} value={ot.id}>
              {ot.type_name}
            </MenuItem>
          ))}
        </TextField>

        {/* Order Class */}
        <TextField
          select
          label="Order Class"
          name="order_class"
          value={formData.order_class}
          onChange={handleChange}
          fullWidth
          required
        >
          {orderClasses.map((oc) => (
            <MenuItem key={oc.id} value={oc.id}>
              {oc.class_name}
            </MenuItem>
          ))}
        </TextField>

        {/* Order Status */}
        <TextField
          label="Order Status"
          name="order_status"
          type="number"
          value={formData.order_status}
          onChange={handleChange}
          fullWidth
          required
        />

        {/* Lookup Code Order */}
        <TextField
          label="Lookup Code Order"
          name="lookup_code_order"
          value={formData.lookup_code_order}
          onChange={handleChange}
          inputProps={{ maxLength: 50, minLength: 1 }}
          fullWidth
          required
        />

        {/* Lookup Code Shipment */}
        <TextField
          label="Lookup Code Shipment"
          name="lookup_code_shipment"
          value={formData.lookup_code_shipment}
          onChange={handleChange}
          inputProps={{ maxLength: 50, minLength: 1 }}
          fullWidth
          required
        />

        {/* Warehouse */}
        <TextField
          select
          label="Warehouse"
          name="warehouse"
          value={formData.warehouse}
          onChange={handleChange}
          fullWidth
          required
        >
          {warehouses.map((wh) => (
            <MenuItem key={wh.id} value={wh.id}>
              {wh.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Project */}
        <TextField
          select
          label="Project"
          name="project"
          value={formData.project}
          onChange={handleChange}
          fullWidth
          required
        >
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Carrier (opcional) */}
        <TextField
          select
          label="Carrier"
          name="carrier"
          value={formData.carrier}
          onChange={handleChange}
          fullWidth
        >
          {carriers.map((carrier) => (
            <MenuItem key={carrier.id} value={carrier.id}>
              {carrier.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Service Type (opcional) */}
        <TextField
          select
          label="Service Type"
          name="service_type"
          value={formData.service_type}
          onChange={handleChange}
          fullWidth
        >
          {carrierServices.map((service) => (
            <MenuItem key={service.id} value={service.id}>
              {service.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Expected Delivery Date */}
        <TextField
          label="Expected Delivery Date"
          name="expected_delivery_date"
          type="datetime-local"
          value={formData.expected_delivery_date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        {/* Contact */}
        <TextField
          select
          label="Contact"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          fullWidth
          required
        >
          {contacts.map((contact) => (
            <MenuItem key={contact.id} value={contact.id}>
              {contact.first_name} {contact.last_name}
            </MenuItem>
          ))}
        </TextField>

        {/* Shipping Address */}
        <TextField
          select
          label="Shipping Address"
          name="shipping_address"
          value={formData.shipping_address}
          onChange={handleChange}
          fullWidth
          required
        >
          {addresses.map((addr) => (
            <MenuItem key={addr.id} value={addr.id}>
              {addr.address_line_1}
            </MenuItem>
          ))}
        </TextField>

        {/* Billing Address */}
        <TextField
          select
          label="Billing Address"
          name="billing_address"
          value={formData.billing_address}
          onChange={handleChange}
          fullWidth
          required
        >
          {addresses.map((addr) => (
            <MenuItem key={addr.id} value={addr.id}>
              {addr.address_line_1}
            </MenuItem>
          ))}
        </TextField>

        {/* Notes */}
        <TextField
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          multiline
          rows={3}
          fullWidth
        />

        <Button type="submit" variant="contained" color="primary">
          Enviar Orden
        </Button>
      </Box>
    </Container>
  );
};

export default CreateOrder;
