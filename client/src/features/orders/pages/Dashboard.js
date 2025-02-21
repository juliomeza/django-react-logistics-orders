import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Button, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate, Navigate } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estado para las órdenes
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  // Obtiene las órdenes cuando el usuario está autenticado
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/orders/', {
          withCredentials: true,
        });
        setOrders(response.data);
      } catch (err) {
        setOrdersError('Error al cargar las órdenes.');
      } finally {
        setOrdersLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>Cargando...</Typography>
      </Container>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleCreateOrder = () => {
    navigate('/create-order');
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="h6" gutterBottom>
        Bienvenido, {user.first_name}!
      </Typography>
      <Button variant="contained" color="primary" onClick={handleCreateOrder} sx={{ mb: 2 }}>
        Crear Orden
      </Button>
      {ordersLoading ? (
        <div>
          <CircularProgress />
          <Typography mt={2}>Cargando órdenes...</Typography>
        </div>
      ) : ordersError ? (
        <Typography color="error">{ordersError}</Typography>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Órdenes Abiertas
          </Typography>
          <List>
            {orders.map((order) => (
              <ListItem key={order.id}>
                <ListItemText
                  primary={`Orden: ${order.lookup_code_order}`}
                  secondary={`Estado: ${order.order_status_name}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
