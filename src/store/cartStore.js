import { create } from 'zustand';
import api from '../lib/api';

export const useCartStore = create((set, get) => ({
  selectedSchedule: null,
  selectedSeats: [],
  totalPrice: 0,
  prices: {},
  discount: null,
  discountAmount: 0,

  setSchedule: (schedule) => {
    set({ selectedSchedule: schedule, selectedSeats: [], totalPrice: 0 });
    get().fetchPrices(schedule);
  },

  fetchPrices: async (schedule) => {
    try {
      const response = await api.get('/prices');
      const pricesData = response.data.data || response.data;
      
      // Determine day type from schedule
      const showDate = new Date(schedule.show_time || schedule.date);
      const dayOfWeek = showDate.getDay();
      const dayType = (dayOfWeek === 0 || dayOfWeek === 6) ? 'weekend' : 'weekday';
      
      // Find price for this day type
      const priceData = pricesData.find(p => p.day_type === dayType);
      const seatPrice = priceData ? parseFloat(priceData.price) : (dayType === 'weekend' ? 45000 : 35000);
      
      set({ prices: { seatPrice, dayType } });
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      // Fallback prices
      const showDate = new Date(schedule.show_time || schedule.date);
      const dayOfWeek = showDate.getDay();
      const dayType = (dayOfWeek === 0 || dayOfWeek === 6) ? 'weekend' : 'weekday';
      set({ prices: { seatPrice: dayType === 'weekend' ? 45000 : 35000, dayType } });
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
    
    // Calculate price using single seat price
    const seatPrice = prices.seatPrice || 35000;
    const totalPrice = newSeats.length * seatPrice;
    
    set({ selectedSeats: newSeats, totalPrice });
  },

  setTotalPrice: (price) => {
    set({ totalPrice: price });
  },

  applyDiscount: (discountData) => {
    const { totalPrice } = get();
    let discountAmount = 0;
    
    if (discountData.type === 'percentage') {
      discountAmount = totalPrice * (discountData.value / 100);
    } else {
      discountAmount = Math.min(discountData.value, totalPrice);
    }
    
    set({ discount: discountData, discountAmount });
  },

  removeDiscount: () => {
    set({ discount: null, discountAmount: 0 });
  },

  getFinalTotal: () => {
    const { totalPrice, discountAmount } = get();
    return Math.max(0, totalPrice - discountAmount);
  },

  clearCart: () => {
    set({ 
      selectedSchedule: null, 
      selectedSeats: [], 
      totalPrice: 0,
      discount: null,
      discountAmount: 0
    });
  },

  getOrderSummary: () => {
    const { selectedSchedule, selectedSeats, totalPrice, discount, discountAmount } = get();
    return {
      schedule: selectedSchedule,
      seats: selectedSeats,
      subtotal: totalPrice,
      discount: discount,
      discountAmount: discountAmount,
      total: get().getFinalTotal(),
      seatCount: selectedSeats.length
    };
  }
}));