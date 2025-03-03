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
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AuthContext from '../../auth/AuthContext';
import apiProtected from '../../../services/api/secureApi';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [orderTypes, setOrderTypes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState(0); // 0 para Outbound, 1 para Inbound
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
        const [ordersRes, statusesRes, typesRes, contactsRes, addressesRes] = await Promise.all([
          apiProtected.get('orders/'),
          apiProtected.get('order-statuses/'),
          apiProtected.get('order-types/'),
          apiProtected.get('contacts/'),
          apiProtected.get('addresses/'),
        ]);
        setOrders(ordersRes.data);
        setOrderStatuses(statusesRes.data);
        setOrderTypes(typesRes.data);
        setContacts(contactsRes.data);
        setAddresses(addressesRes.data);
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
    // Obtenemos el contacto y la dirección asociados a esta orden
    const contact = contacts.find(c => c.id === order.contact);
    const address = addresses.find(a => a.id === order.shipping_address);
    
    // Datos del cliente para búsqueda
    const companyName = contact?.company_name || '';
    const contactName = contact?.contact_name || '';
    
    // Datos de destino para búsqueda
    const city = address?.city || '';
    const state = address?.state || '';
    
    // Filtramos según el texto de búsqueda (ahora incluye Customer y Destination)
    const searchMatch = searchText === '' || 
      (order.lookup_code_order && order.lookup_code_order.toLowerCase().includes(searchText.toLowerCase())) ||
      (order.reference_number && order.reference_number.toLowerCase().includes(searchText.toLowerCase())) ||
      companyName.toLowerCase().includes(searchText.toLowerCase()) ||
      contactName.toLowerCase().includes(searchText.toLowerCase()) ||
      city.toLowerCase().includes(searchText.toLowerCase()) ||
      state.toLowerCase().includes(searchText.toLowerCase());
    
    // Filtramos según la pestaña activa (Outbound o Inbound)
    // Asumimos que los tipos están divididos entre Inbound y Outbound
    const outboundTypes = orderTypes
      .filter(type => type.type_name?.toLowerCase().includes('outbound') || type.is_outbound)
      .map(type => type.id);
    
    const inboundTypes = orderTypes
      .filter(type => type.type_name?.toLowerCase().includes('inbound') || type.is_inbound)
      .map(type => type.id);
      
    const tabMatch = selectedTab === 0
      ? outboundTypes.includes(order.order_type)
      : inboundTypes.includes(order.order_type);
      
    return searchMatch && tabMatch;
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

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Función para obtener el color del chip según el status ID
  const getStatusChipColor = (statusId) => {
    // Agrupación de colores por tipo de estado
    switch (statusId) {
      case 1: // Created
      case 2: // Submitted
        return {
          backgroundColor: '#e8e0ff',
          color: '#5a3dbf',
          border: '1px solid #d4c6ff'
        };
      case 3: // Received
      case 4: // Processing
      case 5: // Shipped
      case 6: // In Transit
        return {
          backgroundColor: '#e0f0ff',
          color: '#1976d2',
          border: '1px solid #c6e2ff'
        };
      case 7: // Delivered
        return {
          backgroundColor: '#e6f5e6',
          color: '#2e7d32',
          border: '1px solid #c8e6c9'
        };
      default:
        return {
          backgroundColor: '#f5f5f5',
          color: '#616161',
          border: '1px solid #e0e0e0'
        };
    }
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
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="order type tabs">
          <Tab label="Outbound" />
          <Tab label="Inbound" />
        </Tabs>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3, gap: 2 }}>
        <TextField
          id="search-box"
          label="Search by Order, Reference, Customer or Destination"
          variant="outlined"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ minWidth: 400 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
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
                <TableCell><Typography variant="subtitle2">Reference Number</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Customer</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Destination</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => {
                const status = orderStatuses.find(s => s.id === order.order_status)?.status_name || 'Unknown';
                const statusId = order.order_status;
                const statusStyle = getStatusChipColor(statusId);
                const canEdit = isCreatedStatus(order.order_status);
                
                // Obtener el contacto asociado a esta orden
                const contact = contacts.find(c => c.id === order.contact);
                
                // Determinar el valor para mostrar como customer (company_name o contact_name)
                let customerDisplay = '-';
                if (contact) {
                  customerDisplay = contact.company_name || contact.contact_name || '-';
                }

                // Obtener el shipping address asociado a esta orden
                const address = addresses.find(a => a.id === order.shipping_address);
                
                // Determinar el valor para mostrar como destination (City - State)
                let destinationDisplay = '-';
                if (address && address.city && address.state) {
                  destinationDisplay = `${address.city} - ${address.state}`;
                }

                return (
                  <TableRow key={order.id} hover sx={{ cursor: 'pointer' }}>
                    <TableCell>{order.lookup_code_order}</TableCell>
                    <TableCell>{order.reference_number || '-'}</TableCell>
                    <TableCell>{customerDisplay}</TableCell>
                    <TableCell>{destinationDisplay}</TableCell>
                    <TableCell>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        ...statusStyle
                      }}>
                        {status}
                      </span>
                    </TableCell>
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