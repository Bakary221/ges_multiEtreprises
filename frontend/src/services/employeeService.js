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

  // Get employees with filters and pagination (for admin)
  getEmployees: async (filters = {}) => {
    const queryParams = new URLSearchParams();

    // Add pagination
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);

    // Add filters
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.position) queryParams.append('position', filters.position);
    if (filters.department) queryParams.append('departmentId', filters.department);
    if (filters.status) queryParams.append('status', filters.status);

    const response = await api.get(`/employees?${queryParams}`);
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

  // Get company statistics for admin dashboard
  getCompanyStats: async () => {
    const response = await api.get('/company/stats');
    return response.data;
  },

  // Get employees with pagination and filters
  getEmployees: async (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/employees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);

    if (response.data.success) {
      const { employees, total, limit, offset, stats } = response.data.data;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          employees,
          total,
          totalPages,
          currentPage: Math.floor(offset / limit) + 1,
          limit,
          stats
        }
      };
    }

    throw new Error(response.data.message || 'Failed to fetch employees');

    return response.data;
  },

  // Get dashboard charts data
  getDashboardCharts: async () => {
    const response = await api.get('/dashboard/charts');
    return response.data;
  },
};