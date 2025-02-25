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
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import apiProtected from '../../../services/api/secureApi';
import SelectField from '../components/SelectField';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // State for orders and filters
  const [orders, setOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [orderTypes, setOrderTypes] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // New state for type filter
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  // Fetch orders, statuses, and types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, statusesRes, typesRes] = await Promise.all([
          apiProtected.get('orders/'),
          apiProtected.get('order-statuses/'),
          apiProtected.get('order-types/'),
        ]);
        setOrders(ordersRes.data);
        setOrderStatuses(statusesRes.data);
        setOrderTypes(typesRes.data);
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

  // Filter orders based on selected status and type
  const filteredOrders = orders.filter(order => {
    const statusMatch = selectedStatus === 'all' || order.order_status === parseInt(selectedStatus, 10);
    const typeMatch = selectedType === 'all' || order.order_type === parseInt(selectedType, 10);
    return statusMatch && typeMatch;
  });

  // Handle click on an order
  const handleOrderClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  // Format date to MM-DD-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
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
      {/* Filters for status and type */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3, gap: 2 }}>
        <SelectField
          id="status-filter"
          label="Status"
          name="status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          options={[{ id: 'all', status_name: 'All' }, ...orderStatuses]}
          getOptionValue={(option) => option.id}
          getOptionLabel={(option) => option.status_name || option.name}
          sx={{ minWidth: 200 }}
          fullWidth={false}
        />
        <SelectField
          id="type-filter"
          label="Type"
          name="type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          options={[{ id: 'all', type_name: 'All' }, ...orderTypes]}
          getOptionValue={(option) => option.id}
          getOptionLabel={(option) => option.type_name}
          sx={{ minWidth: 200 }}
          fullWidth={false}
        />
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
                <TableCell><Typography variant="subtitle2">Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => {
                const status = orderStatuses.find(s => s.id === order.order_status)?.status_name || 'Unknown';
                const typeName = orderTypes.find(t => t.id === order.order_type)?.type_name || 'Unknown';
                return (
                  <TableRow key={order.id} hover onClick={() => handleOrderClick(order.id)} sx={{ cursor: 'pointer' }}>
                    <TableCell>{order.lookup_code_order}</TableCell>
                    <TableCell>{status}</TableCell>
                    <TableCell>{typeName}</TableCell>
                    <TableCell>{formatDate(order.expected_delivery_date)}</TableCell>
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