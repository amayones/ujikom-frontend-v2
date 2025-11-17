import api from '../lib/api';

export const discountApi = {
  getAll: () => api.get('/admin/discounts'),
  
  getById: (id) => api.get(`/admin/discounts/${id}`),
  
  create: (data) => api.post('/admin/discounts', data),
  
  update: (id, data) => api.put(`/admin/discounts/${id}`, data),
  
  delete: (id) => api.delete(`/admin/discounts/${id}`),
  
  verify: (code) => api.post('/discounts/verify', { code })
};
