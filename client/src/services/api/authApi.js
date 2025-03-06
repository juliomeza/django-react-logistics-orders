import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/auth/',
  withCredentials: true,
});

// Función para renovar el token
const refreshToken = async () => {
  try {
    await api.post('refresh/');
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

// Variable para almacenar el ID del intervalo
let refreshInterval = null;

// Configurar temporizador para renovación proactiva
export const setupTokenRefresh = () => {
  // Limpiar intervalo anterior si existe
  clearTokenRefresh();
  
  // ⚠️ Mantener menor que ACCESS_TOKEN_LIFETIME del backend (config\settings.py)
  // Actualmente, el backend usa 20 min → Renovamos a los 19 min
  // Si cambias el backend, actualiza este valor.
  const REFRESH_INTERVAL = 19 * 60 * 1000;
  
  refreshInterval = setInterval(async () => {
    const success = await refreshToken();
    if (!success) {
      clearTokenRefresh();
    }
  }, REFRESH_INTERVAL);

  // Asegurarnos de limpiar el intervalo si la ventana se cierra
  window.addEventListener('beforeunload', clearTokenRefresh);
};

// Función para limpiar el intervalo cuando se hace logout
export const clearTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

export const setupInterceptors = (axiosInstance, navigate) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (originalRequest.url.includes('refresh/')) {
        clearTokenRefresh(); // Si falla el refresh, limpiamos el intervalo
        if (navigate) {
          navigate('/login');
        }
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshSuccess = await refreshToken();
          if (refreshSuccess) {
            return axiosInstance(originalRequest);
          } else {
            clearTokenRefresh();
            if (navigate) {
              navigate('/login');
            }
          }
        } catch (err) {
          clearTokenRefresh();
          if (navigate) {
            navigate('/login');
          }
          return Promise.reject(err);
        }
      }
      return Promise.reject(error);
    }
  );
};

export default api;
