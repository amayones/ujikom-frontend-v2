import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  selectedSchedule: null,
  selectedSeats: [],
  totalPrice: 0,

  setSchedule: (schedule) => {
    set({ selectedSchedule: schedule, selectedSeats: [], totalPrice: 0 });
  },

  toggleSeat: (seat) => {
    const { selectedSeats, selectedSchedule } = get();
    const seatId = seat.id || seat;
    const isSelected = selectedSeats.some(s => (s.id || s) === seatId);
    
    let newSeats;
    if (isSelected) {
      newSeats = selectedSeats.filter(s => (s.id || s) !== seatId);
    } else {
      newSeats = [...selectedSeats, seat];
    }
    
    // Calculate estimated price (will be verified by backend)
    const basePrice = selectedSchedule?.base_price || 50000;
    const totalPrice = newSeats.reduce((sum, s) => {
      // VIP seats typically 1.5x base price
      const seatPrice = s.category === 'vip' ? basePrice * 1.5 : basePrice;
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