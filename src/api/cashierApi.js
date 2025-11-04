import api from '../lib/api.js';

export const cashierApi = {
  offlineOrder: async (orderData) => {
    const response = await api.post('/cashier/offline-order', orderData);
    return response.data;
  },

  processOnlineOrder: async (orderId) => {
    const response = await api.get(`/cashier/process-online/${orderId}`);
    return response.data;
  },

  printTicket: async (orderId) => {
    const response = await api.post(`/cashier/print-ticket/${orderId}`);
    return response.data;
  }
};