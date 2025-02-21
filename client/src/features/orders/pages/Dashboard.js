import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);

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

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
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
            Open Orders
          </Typography>
          <List>
            {orders.map((order) => (
              <ListItem key={order.id}>
                <ListItemText
                  primary={`Order: ${order.lookup_code_order}`}
                  secondary={`Status: ${order.order_status_name}`}
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
