import api from '../lib/api.js';

export const adminApi = {
  // Films Management
  getFilms: async () => {
    const response = await api.get('/admin/films');
    return response.data;
  },

  createFilm: async (filmData) => {
    const response = await api.post('/admin/films', filmData);
    return response.data;
  },

  updateFilm: async (id, filmData) => {
    const response = await api.put(`/admin/films/${id}`, filmData);
    return response.data;
  },

  deleteFilm: async (id) => {
    const response = await api.delete(`/admin/films/${id}`);
    return response.data;
  },

  // Users Management
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  toggleUserStatus: async (id) => {
    const response = await api.post(`/admin/users/${id}/toggle-status`);
    return response.data;
  },

  resetUserPassword: async (id, password) => {
    const response = await api.post(`/admin/users/${id}/reset-password`, { password });
    return response.data;
  },

  // Schedules Management
  getSchedules: async () => {
    const response = await api.get('/admin/schedules');
    return response.data;
  },

  createSchedule: async (scheduleData) => {
    const response = await api.post('/admin/schedules', scheduleData);
    return response.data;
  },

  updateSchedule: async (id, scheduleData) => {
    const response = await api.put(`/admin/schedules/${id}`, scheduleData);
    return response.data;
  },

  deleteSchedule: async (id) => {
    const response = await api.delete(`/admin/schedules/${id}`);
    return response.data;
  },

  // Prices Management
  getPrices: async () => {
    const response = await api.get('/admin/prices');
    return response.data;
  },

  createPrice: async (priceData) => {
    const response = await api.post('/admin/prices', priceData);
    return response.data;
  },

  updatePrice: async (id, priceData) => {
    const response = await api.put(`/admin/prices/${id}`, priceData);
    return response.data;
  },

  deletePrice: async (id) => {
    const response = await api.delete(`/admin/prices/${id}`);
    return response.data;
  },

  // Seats Management
  getSeats: async () => {
    const response = await api.get('/admin/seats');
    return response.data;
  },

  createSeat: async (seatData) => {
    const response = await api.post('/admin/seats', seatData);
    return response.data;
  },

  updateSeat: async (id, seatData) => {
    const response = await api.put(`/admin/seats/${id}`, seatData);
    return response.data;
  },

  deleteSeat: async (id) => {
    const response = await api.delete(`/admin/seats/${id}`);
    return response.data;
  }
};