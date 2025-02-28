import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import apiProtected from '../../../services/api/secureApi';
import useReferenceData from '../hooks/useReferenceData';
import useInventoriesAndMaterials from '../hooks/useInventoriesAndMaterials';
import OrderSummary from '../components/OrderSummary';

/**
 * Component to view order details
 * Fetches and displays order information and associated materials
 */
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
        console.log('Order data:', orderResponse.data); // Debug
        setOrder(orderResponse.data);

        const linesResponse = await apiProtected.get(`order-lines/order/${orderId}/`);
        console.log('Order lines:', linesResponse.data); // Debug
        setOrderLines(linesResponse.data);
      } catch (err) {
        setError('Failed to load order details or lines.');
        console.error('Error fetching data:', err); // Debug
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrderData();
  }, [orderId, user]);

  if (!user) return <Navigate to="/login" />;
  
  if (loading || referenceData.loading || inventoriesAndMaterials.loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading...</Typography>
      </Container>
    );
  }
  
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Order Details
      </Typography>

      <OrderSummary 
        orderData={order}
        referenceData={referenceData.data}
        materials={inventoriesAndMaterials.materials}
        materialItems={orderLines}
        isReviewMode={false}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default OrderView;