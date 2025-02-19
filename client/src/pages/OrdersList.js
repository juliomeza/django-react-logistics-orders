import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const OrdersList = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
  
    useEffect(() => {
      const fetchOrders = async () => {
        try {
          // No enviamos parámetros, el backend filtra las órdenes por el usuario autenticado
          const response = await axios.get('http://localhost:8000/api/orders/', {
            withCredentials: true,
          });
          setOrders(response.data);
        } catch (err) {
          setError('Error al cargar las órdenes.');
        } finally {
          setLoading(false);
        }
      };
  
      if (user) {
        fetchOrders();
      }
    }, [user]);
  
    if (loading) {
      return (
        <Container sx={{ textAlign: 'center', mt: 4 }}>
          <CircularProgress />
          <Typography mt={2}>Cargando órdenes...</Typography>
        </Container>
      );
    }
  
    if (error) {
      return (
        <Container sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="error">{error}</Typography>
        </Container>
      );
    }
  
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Órdenes del proyecto
        </Typography>
        <List>
          {orders.map((order) => (
            <ListItem key={order.id}>
              <ListItemText
                primary={`Orden: ${order.lookup_code_order}`}
                secondary={`Estado: ${order.order_status}`}
              />
            </ListItem>
          ))}
        </List>
      </Container>
    );
  };
  
  export default OrdersList;