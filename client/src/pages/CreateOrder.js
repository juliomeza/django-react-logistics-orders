import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, TextField, Button, MenuItem, Box } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const CreateOrder = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Opciones para los dropdowns
  const [orderTypes, setOrderTypes] = useState([]);
  const [orderClasses, setOrderClasses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [carriers, setCarriers] = useState([]);

  // Estado del formulario
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

  // Carga de datos para dropdowns usando los endpoints definidos en swagger.json
  useEffect(() => {
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
        ] = await Promise.all([
          axios.get('http://localhost:8000/api/order-types/', { withCredentials: true }),
          axios.get('http://localhost:8000/api/order-classes/', { withCredentials: true }),
          axios.get('http://localhost:8000/api/projects/', { withCredentials: true }),
          axios.get('http://localhost:8000/api/warehouses/', { withCredentials: true }),
          axios.get('http://localhost:8000/api/contacts/', { withCredentials: true }),
          axios.get('http://localhost:8000/api/addresses/', { withCredentials: true }),
          axios.get('http://localhost:8000/api/carriers/', { withCredentials: true }),
        ]);
        setOrderTypes(orderTypesRes.data);
        setOrderClasses(orderClassesRes.data);
        // Filtramos los proyectos para mostrar solo los que tienen al usuario en su propiedad "users"
        if (user && user.id) {
          setProjects(projectsRes.data.filter((proj) => proj.users.includes(user.id)));
        } else {
          setProjects(projectsRes.data);
        }
        setWarehouses(warehousesRes.data);
        setContacts(contactsRes.data);
        setAddresses(addressesRes.data);
        setCarriers(carriersRes.data);
      } catch (err) {
        setError('Error al cargar los datos de selección.');
      }
    };
    fetchData();
  }, [user]);

  // Maneja los cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Envía el formulario al endpoint de creación de órdenes
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/orders/', formData, { withCredentials: true });
      navigate('/secure');
    } catch (err) {
      setError('Error al crear la orden.');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Crear Orden
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
        {/* Expected Delivery Date */}
        <TextField
          label="Expected Delivery Date"
          name="expected_delivery_date"
          type="datetime-local"
          value={formData.expected_delivery_date}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
        />
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
        {/* Project - se muestran solo los proyectos a los que el usuario tiene acceso */}
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
          label="Service Type"
          name="service_type"
          type="number"
          value={formData.service_type}
          onChange={handleChange}
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
