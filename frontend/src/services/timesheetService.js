import api from './api';

export const timesheetService = {
  // Get all timesheets
  getAllTimesheets: async () => {
    const response = await api.get('/timesheets');
    return response.data;
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