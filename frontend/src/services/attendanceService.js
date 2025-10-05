import api from './api';

export const attendanceService = {
  // Get all attendances
  getAllAttendances: async (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/attendances${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);

    if (response.data.success) {
      const { attendances, total, totalPages, currentPage, limit } = response.data.data;
      return {
        success: true,
        data: {
          attendances,
          total,
          totalPages,
          currentPage,
          limit
        }
      };
    }

    throw new Error(response.data.message || 'Failed to fetch attendances');
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