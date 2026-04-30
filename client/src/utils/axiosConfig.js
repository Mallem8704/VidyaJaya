import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Clean up VITE_API_URL to ensure no trailing slash or /api
let envUrl = import.meta.env.VITE_API_URL || '';
if (envUrl.endsWith('/')) envUrl = envUrl.slice(0, -1);
if (envUrl.endsWith('/api')) envUrl = envUrl.slice(0, -4);

const BACKEND_URL = envUrl || ((import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000' 
    : 'https://vidyajaya.onrender.com');

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
