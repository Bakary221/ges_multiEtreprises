const prisma = require('../../config/prisma');
const badgeService = require('./badgeService');
const fs = require('fs');
const path = require('path');

class EmployeeService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../../../uploads/badges');
    console.log('📁 EMPLOYEE_SERVICE: uploadsDir set to:', this.uploadsDir);
  }

  // Check if badge exists for employee
  checkBadgeExists(employeeId, matricule = null) {
    try {
      // Try to find any PDF file with this employee ID
      const files = fs.readdirSync(this.uploadsDir);

      // First try new format (with employee ID)
      let badgeFile = files.find(file => file === `badge_${employeeId}.pdf`);
      if (badgeFile) {
        return `/uploads/badges/${badgeFile}`;
      }

      // If not found, try old format (with matricule) - for backward compatibility
      if (matricule) {
        badgeFile = files.find(file => file === `badge_${matricule}.pdf`);
        if (badgeFile) {
          return `/uploads/badges/${badgeFile}`;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // Generate unique matricule for employee
  async generateMatricule(companyId) {
    const company = await prisma.company.findUnique({
      where: { id: parseInt(companyId) },
      select: { name: true }
    });

    // Get company prefix (first 3 letters uppercase)
    const prefix = company.name.substring(0, 3).toUpperCase();

    // Get next employee number for this company
    const lastEmployee = await prisma.employee.findFirst({
      where: { companyId: parseInt(companyId) },
      orderBy: { id: 'desc' },
      select: { id: true }
    });

    const nextNumber = lastEmployee ? lastEmployee.id + 1 : 1;
    const paddedNumber = nextNumber.toString().padStart(4, '0');

    return `${prefix}-${paddedNumber}`;
  }

  async createEmployee(companyId, data) {
    const { name, position, salary, email, departmentId, contractType, startDate, endDate } = data;

    // Generate unique matricule
    const matricule = await this.generateMatricule(companyId);

    // Créer l'employé (sans compte utilisateur)
    const employee = await prisma.employee.create({
      data: {
        matricule,
        name,
        position,
        salary: parseFloat(salary),
        email,
        departmentId: departmentId ? parseInt(departmentId) : null,
        companyId: parseInt(companyId),
      },
      include: {
        department: true,
        contract: true,
        company: true,
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

    // Generate employee badge automatically
    try {
      const badge = await badgeService.generateEmployeeBadge(employee.id);
      console.log('Badge generated for employee:', employee.matricule, badge.badgeUrl);
    } catch (badgeError) {
      console.error('Failed to generate badge for employee:', employee.matricule, badgeError.message);
      // Don't fail employee creation if badge generation fails
    }

    return employee;
  }

  async getEmployees(companyId, filters = {}) {
    const { departmentId, status, search, position, page = 1, limit = 10 } = filters;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { archived: false };

    // Only filter by companyId if it's provided (not for SuperAdmin)
    if (companyId && !isNaN(parseInt(companyId))) {
      where.companyId = parseInt(companyId);
    }

    if (departmentId) where.departmentId = parseInt(departmentId);
    if (status) where.status = status;
    if (position) where.position = { contains: position, mode: 'insensitive' };

    // Search filter for name or email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            status: true,
          },
        },
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
      skip: offset,
    });

    // Add badge information to each employee
    const employeesWithBadges = employees.map(employee => ({
      ...employee,
      badgeUrl: this.checkBadgeExists(employee.id, employee.matricule)
    }));

    const total = await prisma.employee.count({ where });
    const totalPages = Math.ceil(total / parseInt(limit));

    // Calculate badge statistics (for all employees in company, not filtered)
    const statsWhere = { archived: false };
    if (companyId && !isNaN(parseInt(companyId))) {
      statsWhere.companyId = parseInt(companyId);
    }

    const allEmployees = await prisma.employee.findMany({
      where: statsWhere,
      select: { id: true, matricule: true }
    });

    const totalEmployeesCount = allEmployees.length;

    // Count PDF files for this company's employees
    let totalWithBadges = 0;
    try {
      const files = fs.readdirSync(this.uploadsDir);
      const pdfFiles = files.filter(file => file.endsWith('.pdf') && file.startsWith('badge_'));

      // Check which employees have badge files (using employee ID or matricule)
      allEmployees.forEach(employee => {
        // First try new format (with employee ID)
        let badgeFile = `badge_${employee.id}.pdf`;
        let hasBadge = pdfFiles.includes(badgeFile);

        // If not found, try old format (with matricule)
        if (!hasBadge && employee.matricule) {
          badgeFile = `badge_${employee.matricule}.pdf`;
          hasBadge = pdfFiles.includes(badgeFile);
        }

        if (hasBadge) {
          totalWithBadges++;
        }
      });
    } catch (error) {
      totalWithBadges = 0;
    }

    const totalWithoutBadges = totalEmployeesCount - totalWithBadges;

    return {
      employees: employeesWithBadges,
      total,
      totalPages,
      currentPage: parseInt(page),
      limit: parseInt(limit),
      stats: {
        totalWithBadges,
        totalWithoutBadges
      }
    };
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