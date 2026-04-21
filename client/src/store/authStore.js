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

      login: async (email, password) => {
        set({ isloading: true, error: null });
        try {
          const response = await axios.post('/api/auth/login', { email, password });
          set({ 
            user: response.data.user, 
            token: response.data.token, 
            isAuthenticated: true,
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
          set({ 
            user: response.data.user, 
            token: response.data.token, 
            isAuthenticated: true,
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
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);
