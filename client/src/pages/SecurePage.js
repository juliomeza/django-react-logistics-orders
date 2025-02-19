import { useContext } from 'react';
import { Container, Typography, Button, CircularProgress } from '@mui/material';
import AuthContext from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import OrdersList from './OrdersList';

const SecurePage = () => {
  const { user, logout, loading } = useContext(AuthContext);

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

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Secure Page
      </Typography>
      <Typography variant="h6" gutterBottom>
        Welcome, {user?.first_name}!
      </Typography>
      
      {/* Mostramos las órdenes filtradas por proyecto */}
      <OrdersList />

      <Button variant="contained" color="secondary" onClick={logout} sx={{ mt: 4 }}>
        Logout
      </Button>
    </Container>
  );
};

export default SecurePage;