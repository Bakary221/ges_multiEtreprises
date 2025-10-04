const prisma = require('../config/prisma');

class ReportService {
  async getPayrollSummary(companyId, filters = {}) {
    const { month, year } = filters;
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();
    const monthString = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

    const payrun = await prisma.payrun.findFirst({
      where: {
        companyId: parseInt(companyId),
        month: monthString,
      },
      include: {
        _count: {
          select: { payslips: true },
        },
      },
    });

    if (!payrun) {
      return {
        month: monthString,
        totalAmount: 0,
        payslipsCount: 0,
        status: 'not_generated',
      };
    }

    const paidCount = await prisma.payment.count({
      where: {
        payslip: {
          payrunId: payrun.id,
        },
        status: 'COMPLETED',
      },
    });

    return {
      month: monthString,
      totalAmount: payrun.totalAmount,
      payslipsCount: payrun._count.payslips,
      paidCount,
      pendingCount: payrun._count.payslips - paidCount,
      status: 'generated',
    };
  }

  async getEmployeeDistribution(companyId) {
    const employees = await prisma.employee.findMany({
      where: {
        companyId: parseInt(companyId),
        archived: false,
      },
      select: {
        department: {
          select: { name: true },
        },
        position: true,
        status: true,
      },
    });

    const distribution = {
      byDepartment: {},
      byPosition: {},
      byStatus: {},
    };

    employees.forEach(emp => {
      // By department
      const dept = emp.department?.name || 'No Department';
      distribution.byDepartment[dept] = (distribution.byDepartment[dept] || 0) + 1;

      // By position
      distribution.byPosition[emp.position] = (distribution.byPosition[emp.position] || 0) + 1;

      // By status
      distribution.byStatus[emp.status] = (distribution.byStatus[emp.status] || 0) + 1;
    });

    return distribution;
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
    });

    const summary = {};
    attendances.forEach(att => {
      const empId = att.employee.id;
      if (!summary[empId]) {
        summary[empId] = {
          employee: att.employee,
          checkIns: 0,
          checkOuts: 0,
          totalRecords: 0,
        };
      }

      summary[empId].totalRecords++;
      if (att.type === 'CHECK_IN') {
        summary[empId].checkIns++;
      } else if (att.type === 'CHECK_OUT') {
        summary[empId].checkOuts++;
      }
    });

    return Object.values(summary);
  }

  async exportReport(companyId, type, filters = {}) {
    let data;
    let filename;

    switch (type) {
      case 'payroll':
        data = await this.getPayrollSummary(companyId, filters);
        filename = `payroll-summary-${filters.month || 'current'}.json`;
        break;
      case 'employees':
        data = await this.getEmployeeDistribution(companyId);
        filename = 'employee-distribution.json';
        break;
      case 'attendance':
        data = await this.getAttendanceSummary(companyId, filters);
        filename = `attendance-summary-${filters.month || 'current'}.json`;
        break;
      default:
        throw new Error('Invalid report type');
    }

    return {
      data,
      filename,
      type: 'application/json',
    };
  }
}

module.exports = new ReportService();