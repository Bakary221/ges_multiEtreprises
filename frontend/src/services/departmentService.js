import api from './api';

export const departmentService = {
  // Get all departments
  getAllDepartments: async (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/departments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);

    if (response.data.success) {
      const { departments, total, totalPages, currentPage, limit } = response.data.data;
      return {
        success: true,
        data: {
          departments,
          total,
          totalPages,
          currentPage,
          limit
        }
      };
    }

    throw new Error(response.data.message || 'Failed to fetch departments');
  },

  // Create department
  createDepartment: async (departmentData) => {
    const response = await api.post('/departments', departmentData);
    return response.data;
  },
};