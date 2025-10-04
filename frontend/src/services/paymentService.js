import api from './api';

export const paymentService = {
  // Create payment (Admin/Caissier)
  createPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  // Get all payments
  getAllPayments: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  // Download receipt PDF
  downloadReceiptPDF: async (id) => {
    const response = await api.get(`/receipts/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },
};