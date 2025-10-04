const prisma = require('../../config/prisma');

class EmployeeService {
  async createEmployee(companyId, data) {
    const { name, position, salary, departmentId, contractType, startDate, endDate } = data;

    // Créer l'employé
    const employee = await prisma.employee.create({
      data: {
        name,
        position,
        salary: parseFloat(salary),
        departmentId: departmentId ? parseInt(departmentId) : null,
        companyId: parseInt(companyId),
      },
      include: {
        department: true,
        contract: true,
      },
    });

    // Créer le contrat si fourni
    if (contractType && startDate) {
      await prisma.contract.create({
        data: {
          type: contractType,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          salary: parseFloat(salary),
          employeeId: employee.id,
        },
      });
    }

    return employee;
  }

  async getEmployees(companyId, filters = {}) {
    const { departmentId, status, limit = 50, offset = 0 } = filters;

    const where = { archived: false };

    if (companyId) where.companyId = parseInt(companyId);

    if (departmentId) where.departmentId = parseInt(departmentId);
    if (status) where.status = status;

    const employees = await prisma.employee.findMany({
      where,
      include: {
        department: true,
        contract: true,
        company: {
          select: {
            logo: true,
            primaryColor: true,
            secondaryColor: true,
            users: {
              where: { role: 'ADMIN' },
              select: { email: true },
            },
          },
        },
        _count: {
          select: { attendances: true, timesheets: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.employee.count({ where });

    return { employees, total, limit: parseInt(limit), offset: parseInt(offset) };
  }

  async getEmployeeById(companyId, employeeId) {
    const employee = await prisma.employee.findFirst({
      where: {
        id: parseInt(employeeId),
        companyId: parseInt(companyId),
        archived: false,
      },
      include: {
        department: true,
        contract: true,
        attendances: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
        timesheets: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        payslips: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    return employee;
  }

  async updateEmployee(companyId, employeeId, data) {
    const { name, position, salary, departmentId } = data;

    const employee = await prisma.employee.updateMany({
      where: {
        id: parseInt(employeeId),
        companyId: parseInt(companyId),
        archived: false,
      },
      data: {
        name,
        position,
        salary: salary ? parseFloat(salary) : undefined,
        departmentId: departmentId ? parseInt(departmentId) : null,
      },
    });

    if (employee.count === 0) {
      throw new Error('Employee not found');
    }

    return await this.getEmployeeById(companyId, employeeId);
  }

  async updateEmployeeStatus(companyId, employeeId, status) {
    const validStatuses = ['ACTIVE', 'INACTIVE'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const employee = await prisma.employee.updateMany({
      where: {
        id: parseInt(employeeId),
        companyId: parseInt(companyId),
        archived: false,
      },
      data: { status },
    });

    if (employee.count === 0) {
      throw new Error('Employee not found');
    }

    return { message: `Employee status updated to ${status}` };
  }

  async archiveEmployee(companyId, employeeId) {
    const employee = await prisma.employee.updateMany({
      where: {
        id: parseInt(employeeId),
        companyId: parseInt(companyId),
        archived: false,
      },
      data: { archived: true },
    });

    if (employee.count === 0) {
      throw new Error('Employee not found');
    }

    return { message: 'Employee archived successfully' };
  }
}

module.exports = new EmployeeService();