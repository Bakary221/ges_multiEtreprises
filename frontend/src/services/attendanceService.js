import api from './api';

export const attendanceService = {
  // Get all attendances
  getAllAttendances: async () => {
    const response = await api.get('/attendances');
    return response.data;
  },

  // Scan attendance (check-in/check-out)
  scanAttendance: async (employeeId, type) => {
    const response = await api.post('/attendances/scan', { employeeId, type });
    return response.data;
  },

  // Get attendance summary
  getAttendanceSummary: async (startDate, endDate) => {
    const response = await api.get('/reports/attendance-summary', {
      params: { startDate, endDate }
    });
    return response.data;
  },
};