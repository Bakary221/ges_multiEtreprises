import api from './api';

export const leaveService = {
  // Get all leave requests (admin)
  getAllLeaveRequests: async () => {
    const response = await api.get('/leave-requests');
    return response.data;
  },

  // Approve leave request
  approveLeaveRequest: async (id) => {
    const response = await api.patch(`/leave-requests/${id}/approve`);
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