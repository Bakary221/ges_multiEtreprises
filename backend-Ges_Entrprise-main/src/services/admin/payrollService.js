const prisma = require('../../config/prisma');

class PayrollService {
  async generatePayrun(companyId, data) {
    const { month } = data;

    // Vérifier s'il y a déjà un payrun pour ce mois
    const existingPayrun = await prisma.payrun.findFirst({
      where: {
        companyId: parseInt(companyId),
        month,
      },
    });

    if (existingPayrun) {
      throw new Error('Payrun already exists for this month');
    }

    // Récupérer tous les employés actifs avec leurs timesheets validés
    const employees = await prisma.employee.findMany({
      where: {
        companyId: parseInt(companyId),
        archived: false,
      },
      include: {
        timesheets: {
          where: {
            month,
            validated: true,
          },
        },
      },
    });

    let totalAmount = 0;
    const payslips = [];

    for (const employee of employees) {
      const timesheet = employee.timesheets[0];
      if (!timesheet) continue; // Pas de timesheet validé

      // Calcul simple : salaire mensuel basé sur heures travaillées
      // En vrai, il faudrait des règles plus complexes
      const hourlyRate = employee.salary / 160; // Hypothèse 160h/mois
      const grossSalary = timesheet.hoursWorked * hourlyRate;

      // Déductions simples (impôts, etc.) - simulation
      const deductions = grossSalary * 0.2; // 20% déductions
      const netSalary = grossSalary - deductions;

      totalAmount += netSalary;

      payslips.push({
        employeeId: employee.id,
        netSalary,
        grossSalary,
        deductions,
      });
    }

    // Créer le payrun
    const payrun = await prisma.payrun.create({
      data: {
        companyId: parseInt(companyId),
        month,
        totalAmount,
      },
    });

    // Créer les payslips
    for (const payslipData of payslips) {
      await prisma.payslip.create({
        data: {
          employeeId: payslipData.employeeId,
          payrunId: payrun.id,
          netSalary: payslipData.netSalary,
        },
      });
    }

    return {
      payrun,
      payslipsCount: payslips.length,
      totalAmount,
    };
  }

  async getPayslips(companyId, filters = {}) {
    const { employeeId, payrunId, limit = 50, offset = 0 } = filters;

    const where = {
      employee: {
        companyId: parseInt(companyId),
        archived: false,
      },
    };

    if (employeeId) where.employeeId = parseInt(employeeId);
    if (payrunId) where.payrunId = parseInt(payrunId);

    const payslips = await prisma.payslip.findMany({
      where,
      include: {
        employee: {
          select: { id: true, name: true, position: true },
        },
        payrun: {
          select: { id: true, month: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.payslip.count({ where });

    return { payslips, total, limit: parseInt(limit), offset: parseInt(offset) };
  }

  async getPayslipById(companyId, payslipId) {
    const payslip = await prisma.payslip.findFirst({
      where: {
        id: parseInt(payslipId),
        employee: {
          companyId: parseInt(companyId),
          archived: false,
        },
      },
      include: {
        employee: {
          select: { id: true, name: true, position: true, salary: true },
        },
        payrun: {
          select: { id: true, month: true, totalAmount: true },
        },
        payments: true,
      },
    });

    if (!payslip) {
      throw new Error('Payslip not found');
    }

    return payslip;
  }

  async generatePayslipPDF(companyId, payslipId) {
    const payslip = await this.getPayslipById(companyId, payslipId);

    // Simulation de génération PDF
    const pdfUrl = `https://storage.example.com/payslips/${payslipId}.pdf`;

    // Mettre à jour l'URL dans la DB
    await prisma.payslip.update({
      where: { id: parseInt(payslipId) },
      data: { pdfUrl },
    });

    return {
      payslipId,
      pdfUrl,
      generatedAt: new Date(),
    };
  }

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
}

module.exports = new PayrollService();