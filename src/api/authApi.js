import api from '../lib/api.js';

export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/profile', userData);
    return response.data;
  }
};