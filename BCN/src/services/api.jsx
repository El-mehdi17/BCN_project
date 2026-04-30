// src/services/api.js
import axios from 'axios';

const apii=import.meta.env.VITE_api_URL
const api = axios.create({
  baseURL: apii,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request:', config.method.toUpperCase(), config.url); 
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url);
    console.error('Error details:', error.response?.data);
    return Promise.reject(error);
  }
);

export default api;