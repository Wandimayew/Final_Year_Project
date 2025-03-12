// utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8086/api' || 'http://localhost:8082/api', // Adjust the base URL as needed
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;