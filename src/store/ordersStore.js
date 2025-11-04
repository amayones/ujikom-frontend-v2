import { create } from 'zustand';
import { orderApi } from '../api/orderApi.js';

export const useOrdersStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,

  fetchOrders: async () => {
    set({ loading: true });
    try {
      const response = await orderApi.getOrders();
      const ordersData = response.data?.data || response.data;
      set({ orders: Array.isArray(ordersData) ? ordersData : ordersData.data || [], loading: false });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ orders: [], loading: false });
    }
  },

  fetchOrderById: async (id) => {
    try {
      const response = await orderApi.getOrder(id);
      set({ currentOrder: response.data });
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  checkout: async (orderData) => {
    set({ loading: true });
    try {
      const response = await orderApi.checkout(orderData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // Helper functions
  getOrderById: (id) => {
    const { orders } = get();
    return orders.find(order => order.id === parseInt(id));
  }
}));