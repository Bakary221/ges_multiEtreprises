import api from './api';

export const notificationService = {
  // Send notification
  sendNotification: async (notificationData) => {
    const response = await api.post('/notifications/send', notificationData);
    return response.data;
  },

  // Get all notifications
  getAllNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
};