import axios from 'axios';
import { setupInterceptors } from './apiService';

const apiProtected = axios.create({
  baseURL: 'http://localhost:8000/api/',
  withCredentials: true,
});

setupInterceptors(apiProtected);

export default apiProtected;
