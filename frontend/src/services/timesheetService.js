import api from './api';

export const timesheetService = {
  // Get all timesheets
  getAllTimesheets: async (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/timesheets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);

    if (response.data.success) {
      const { timesheets, total, totalPages, currentPage, limit } = response.data.data;
      return {
        success: true,
        data: {
          timesheets,
          total,
          totalPages,
          currentPage,
          limit
        }
      };
    }

    throw new Error(response.data.message || 'Failed to fetch timesheets');
  },

  // Create timesheet
  createTimesheet: async (timesheetData) => {
    const response = await api.post('/timesheets', timesheetData);
    return response.data;
  },

  // Validate timesheet
  validateTimesheet: async (id) => {
    const response = await api.patch(`/timesheets/${id}/validate`);
    return response.data;
  },

  // Get current employee timesheets
  getCurrentEmployeeTimesheets: async () => {
    const response = await api.get('/me/timesheets');
    return response.data;
  },
};