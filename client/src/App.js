import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/pages/Dashboard';
import MultiStepCreateOrder from './features/orders/pages/MultiStepCreateOrder';
import OrderView from './features/orders/pages/OrderView';
import ProtectedRoute from './features/layout/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-order" element={<ProtectedRoute><MultiStepCreateOrder /></ProtectedRoute>} />
          <Route path="/edit-order/:orderId" element={<ProtectedRoute><MultiStepCreateOrder /></ProtectedRoute>} />
          <Route path="/order/:orderId" element={<ProtectedRoute><OrderView /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;