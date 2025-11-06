import api from '../lib/api.js';

export const filmApi = {
  getFilms: async () => {
    const response = await api.get('/films');
    return response.data;
  },

  getFilm: async (id) => {
    const response = await api.get(`/films/${id}`);
    return response.data;
  },

  getSchedules: async (filmId) => {
    const response = await api.get(`/schedules/${filmId}`);
    return response.data;
  },

  getSeats: async (scheduleId) => {
    const response = await api.get(`/seats/${scheduleId}`);
    return response.data;
  },

  getStudios: async () => {
    const response = await api.get('/studios');
    return response.data;
  }
};