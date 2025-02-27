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
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthContext from '../../auth/AuthContext';
import apiProtected from '../../../services/api/secureApi';
import SelectField from '../components/SelectField';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [orderTypes, setOrderTypes] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

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

  const filteredOrders = orders.filter(order => {
    const statusMatch = selectedStatus === 'all' || order.order_status === parseInt(selectedStatus, 10);
    const typeMatch = selectedType === 'all' || order.order_type === parseInt(selectedType, 10);
    return statusMatch && typeMatch;
  });

  const handleEditClick = (orderId) => {
    navigate(`/edit-order/${orderId}`);
  };

  const handleViewClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const handleDeleteClick = (orderId) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    try {
      await apiProtected.delete(`/order-lines/order/${orderToDelete}/clear/`);
      await apiProtected.delete(`/orders/${orderToDelete}/`);
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderToDelete));
      setSnackbarMessage('Order deleted successfully.');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to delete order. Please try again.');
      setSnackbarSeverity('error');
      console.error('Delete error:', err);
    } finally {
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
      setSnackbarOpen(true);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const isCreatedStatus = (statusId) => statusId === 1;

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
                const canEdit = isCreatedStatus(order.order_status);

                return (
                  <TableRow key={order.id} hover sx={{ cursor: 'pointer' }}>
                    <TableCell>{order.lookup_code_order}</TableCell>
                    <TableCell>{status}</TableCell>
                    <TableCell>{typeName}</TableCell>
                    <TableCell>{formatDate(order.expected_delivery_date)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {canEdit ? (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleEditClick(order.id); }}
                          >
                            Edit
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleViewClick(order.id); }}
                          >
                            View
                          </Button>
                        )}
                        {canEdit && (
                          <IconButton
                            aria-label="delete"
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(order.id); }}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Order</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this order? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteCancel} color="primary">
            No
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;