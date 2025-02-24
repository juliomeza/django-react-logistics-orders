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

  // Estado para las órdenes y filtros
  const [orders, setOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  // Fetch de órdenes y estados
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
        setOrdersError('Error al cargar las órdenes o los estados.');
      } finally {
        setOrdersLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Filtrar órdenes según el estado seleccionado
  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(order => order.order_status === parseInt(selectedStatus, 10));

  // Manejar clic en una orden
  const handleOrderClick = (orderId) => {
    navigate(`/order/${orderId}`); // Esto asume que implementarás una ruta de detalles
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>Cargando...</Typography>
      </Container>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Dashboard - Ordenes Abiertas
      </Typography>

      {/* Filtro por estado */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="status-filter-label">Filtrar por estado</InputLabel>
          <Select
            labelId="status-filter-label"
            value={selectedStatus}
            label="Filtrar por estado"
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <MenuItem value="all">Todos</MenuItem>
            {orderStatuses.map((status) => (
              <MenuItem key={status.id} value={status.id}>
                {status.name || status.lookup_code} {/* Ajusta según tu API */}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Tabla de órdenes */}
      {ordersLoading ? (
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography mt={2}>Cargando órdenes...</Typography>
        </Box>
      ) : ordersError ? (
        <Typography color="error" align="center">{ordersError}</Typography>
      ) : filteredOrders.length === 0 ? (
        <Typography align="center">No hay órdenes para mostrar.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Typography variant="subtitle2">Código de Orden</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Estado</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Tipo</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Fecha Esperada</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Acciones</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => {
                const status = orderStatuses.find(s => s.id === order.order_status)?.name || 'Desconocido';
                return (
                  <TableRow key={order.id} hover onClick={() => handleOrderClick(order.id)} sx={{ cursor: 'pointer' }}>
                    <TableCell>{order.lookup_code_order}</TableCell>
                    <TableCell>{status}</TableCell>
                    <TableCell>{order.order_type_name || order.order_type}</TableCell>
                    <TableCell>{order.expected_delivery_date || 'N/A'}</TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" onClick={(e) => { e.stopPropagation(); handleOrderClick(order.id); }}>
                        Ver Detalles
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