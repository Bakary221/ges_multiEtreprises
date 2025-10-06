import api from './api';

// Helper to get base path based on user role
const getBasePath = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === 'CAISSIER' ? '/caissier' : '';
};

export const payrollService = {
  // Create payrun
  createPayrun: async (payrunData) => {
    const response = await api.post('/payruns', payrunData);
    return response.data;
  },

  // Get all payslips
  getAllPayslips: async (params = {}) => {
    const { page = 1, limit = 10 } = params;
    const basePath = getBasePath();
    const response = await api.get(`${basePath}/payslips?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get payslip by ID
  getPayslipById: async (id) => {
    const basePath = getBasePath();
    const response = await api.get(`${basePath}/payslips/${id}`);
    return response.data;
  },

  // Download payslip PDF
  downloadPayslipPDF: async (id) => {
    const basePath = getBasePath();

    // First generate the PDF
    const generateResponse = await api.get(`${basePath}/payslips/${id}/pdf`);
    const pdfUrl = generateResponse.data.data.pdfUrl;

    // Then download the actual PDF file directly from backend
    // Since Vite proxy only handles /api, we need to fetch from backend directly
    const backendUrl = 'http://localhost:3000'; // Backend URL
    const fullPdfUrl = `${backendUrl}${pdfUrl}`;

    const downloadResponse = await fetch(fullPdfUrl);
    if (!downloadResponse.ok) {
      throw new Error(`Failed to download PDF: ${downloadResponse.status} ${downloadResponse.statusText}`);
    }
    return await downloadResponse.blob();
  },

  // Get all payruns (Admin)
  getAllPayruns: async (params = {}) => {
    const { page = 1, limit = 10 } = params;
    const response = await api.get(`/payruns?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Update payrun status
  updatePayrunStatus: async (payrunId, statusData) => {
    const response = await api.patch(`/payruns/${payrunId}/status`, statusData);
    return response.data;
  },

  // Get current employee payslips
  getCurrentEmployeePayslips: async () => {
    const response = await api.get('/me/payslips');
    return response.data;
  },
};