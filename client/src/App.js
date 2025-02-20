import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import Login from './features/auth/Login';
import SecurePage from './features/orders/pages/SecurePage';
import CreateOrder from './features/orders/pages/CreateOrder';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/secure" element={<SecurePage />} />
          <Route path="/create-order" element={<CreateOrder />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
