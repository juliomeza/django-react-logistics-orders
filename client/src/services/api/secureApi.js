import axios from 'axios';

const apiProtected = axios.create({
  baseURL: 'http://localhost:8000/api/',
  withCredentials: true,
});

export default apiProtected;
