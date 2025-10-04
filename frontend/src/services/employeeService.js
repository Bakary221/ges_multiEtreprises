import api from './api';

export const employeeService = {
  // Get all employees for admin
  getAllEmployees: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  // Get employee by ID
  getEmployeeById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Create new employee
  createEmployee: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  // Update employee status
  updateEmployeeStatus: async (id, status) => {
    const response = await api.patch(`/employees/${id}/status`, { status });
    return response.data;
  },

  // Archive employee
  archiveEmployee: async (id) => {
    const response = await api.patch(`/employees/${id}/archive`);
    return response.data;
  },

  // Get current employee profile (for employee role)
  getCurrentEmployee: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  // Update current employee profile
  updateCurrentEmployeeProfile: async (profileData) => {
    const response = await api.put('/me/profile', profileData);
    return response.data;
  },
};