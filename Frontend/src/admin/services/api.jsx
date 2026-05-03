// src/admin/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_api_URL,
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: false,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
