import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import Login from './features/auth/Login';
import Dashboard from './features/orders/pages/Dashboard';
import CreateOrder from './features/orders/pages/CreateOrder';
import MainLayout from './features/layout/MainLayout';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />
          <Route
            path="/create-order"
            element={
              <MainLayout>
                <CreateOrder />
              </MainLayout>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
