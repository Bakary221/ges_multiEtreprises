import api from './api';

export const contractService = {
  // Get all contracts
  getAllContracts: async (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/contracts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);

    if (response.data.success) {
      const { contracts, total, totalPages, currentPage, limit } = response.data.data;
      return {
        success: true,
        data: {
          contracts,
          total,
          totalPages,
          currentPage,
          limit
        }
      };
    }

    throw new Error(response.data.message || 'Failed to fetch contracts');
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