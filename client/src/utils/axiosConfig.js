import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Set dynamic base URL for production vs local
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

// Set up interceptor to append Token to outgoing requests
axios.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
