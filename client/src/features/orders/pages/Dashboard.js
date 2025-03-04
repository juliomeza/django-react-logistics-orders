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
  useTheme,
  Collapse,
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AuthContext from '../../auth/AuthContext';
import apiProtected from '../../../services/api/secureApi';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const [orders, setOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [orderTypes, setOrderTypes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  
  // Estados para el acordeón
  const [activeOrdersOpen, setActiveOrdersOpen] = useState(true);
  const [deliveredOrdersOpen, setDeliveredOrdersOpen] = useState(true);

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

  const filteredOrders = orders
    .filter(order => {
      const contact = contacts.find(c => c.id === order.contact);
      const address = addresses.find(a => a.id === order.shipping_address);
      const companyName = contact?.company_name || '';
      const contactName = contact?.contact_name || '';
      const city = address?.city || '';
      const state = address?.state || '';
      const searchMatch =
        searchText === '' ||
        (order.lookup_code_order && order.lookup_code_order.toLowerCase().includes(searchText.toLowerCase())) ||
        (order.reference_number && order.reference_number.toLowerCase().includes(searchText.toLowerCase())) ||
        companyName.toLowerCase().includes(searchText.toLowerCase()) ||
        contactName.toLowerCase().includes(searchText.toLowerCase()) ||
        city.toLowerCase().includes(searchText.toLowerCase()) ||
        state.toLowerCase().includes(searchText.toLowerCase());
      const outboundTypes = orderTypes
        .filter(type => type.type_name?.toLowerCase().includes('outbound') || type.is_outbound)
        .map(type => type.id);
      const inboundTypes = orderTypes
        .filter(type => type.type_name?.toLowerCase().includes('inbound') || type.is_inbound)
        .map(type => type.id);
      const tabMatch = selectedTab === 0 ? outboundTypes.includes(order.order_type) : inboundTypes.includes(order.order_type);
      return searchMatch && tabMatch;
    })
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  // Función para verificar si una fecha está dentro de los últimos 30 días
  const isWithinLast30Days = (dateString) => {
    if (!dateString) return false;
    
    const currentDate = new Date();
    const date = new Date(dateString);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);
    
    return date >= thirtyDaysAgo && date <= currentDate;
  };

  const activeOrders = filteredOrders.filter(order => order.order_status !== 7);
  const deliveredOrders = filteredOrders.filter(order => {
    if (order.order_status !== 7) return false;
    
    // Si hay delivery_date, verificar si está dentro de los últimos 30 días
    if (order.delivery_date) {
      return isWithinLast30Days(order.delivery_date);
    } 
    
    // Si no hay delivery_date, usar modified_date como alternativa
    return isWithinLast30Days(order.modified_date);
  });

  const handleEditClick = (orderId) => navigate(`/edit-order/${orderId}`);
  const handleViewClick = (orderId) => navigate(`/order/${orderId}`);
  const handleDeleteClick = (orderId) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    try {
      await apiProtected.delete(`/order-lines/order/${orderToDelete}/clear/`);
      await apiProtected.delete(`/orders/${orderToDelete}/`);
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderToDelete));
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

  const handleTabChange = (event, newValue) => setSelectedTab(newValue);

  const getStatusChipColor = (statusId) => {
    switch (statusId) {
      case 1: case 2:
        return {
          backgroundColor: theme.palette.status.initial.backgroundColor,
          color: theme.palette.status.initial.color,
          border: `1px solid ${theme.palette.status.initial.border}`,
        };
      case 3: case 4: case 5: case 6:
        return {
          backgroundColor: theme.palette.status.inProgress.backgroundColor,
          color: theme.palette.status.inProgress.color,
          border: `1px solid ${theme.palette.status.inProgress.border}`,
        };
      case 7:
        return {
          backgroundColor: theme.palette.status.completed.backgroundColor,
          color: theme.palette.status.completed.color,
          border: `1px solid ${theme.palette.status.completed.border}`,
        };
      default:
        return {
          backgroundColor: theme.palette.status.default.backgroundColor,
          color: theme.palette.status.default.color,
          border: `1px solid ${theme.palette.status.default.border}`,
        };
    }
  };

  const isCreatedStatus = (statusId) => statusId === 1;

  const renderOrdersTable = (orders, title, subtitle, isOpen, setIsOpen) => {
    if (orders.length === 0) return null;

    return (
      <Box sx={{ mb: 4 }}>
        <Paper 
          sx={{ 
            p: 2, 
            mb: isOpen ? 2 : 0, 
            backgroundColor: '#f9fafb',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#eef0f2',
            },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
          </Box>
          <IconButton size="small">
            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Paper>
        
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
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
                {orders.map((order) => {
                  const status = orderStatuses.find(s => s.id === order.order_status)?.status_name || 'Unknown';
                  const statusStyle = getStatusChipColor(order.order_status);
                  const canEdit = isCreatedStatus(order.order_status);
                  const contact = contacts.find(c => c.id === order.contact);
                  const customerDisplay = contact ? (contact.company_name || contact.contact_name || '-') : '-';
                  const address = addresses.find(a => a.id === order.shipping_address);
                  const destinationDisplay = address && address.city && address.state ? `${address.city} - ${address.state}` : '-';

                  return (
                    <TableRow key={order.id} hover sx={{ cursor: 'pointer' }}>
                      <TableCell>{order.lookup_code_order}</TableCell>
                      <TableCell>{order.reference_number || '-'}</TableCell>
                      <TableCell>{customerDisplay}</TableCell>
                      <TableCell>{destinationDisplay}</TableCell>
                      <TableCell>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            ...statusStyle,
                          }}
                        >
                          {status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {canEdit ? (
                            <Button variant="outlined" size="small" onClick={(e) => { e.stopPropagation(); handleEditClick(order.id); }}>
                              Edit
                            </Button>
                          ) : (
                            <Button variant="outlined" size="small" onClick={(e) => { e.stopPropagation(); handleViewClick(order.id); }}>
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
        </Collapse>
      </Box>
    );
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
    <>
      {/* Sección fija de Tabs y Search debajo del Header */}
      <Box
        sx={{
          position: 'fixed',
          top: '64px', // Altura predeterminada del AppBar/Toolbar
          left: 0,
          right: 0,
          zIndex: 1100,
          backgroundColor: 'background.paper',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          borderBottom: 1,
          borderColor: 'divider',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tabs value={selectedTab} onChange={handleTabChange} aria-label="order type tabs">
              <Tab label="Outbound" />
              <Tab label="Inbound" />
            </Tabs>
            <TextField
              id="search-box"
              label="Search by Order, Reference, Customer or Destination"
              variant="outlined"
              size="small"
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
        </Container>
      </Box>

      {/* Contenido desplazable */}
      <Container maxWidth="lg" sx={{ mt: 14, mb: 4 }}>
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
          <>
            {renderOrdersTable(activeOrders, 'Active Orders', 'Orders in initial stages and being processed', activeOrdersOpen, setActiveOrdersOpen)}
            {renderOrdersTable(deliveredOrders, 'Recently Delivered', 'Displayed for 30 days after delivery', deliveredOrdersOpen, setDeliveredOrdersOpen)}
          </>
        )}
      </Container>

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
          <Button onClick={handleDeleteCancel} color="primary">Cancel</Button>
          <Button onClick={handleDeleteCancel} color="primary">No</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>Yes</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Dashboard;