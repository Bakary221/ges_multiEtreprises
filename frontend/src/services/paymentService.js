import api from './api';

// Helper to get base path based on user role
const getBasePath = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === 'CAISSIER' ? '/caissier' : '';
};

export const paymentService = {
  // Create payment (Admin/Caissier)
  createPayment: async (paymentData) => {
    const basePath = getBasePath();
    const response = await api.post(`${basePath}/payments`, paymentData);
    return response.data;
  },

  // Get all payments
  getAllPayments: async () => {
    const basePath = getBasePath();
    const response = await api.get(`${basePath}/payments`);
    return response.data;
  },

  // Download receipt PDF
  downloadReceiptPDF: async (id) => {
    const basePath = getBasePath();
    const response = await api.get(`${basePath}/payments/${id}/receipt`, {
      responseType: 'blob'
    });
    return response.data;
  },
};