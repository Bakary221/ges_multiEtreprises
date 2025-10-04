import api from './api';

export const contractService = {
  // Get all contracts
  getAllContracts: async () => {
    const response = await api.get('/contracts');
    return response.data;
  },

  // Create contract
  createContract: async (contractData) => {
    const response = await api.post('/contracts', contractData);
    return response.data;
  },

  // Update contract
  updateContract: async (id, contractData) => {
    const response = await api.patch(`/contracts/${id}`, contractData);
    return response.data;
  },
};