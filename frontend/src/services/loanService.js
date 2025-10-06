import api from './api';

const loanService = {
  // Créer un prêt
  createLoan: async (loanData) => {
    const response = await api.post('/caissier/loans', loanData);
    return response.data.data;
  },

  // Récupérer tous les prêts
  getAllLoans: async (filters = {}) => {
    const response = await api.get('/caissier/loans', { params: filters });
    return response.data.data.loans;
  },

  // Récupérer un prêt par ID
  getLoanById: async (loanId) => {
    const response = await api.get(`/caissier/loans/${loanId}`);
    return response.data.data;
  },

  // Effectuer un paiement sur un prêt
  makeLoanPayment: async (loanId, paymentData) => {
    const response = await api.post(`/caissier/loans/${loanId}/payments`, paymentData);
    return response.data.data;
  },

  // Annuler un prêt
  cancelLoan: async (loanId) => {
    const response = await api.patch(`/caissier/loans/${loanId}/cancel`);
    return response.data.data;
  },

  // Récupérer le résumé des prêts d'un employé
  getEmployeeLoanSummary: async (employeeId) => {
    const response = await api.get(`/caissier/employees/${employeeId}/loans/summary`);
    return response.data.data;
  },
};

export { loanService };