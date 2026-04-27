import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Set dynamic base URL for production vs local
// IMPORTANT: Point this to your SERVER Render URL (not the frontend)
const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://vidyajaya-server.onrender.com';
axios.defaults.baseURL = BACKEND_URL;

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
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      const isAuthPath = url.includes('/api/auth/login') || 
                        url.includes('/api/auth/register');
      
      if (!isAuthPath) {
        // Only clear store and redirect if NOT on an auth-related request
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
