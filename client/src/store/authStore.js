import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: (() => {
        if (typeof window !== 'undefined') {
          const hash = window.location.hash;
          if (hash && hash.includes('access_token=')) {
            const params = new URLSearchParams(hash.replace('#', '?'));
            const t = params.get('access_token');
            if (t) {
              // Clean URL immediately
              window.history.replaceState(null, '', window.location.pathname);
              return t;
            }
          }
        }
        return null;
      })(),
      isAuthenticated: false, // Will be set in the return of create
      isloading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      login: async (email, password) => {
        set({ isloading: true, error: null });
        try {
          // Device tracking
          let deviceId = localStorage.getItem('vidyajaya_device_id');
          if (!deviceId) {
            deviceId = 'dv_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('vidyajaya_device_id', deviceId);
          }

          const response = await axios.post('/api/auth/login', { email, password, deviceId });
          const { user, token } = response.data;
          set({ 
            user, 
            token, 
            isAuthenticated: !!token,
            isloading: false 
          });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Login failed',
            isloading: false 
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isloading: true, error: null });
        try {
          // Device tracking
          let deviceId = localStorage.getItem('vidyajaya_device_id');
          if (!deviceId) {
            deviceId = 'dv_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('vidyajaya_device_id', deviceId);
          }

          const response = await axios.post('/api/auth/register', { ...userData, deviceId });
          const { user, token } = response.data;
          set({ 
            user, 
            token, 
            isAuthenticated: !!token,
            isloading: false 
          });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Registration failed',
            isloading: false 
          });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: !!token });
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      loadUser: async () => {
        const token = get().token;
        if (!token) return;

        try {
          const response = await axios.get('/api/auth/me');
          set({ user: response.data, isAuthenticated: true });
        } catch (error) {
          // Handled by interceptor, but we ensure state clear here too
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      forgotPassword: async (email) => {
        set({ isloading: true, error: null });
        try {
          await axios.post('/api/auth/forgot-password', { email });
          set({ isloading: false });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to send reset email',
            isloading: false 
          });
          throw error;
        }
      },

      resetPassword: async (newPassword) => {
        set({ isloading: true, error: null });
        try {
          // BUG 15 FIX: Use the correct change-password endpoint
          await axios.put('/api/auth/change-password', { newPassword });
          set({ isloading: false });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Password reset failed',
            isloading: false 
          });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        try {
          const { data, error } = await axios.post('/api/auth/google-url');
          if (error) throw error;
          if (data.url) {
            window.location.href = data.url;
          }
        } catch (error) {
          set({ error: 'Google login failed' });
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true);
      }
    }
  )
);
