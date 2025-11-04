import api from '../lib/api.js';

export const orderApi = {
  checkout: async (orderData) => {
    const response = await api.post('/checkout', orderData);
    return response.data;
  },

  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id) => {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  }
};