import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setupInterceptors } from '../services/api/authApi';
import apiProtected from '../services/api/secureApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('auth-status/');
      setUser(response.data.user ? { ...response.data.user } : null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Configuramos los interceptors para ambas instancias usando el navigate
  useEffect(() => {
    setupInterceptors(api, navigate);
    setupInterceptors(apiProtected, navigate);
  }, [navigate]);

  const login = async (credentials) => {
    try {
      const response = await api.post('login/', credentials);
      if (response.status === 200) {
        await checkAuthStatus();
        navigate('/secure');
      }
    } catch (error) {
      console.error('Error de login', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('logout/');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error de logout', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
