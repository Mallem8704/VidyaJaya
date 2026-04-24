import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isloading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      login: async (email, password) => {
        set({ isloading: true, error: null });
        try {
          const response = await axios.post('/api/auth/login', { email, password });
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
          const response = await axios.post('/api/auth/register', userData);
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
