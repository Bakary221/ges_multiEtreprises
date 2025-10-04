const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

class SuperAdminService {
  async createCompany(data) {
    const { name, settings, currency, logo, primaryColor, secondaryColor } = data;

    const company = await prisma.company.create({
      data: {
        name,
        settings: settings || {},
        currency: currency || 'EUR',
        logo,
        primaryColor,
        secondaryColor,
      },
    });

    return company;
  }

  async getCompanies() {
    const companies = await prisma.company.findMany({
      include: {
        users: {
          where: { role: 'ADMIN' },
          select: {
            id: true,
            email: true,
            employee: {
              select: { name: true },
            },
          },
        },
        employees: true,
        payruns: {
          include: {
            payslips: {
              select: { netSalary: true },
            },
          },
        },
        _count: {
          select: { employees: true },
        },
      },
    });

    // Calculate totals
    return companies.map(company => ({
      ...company,
      employeeCount: company._count.employees,
      adminName: company.users.length > 0
        ? (company.users[0].employee?.name || company.users[0].email)
        : null,
      totalPayroll: company.payruns.reduce((total, payrun) =>
        total + payrun.payslips.reduce((sum, payslip) => sum + payslip.netSalary, 0), 0
      ),
    }));
  }

  async getCompanyById(id) {
    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: {
          select: { id: true, email: true, role: true, status: true },
        },
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    return company;
  }

  async updateCompany(id, data) {
    const { name, settings, currency, logo, primaryColor, secondaryColor } = data;

    const company = await prisma.company.update({
      where: { id: parseInt(id) },
      data: {
        name,
        settings,
        currency,
        logo,
        primaryColor,
        secondaryColor,
      },
    });

    return company;
  }

  async deleteCompany(id) {
    // Vérifier si la company a des utilisateurs actifs
    const userCount = await prisma.user.count({
      where: { companyId: parseInt(id) },
    });

    if (userCount > 0) {
      throw new Error('Cannot delete company with active users');
    }

    await prisma.company.delete({
      where: { id: parseInt(id) },
    });

    return { message: 'Company deleted successfully' };
  }

  async createUserForCompany(companyId, data) {
    const { email, password, role } = data;

    if (!['ADMIN', 'CAISSIER'].includes(role)) {
      throw new Error('Invalid role for company user');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        companyId: parseInt(companyId),
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        company: { select: { id: true, name: true } },
      },
    });

    return user;
  }

  async getLogs(filters = {}) {
    const { companyId, userId, action, limit = 100, offset = 0 } = filters;

    const where = {};
    if (companyId) where.companyId = parseInt(companyId);
    if (userId) where.userId = parseInt(userId);
    if (action) where.action = action;

    const logs = await prisma.log.findMany({
      where,
      include: {
        user: { select: { email: true } },
        company: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.log.count({ where });

    return { logs, total, limit: parseInt(limit), offset: parseInt(offset) };
  }

  async uploadFile(file) {
    // Simulation d'upload - en vrai, utiliser S3 ou stockage local
    const fileUrl = `https://storage.example.com/${file.filename}`;

    return {
      filename: file.originalname,
      url: fileUrl,
      size: file.size,
    };
  }

  async getDashboardStats() {
    // Get payroll data for the last 6 months
    const payrollData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toISOString().slice(0, 7); // YYYY-MM format

      const totalPayroll = await prisma.payrun.aggregate({
        where: { month },
        _sum: { totalAmount: true }
      });

      payrollData.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        amount: totalPayroll._sum.totalAmount || 0
      });
    }

    // Get employee distribution by department
    const departmentStats = await prisma.employee.groupBy({
      by: ['departmentId'],
      _count: { id: true },
    });

    // Get department names
    const departmentIds = departmentStats.map(stat => stat.departmentId);
    const departments = await prisma.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true }
    });

    const departmentMap = departments.reduce((acc, dept) => {
      acc[dept.id] = dept.name;
      return acc;
    }, {});

    // Aggregate counts by department name
    const aggregatedDistribution = departmentStats.reduce((acc, stat) => {
      const deptName = departmentMap[stat.departmentId] || 'Inconnu';
      if (!acc[deptName]) {
        acc[deptName] = 0;
      }
      acc[deptName] += stat._count.id;
      return acc;
    }, {});

    const employeeDistribution = Object.entries(aggregatedDistribution).map(([department, count]) => ({
      department,
      count
    }));

    // Get attendance data for the last 7 days
    const attendanceData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });

      const presentCount = await prisma.attendance.count({
        where: {
          timestamp: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
          },
          type: 'CHECK_IN'
        }
      });

      const absentCount = await prisma.employee.count() - presentCount;

      attendanceData.push({
        day: dayName,
        present: presentCount,
        absent: absentCount
      });
    }

    return {
      payrollData,
      employeeDistribution,
      attendanceData
    };
  }
}

module.exports = new SuperAdminService();