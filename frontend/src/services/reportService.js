import api from './api';

export const reportService = {
  getPayrollSummary: async (period) => {
    const response = await api.get('/reports/payroll-summary', { params: { period } });
    return response.data;
  },

  getEmployeeDistribution: async () => {
    const response = await api.get('/reports/employee-distribution');
    return response.data;
  },

  getAttendanceSummary: async (startDate, endDate) => {
    const response = await api.get('/reports/attendance-summary', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  exportReport: async (type, format = 'json') => {
    const response = await api.get(`/reports/export/${type}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // SuperAdmin specific reports
  getGlobalStats: async () => {
    // This would be a custom endpoint for superadmin global stats
    const response = await api.get('/superadmin/stats');
    return response.data;
  },
};