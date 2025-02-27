import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import apiProtected from '../../../services/api/secureApi';
import useReferenceData from '../hooks/useReferenceData';
import useInventoriesAndMaterials from '../hooks/useInventoriesAndMaterials';

const OrderView = () => {
  const { user } = useContext(AuthContext);
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [orderLines, setOrderLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const referenceData = useReferenceData(user);
  const inventoriesAndMaterials = useInventoriesAndMaterials(user, order?.warehouse);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const orderResponse = await apiProtected.get(`orders/${orderId}/`);
        console.log('Order data:', orderResponse.data); // Depuración
        setOrder(orderResponse.data);

        const linesResponse = await apiProtected.get(`order-lines/order/${orderId}/`);
        console.log('Order lines:', linesResponse.data); // Depuración
        setOrderLines(linesResponse.data);
      } catch (err) {
        setError('Failed to load order details or lines.');
        console.error('Error fetching data:', err); // Depuración
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrderData();
  }, [orderId, user]);

  const getOrderTypeName = (id) => {
    const item = referenceData.data.orderTypes.find((item) => item.id === id);
    return item ? item.type_name : 'Unknown';
  };

  const getOrderClassName = (id) => {
    const item = referenceData.data.orderClasses.find((item) => item.id === id);
    return item ? item.class_name : 'Unknown';
  };

  const getWarehouseName = (id) => {
    const item = referenceData.data.warehouses.find((item) => item.id === id);
    return item ? item.name : 'Unknown';
  };

  const getProjectName = (id) => {
    const item = referenceData.data.projects.find((item) => item.id === id);
    return item ? item.name : 'Unknown';
  };

  const getCarrierName = (id) => {
    const item = referenceData.data.carriers.find((item) => item.id === id);
    return item ? item.name : 'Unknown';
  };

  const getServiceName = (id) => {
    const item = referenceData.data.carrierServices.find((item) => item.id === id);
    return item ? item.name : 'Unknown';
  };

  const getContactName = (id) => {
    const item = referenceData.data.contacts.find((item) => item.id === id);
    return item ? `${item.first_name} ${item.last_name}` : 'Unknown';
  };

  const getAddressLine = (id) => {
    const item = referenceData.data.addresses.find((item) => item.id === id);
    return item ? item.address_line_1 : 'Unknown';
  };

  const getMaterialName = (id) => {
    const item = inventoriesAndMaterials.materials.find((item) => item.id === id);
    return item ? item.name : 'Unknown';
  };

  if (!user) return <Navigate to="/login" />;
  if (loading || referenceData.loading || inventoriesAndMaterials.loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }
  if (error) return <Typography color="error">{error}</Typography>;

  const hasMaterials = orderLines.length > 0;

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Order Details
      </Typography>

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
            <Typography variant="body1">{getOrderTypeName(order.order_type)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Order Class</Typography>
            <Typography variant="body1">{getOrderClassName(order.order_class)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Order Number</Typography>
            <Typography variant="body1">{order.lookup_code_order}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Reference Number</Typography>
            <Typography variant="body1">{order.reference_number || 'Not specified'}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Logistics Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Warehouse</Typography>
            <Typography variant="body1">{getWarehouseName(order.warehouse)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Project</Typography>
            <Typography variant="body1">{getProjectName(order.project)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Carrier</Typography>
            <Typography variant="body1">
              {order.carrier ? getCarrierName(order.carrier) : 'Not specified'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Service Type</Typography>
            <Typography variant="body1">
              {order.service_type ? getServiceName(order.service_type) : 'Not specified'}
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
            <Typography variant="body1">{getContactName(order.contact)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">Expected Delivery Date</Typography>
            <Typography variant="body1">
              {order.expected_delivery_date || 'Not specified'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">Shipping Address</Typography>
            <Typography variant="body1">{getAddressLine(order.shipping_address)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">Billing Address</Typography>
            <Typography variant="body1">{getAddressLine(order.billing_address)}</Typography>
          </Grid>
        </Grid>

        {order.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Additional Information
            </Typography>
            <Typography variant="body2" color="text.secondary">Notes</Typography>
            <Typography variant="body1">{order.notes}</Typography>
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
                {orderLines.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{getMaterialName(item.material)}</TableCell>
                    <TableCell>{item.lot || ''}</TableCell>
                    <TableCell>{item.license_plate || ''}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            No Materials Selected
          </Typography>
          <Typography variant="body1">
            This order does not have any materials associated with it.
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default OrderView;