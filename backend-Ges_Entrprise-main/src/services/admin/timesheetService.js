const prisma = require('../../config/prisma');
const webhookService = require('../webhookService');

class TimesheetService {
  async createTimesheet(companyId, data) {
    const { employeeId, month, hoursWorked } = data;

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

    const timesheet = await prisma.timesheet.create({
      data: {
        employeeId: parseInt(employeeId),
        month,
        hoursWorked: parseFloat(hoursWorked),
      },
      include: {
        employee: {
          select: { id: true, name: true, position: true },
        },
      },
    });

    return timesheet;
  }

  async getTimesheets(companyId, filters = {}) {
    const { employeeId, month, validated, page = 1, limit = 10 } = filters;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      employee: {
        archived: false,
      },
    };

    // Only filter by companyId if it's provided (not for SuperAdmin)
    if (companyId && !isNaN(parseInt(companyId))) {
      where.employee.companyId = parseInt(companyId);
    }

    if (employeeId) where.employeeId = parseInt(employeeId);
    if (month) where.month = month;
    if (validated !== undefined) where.validated = validated === 'true';

    const [timesheets, total] = await Promise.all([
      prisma.timesheet.findMany({
        where,
        include: {
          employee: {
            select: { id: true, name: true, position: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: offset,
      }),
      prisma.timesheet.count({ where }),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    return {
      timesheets,
      total,
      totalPages,
      currentPage: parseInt(page),
      limit: parseInt(limit)
    };
  }

  async validateTimesheet(companyId, timesheetId) {
    // Vérifier que le timesheet appartient à la company
    const timesheet = await prisma.timesheet.findFirst({
      where: {
        id: parseInt(timesheetId),
        employee: {
          companyId: parseInt(companyId),
          archived: false,
        },
      },
    });

    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    const updatedTimesheet = await prisma.timesheet.update({
      where: { id: parseInt(timesheetId) },
      data: { validated: true },
      include: {
        employee: {
          select: { id: true, name: true, position: true },
        },
      },
    });

    // Trigger webhook notification
    await webhookService.notifyTimesheetValidated(companyId, {
      timesheetId: updatedTimesheet.id,
      employeeId: updatedTimesheet.employeeId,
      employeeName: updatedTimesheet.employee.name,
      month: updatedTimesheet.month,
      hoursWorked: updatedTimesheet.hoursWorked,
      validatedAt: new Date().toISOString(),
    });

    return updatedTimesheet;
  }

  async getTimesheetSummary(companyId, filters = {}) {
    const { month, year } = filters;
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();
    const monthString = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

    const timesheets = await prisma.timesheet.findMany({
      where: {
        month: monthString,
        employee: {
          companyId: parseInt(companyId),
          archived: false,
        },
      },
      include: {
        employee: {
          select: { id: true, name: true, salary: true },
        },
      },
    });

    const summary = {
      month: monthString,
      totalEmployees: timesheets.length,
      totalHours: timesheets.reduce((sum, ts) => sum + ts.hoursWorked, 0),
      validatedCount: timesheets.filter(ts => ts.validated).length,
      pendingCount: timesheets.filter(ts => !ts.validated).length,
      averageHours: timesheets.length > 0 ? timesheets.reduce((sum, ts) => sum + ts.hoursWorked, 0) / timesheets.length : 0,
    };

    return summary;
  }
}

module.exports = new TimesheetService();