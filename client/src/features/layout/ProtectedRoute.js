import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../auth/AuthContext';
import MainLayout from './MainLayout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return <MainLayout>{children}</MainLayout>;
};

export default ProtectedRoute;