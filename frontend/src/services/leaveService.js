import api from './api';

export const leaveService = {
  // Get all leave requests (admin)
  getAllLeaveRequests: async (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/leave-requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);

    if (response.data.success) {
      const { leaveRequests, total, totalPages, currentPage, limit } = response.data.data;
      return {
        success: true,
        data: {
          leaveRequests,
          total,
          totalPages,
          currentPage,
          limit
        }
      };
    }

    throw new Error(response.data.message || 'Failed to fetch leave requests');
  },

  // Approve leave request
  approveLeaveRequest: async (id, status = 'APPROVED') => {
    const response = await api.patch(`/leave-requests/${id}/approve`, { status });
    return response.data;
  },

  // Get current employee leave requests
  getCurrentEmployeeLeaveRequests: async () => {
    const response = await api.get('/me/leave-requests');
    return response.data;
  },

  // Create leave request
  createLeaveRequest: async (leaveData) => {
    const response = await api.post('/me/leave-request', leaveData);
    return response.data;
  },
};