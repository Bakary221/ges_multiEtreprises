const prisma = require('../../config/prisma');

class AttendanceService {
  async scanAttendance(companyId, data) {
    const { employeeId, type, timestamp } = data;

    // Vérifier que l'employé appartient à la company
    const employee = await prisma.employee.findFirst({
      where: {
        id: parseInt(employeeId),
        companyId: parseInt(companyId),
        archived: false,
      },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: parseInt(employeeId),
        type,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
      include: {
        employee: {
          select: { id: true, name: true },
        },
      },
    });

    return attendance;
  }

  async getAttendances(companyId, filters = {}) {
    const { employeeId, dateFrom, dateTo, limit = 100, offset = 0 } = filters;

    const where = {
      employee: {
        companyId: parseInt(companyId),
        archived: false,
      },
    };

    if (employeeId) where.employeeId = parseInt(employeeId);
    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = new Date(dateFrom);
      if (dateTo) where.timestamp.lte = new Date(dateTo);
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: { id: true, name: true, position: true },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.attendance.count({ where });

    return { attendances, total, limit: parseInt(limit), offset: parseInt(offset) };
  }

  async getAttendanceSummary(companyId, filters = {}) {
    const { month, year } = filters;
    const startDate = new Date(year || new Date().getFullYear(), month ? month - 1 : 0, 1);
    const endDate = new Date(year || new Date().getFullYear(), month ? month : 12, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        employee: {
          companyId: parseInt(companyId),
          archived: false,
        },
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        employee: {
          select: { id: true, name: true },
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Grouper par employé et calculer les stats
    const summary = {};
    attendances.forEach(att => {
      const empId = att.employee.id;
      if (!summary[empId]) {
        summary[empId] = {
          employee: att.employee,
          checkIns: 0,
          checkOuts: 0,
          totalHours: 0,
        };
      }

      if (att.type === 'CHECK_IN') {
        summary[empId].checkIns++;
      } else if (att.type === 'CHECK_OUT') {
        summary[empId].checkOuts++;
      }
    });

    return Object.values(summary);
  }
}

module.exports = new AttendanceService();