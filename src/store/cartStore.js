import { create } from 'zustand';
import api from '../lib/api';

export const useCartStore = create((set, get) => ({
  selectedSchedule: null,
  selectedSeats: [],
  totalPrice: 0,
  prices: {},

  setSchedule: (schedule) => {
    set({ selectedSchedule: schedule, selectedSeats: [], totalPrice: 0 });
    get().fetchPrices(schedule);
  },

  fetchPrices: async (schedule) => {
    try {
      const response = await api.get('/admin/prices');
      const pricesData = response.data.data || response.data;
      
      // Determine day type from schedule
      const showDate = new Date(schedule.show_time);
      const dayOfWeek = showDate.getDay();
      const dayType = (dayOfWeek === 0 || dayOfWeek === 6) ? 'weekend' : 'weekday';
      
      // Create price map
      const priceMap = {};
      pricesData.forEach(p => {
        if (p.day_type === dayType) {
          priceMap[p.seat_category] = parseFloat(p.price);
        }
      });
      
      set({ prices: priceMap });
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    }
  },

  toggleSeat: (seat) => {
    const { selectedSeats, prices } = get();
    const seatId = seat.id || seat;
    const isSelected = selectedSeats.some(s => (s.id || s) === seatId);
    
    let newSeats;
    if (isSelected) {
      newSeats = selectedSeats.filter(s => (s.id || s) !== seatId);
    } else {
      newSeats = [...selectedSeats, seat];
    }
    
    // Calculate price using fetched prices
    const totalPrice = newSeats.reduce((sum, s) => {
      const seatPrice = prices[s.category] || 50000;
      return sum + seatPrice;
    }, 0);
    
    set({ selectedSeats: newSeats, totalPrice });
  },

  setTotalPrice: (price) => {
    set({ totalPrice: price });
  },

  clearCart: () => {
    set({ selectedSchedule: null, selectedSeats: [], totalPrice: 0 });
  },

  getOrderSummary: () => {
    const { selectedSchedule, selectedSeats, totalPrice } = get();
    return {
      schedule: selectedSchedule,
      seats: selectedSeats,
      total: totalPrice,
      seatCount: selectedSeats.length
    };
  }
}));