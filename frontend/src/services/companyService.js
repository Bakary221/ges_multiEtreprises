import api from './api';

export const companyService = {
  getAllCompanies: async () => {
    const response = await api.get('/companies');
    return response.data;
  },

  getCompanyById: async (id) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  createCompany: async (companyData) => {
    const response = await api.post('/companies', companyData);
    return response.data;
  },

  updateCompany: async (id, companyData) => {
    const response = await api.put(`/companies/${id}`, companyData);
    return response.data;
  },

  deleteCompany: async (id) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  },

  impersonateCompany: async (companyId) => {
    const response = await api.post(`/auth/impersonate/${companyId}`);
    return response.data.data; // Return { accessToken, refreshToken, user }
  },

  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  createCompanyWithAdmin: async (companyData) => {
    const response = await api.post('/companies/with-admin', companyData);
    return response.data;
  },

  revertImpersonate: async () => {
    const response = await api.post('/auth/revert-impersonate');
    return response.data.data; // Return { accessToken, refreshToken, user }
  },
};