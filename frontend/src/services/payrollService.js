import api from './api';

export const payrollService = {
  // Create payrun
  createPayrun: async (payrunData) => {
    const response = await api.post('/payruns', payrunData);
    return response.data;
  },

  // Get all payslips
  getAllPayslips: async () => {
    const response = await api.get('/payslips');
    return response.data;
  },

  // Get payslip by ID
  getPayslipById: async (id) => {
    const response = await api.get(`/payslips/${id}`);
    return response.data;
  },

  // Download payslip PDF
  downloadPayslipPDF: async (id) => {
    const response = await api.get(`/payslips/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get current employee payslips
  getCurrentEmployeePayslips: async () => {
    const response = await api.get('/me/payslips');
    return response.data;
  },
};