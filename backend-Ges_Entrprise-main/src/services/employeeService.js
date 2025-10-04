const prisma = require('../config/prisma');

class EmployeeService {
  async getProfile(employeeId, companyId) {
    const employee = await prisma.employee.findFirst({
      where: {
        id: parseInt(employeeId),
        companyId: parseInt(companyId),
        archived: false,
      },
      include: {
        department: true,
        contract: true,
        company: {
          select: { id: true, name: true, currency: true },
        },
      },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    return employee;
  }

  async updateProfile(employeeId, companyId, data) {
    const { name, position } = data; // Limiter les champs modifiables par l'employé

    const employee = await prisma.employee.updateMany({
      where: {
        id: parseInt(employeeId),
        companyId: parseInt(companyId),
        archived: false,
      },
      data: { name, position },
    });

    if (employee.count === 0) {
      throw new Error('Employee not found');
    }

    return await this.getProfile(employeeId, companyId);
  }

  async getMyPayslips(employeeId, companyId, filters = {}) {
    const { limit = 12, offset = 0 } = filters;

    const payslips = await prisma.payslip.findMany({
      where: {
        employeeId: parseInt(employeeId),
        employee: {
          companyId: parseInt(companyId),
          archived: false,
        },
      },
      include: {
        payrun: {
          select: { id: true, month: true },
        },
        payments: {
          select: { id: true, status: true, method: true, date: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.payslip.count({
      where: {
        employeeId: parseInt(employeeId),
        employee: {
          companyId: parseInt(companyId),
          archived: false,
        },
      },
    });

    return { payslips, total, limit: parseInt(limit), offset: parseInt(offset) };
  }

  async getMyTimesheets(employeeId, companyId, filters = {}) {
    const { limit = 12, offset = 0 } = filters;

    const timesheets = await prisma.timesheet.findMany({
      where: {
        employeeId: parseInt(employeeId),
        employee: {
          companyId: parseInt(companyId),
          archived: false,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.timesheet.count({
      where: {
        employeeId: parseInt(employeeId),
        employee: {
          companyId: parseInt(companyId),
          archived: false,
        },
      },
    });

    return { timesheets, total, limit: parseInt(limit), offset: parseInt(offset) };
  }

  async createLeaveRequest(employeeId, companyId, data) {
    const { startDate, endDate, reason } = data;

    // Vérifier que l'employé existe
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

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: parseInt(employeeId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      },
    });

    return leaveRequest;
  }

  async getMyLeaveRequests(employeeId, companyId, filters = {}) {
    const { status, limit = 20, offset = 0 } = filters;

    const where = {
      employeeId: parseInt(employeeId),
      employee: {
        companyId: parseInt(companyId),
        archived: false,
      },
    };

    if (status) where.status = status;

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.leaveRequest.count({ where });

    return { leaveRequests, total, limit: parseInt(limit), offset: parseInt(offset) };
  }
}

module.exports = new EmployeeService();