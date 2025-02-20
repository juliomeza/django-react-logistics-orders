import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/auth/',
  withCredentials: true,
});

export const setupInterceptors = (axiosInstance, navigate) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      // Evitamos reintentos en llamadas al endpoint refresh
      if (originalRequest.url.includes('refresh/')) {
        return Promise.reject(error);
      }
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await axiosInstance.post('refresh/');
          return axiosInstance(originalRequest);
        } catch (err) {
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
