import { useContext } from 'react';
import { Container, Typography, Button, CircularProgress } from '@mui/material';
import AuthContext from '../features/auth/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import OrdersList from './OrdersList';

const SecurePage = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Loading...
        </Typography>
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
        Secure Page
      </Typography>
      <Typography variant="h6" gutterBottom>
        Welcome, {user?.first_name}!
      </Typography>
      
      <Button variant="contained" color="primary" onClick={handleCreateOrder} sx={{ mb: 2 }}>
        Create Order
      </Button>

      <OrdersList />

      <Button variant="contained" color="secondary" onClick={logout} sx={{ mt: 4 }}>
        Logout
      </Button>
    </Container>
  );
};

export default SecurePage;
