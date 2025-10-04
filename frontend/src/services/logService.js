import api from './api';

export const logService = {
  // Get company logs (Admin)
  getCompanyLogs: async () => {
    const response = await api.get('/logs/company');
    return response.data;
  },

  // Get all logs (SuperAdmin)
  getAllLogs: async () => {
    const response = await api.get('/logs');
    return response.data;
  },
};