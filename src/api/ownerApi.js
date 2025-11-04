import api from '../lib/api.js';

export const ownerApi = {
  getReports: async (params = {}) => {
    const response = await api.get('/owner/reports', { params });
    return response.data;
  },

  exportPDF: async (params = {}) => {
    const response = await api.get('/owner/reports/export-pdf', { 
      params,
      responseType: 'blob' 
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'PDF downloaded successfully' };
  }
};