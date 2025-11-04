import { create } from 'zustand';
import { filmApi } from '../api/filmApi.js';

export const useFilmsStore = create((set, get) => ({
  films: { play_now: [], coming_soon: [] },
  schedules: [],
  seats: [],
  selectedFilm: null,
  loading: false,

  fetchFilms: async () => {
    set({ loading: true });
    try {
      const response = await filmApi.getFilms();
      set({ films: response.data, loading: false });
    } catch (error) {
      console.error('Error fetching films:', error);
      set({ loading: false });
    }
  },

  fetchFilmById: async (id) => {
    try {
      const response = await filmApi.getFilm(id);
      set({ selectedFilm: response.data });
      return response.data;
    } catch (error) {
      console.error('Error fetching film:', error);
      throw error;
    }
  },

  fetchSchedules: async (filmId) => {
    try {
      const response = await filmApi.getSchedules(filmId);
      set({ schedules: response.data });
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  },

  fetchSeats: async (scheduleId) => {
    try {
      const response = await filmApi.getSeats(scheduleId);
      set({ seats: response.data });
      return response.data;
    } catch (error) {
      console.error('Error fetching seats:', error);
      throw error;
    }
  },

  setSelectedFilm: (film) => set({ selectedFilm: film }),

  // Helper functions
  getPlayNowFilms: () => {
    const { films } = get();
    return films.play_now || [];
  },

  getComingSoonFilms: () => {
    const { films } = get();
    return films.coming_soon || [];
  },

  getAllFilms: () => {
    const { films } = get();
    return [...(films.play_now || []), ...(films.coming_soon || [])];
  }
}));