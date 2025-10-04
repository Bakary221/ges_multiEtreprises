const prisma = require('../config/prisma');

class NotificationService {
  async sendNotification(userId, data) {
    const { type, content } = data;

    const notification = await prisma.notification.create({
      data: {
        userId: parseInt(userId),
        type,
        content,
      },
    });

    return notification;
  }

  async getNotifications(userId, filters = {}) {
    const { status, limit = 20, offset = 0 } = filters;

    const where = { userId: parseInt(userId) };
    if (status) where.status = status;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.notification.count({ where });

    return { notifications, total, limit: parseInt(limit), offset: parseInt(offset) };
  }

  async markAsRead(userId, notificationId) {
    const notification = await prisma.notification.updateMany({
      where: {
        id: parseInt(notificationId),
        userId: parseInt(userId),
      },
      data: { status: 'READ' },
    });

    if (notification.count === 0) {
      throw new Error('Notification not found');
    }

    return { message: 'Notification marked as read' };
  }

  // Envoyer une notification à tous les employés d'une entreprise
  async sendToCompany(companyId, data) {
    const { type, content } = data;

    const users = await prisma.user.findMany({
      where: {
        companyId: parseInt(companyId),
        status: 'ACTIVE',
      },
    });

    const notifications = [];
    for (const user of users) {
      const notification = await this.sendNotification(user.id, { type, content });
      notifications.push(notification);
    }

    return notifications;
  }
}

module.exports = new NotificationService();