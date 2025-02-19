import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import SecurePage from './pages/SecurePage';
import CreateOrder from './pages/CreateOrder';

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
