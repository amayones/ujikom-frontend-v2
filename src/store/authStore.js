import { create } from 'zustand';
import { authApi } from '../api/authApi.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  isInitialized: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await authApi.login(email, password);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, loading: false });
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      const response = await authApi.register(userData);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, loading: false });
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await authApi.updateProfile(userData);
      set(state => ({ user: { ...state.user, ...response.data } }));
      return response;
    } catch (error) {
      throw error;
    }
  },

  initAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authApi.getProfile();
        set({ user: response.data, token, isAuthenticated: true, isInitialized: true });
      } catch (error) {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
      }
    } else {
      set({ isInitialized: true });
    }
  }
}));