import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import apiProtected from '../../../services/api/secureApi';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // State for orders and filters
  const [orders, setOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  // Fetch orders and statuses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, statusesRes] = await Promise.all([
          apiProtected.get('orders/'),
          apiProtected.get('order-statuses/'),
        ]);
        setOrders(ordersRes.data);
        setOrderStatuses(statusesRes.data);
      } catch (err) {
        setOrdersError('Error loading orders or statuses.');
      } finally {
        setOrdersLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Filter orders based on the selected status
  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(order => order.order_status === parseInt(selectedStatus, 10));

  // Handle click on an order
  const handleOrderClick = (orderId) => {
    navigate(`/order/${orderId}`); // This assumes you will implement a details route
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>Loading...</Typography>
      </Container>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Filter by status */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={selectedStatus}
            label="Filtrar por estado"
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            {orderStatuses.map((status) => (
              <MenuItem key={status.id} value={status.id}>
                {status.name || status.status_name} {/* Adjust according to your API */}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Orders table */}
      {ordersLoading ? (
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography mt={2}>Loading orders...</Typography>
        </Box>
      ) : ordersError ? (
        <Typography color="error" align="center">{ordersError}</Typography>
      ) : filteredOrders.length === 0 ? (
        <Typography align="center">There are no orders to show.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Typography variant="subtitle2">Order</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Type</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Expected Date</Typography></TableCell>
                <TableCell><Typography variant="subtitle2"></Typography>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => {
                const status = orderStatuses.find(s => s.id === order.order_status)?.name || 'Unknown';
                return (
                  <TableRow key={order.id} hover onClick={() => handleOrderClick(order.id)} sx={{ cursor: 'pointer' }}>
                    <TableCell>{order.lookup_code_order}</TableCell>
                    <TableCell>{status}</TableCell>
                    <TableCell>{order.order_type_name || order.order_type}</TableCell>
                    <TableCell>{order.expected_delivery_date || 'N/A'}</TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" onClick={(e) => { e.stopPropagation(); handleOrderClick(order.id); }}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Dashboard;