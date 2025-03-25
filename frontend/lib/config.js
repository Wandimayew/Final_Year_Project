// utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.194.61.74:8080' , // Adjust the base URL as needed
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;