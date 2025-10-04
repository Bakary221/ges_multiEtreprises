const prisma = require('../config/prisma');
const webhookService = require('./webhookService');

class CaissierService {
  async getEmployeesSimplified(companyId) {
    const employees = await prisma.employee.findMany({
      where: {
        companyId: parseInt(companyId),
        archived: false,
      },
      select: {
        id: true,
        name: true,
        position: true,
        salary: true,
        department: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return employees;
  }

  async getValidatedTimesheets(companyId, filters = {}) {
    const { limit = 50, offset = 0 } = filters;

    const timesheets = await prisma.timesheet.findMany({
      where: {
        validated: true,
        employee: {
          companyId: parseInt(companyId),
          archived: false,
        },
      },
      include: {
        employee: {
          select: { id: true, name: true, position: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.timesheet.count({
      where: {
        validated: true,
        employee: {
          companyId: parseInt(companyId),
          archived: false,
        },
      },
    });

    return { timesheets, total, limit: parseInt(limit), offset: parseInt(offset) };
  }

  async createPayment(companyId, data) {
    const { payslipId, method } = data;

    // Vérifier que le payslip appartient à la company
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
          select: { id: true, name: true },
        },
      },
    });

    if (!payslip) {
      throw new Error('Payslip not found');
    }

    // Vérifier s'il y a déjà un paiement
    const existingPayment = await prisma.payment.findFirst({
      where: { payslipId: parseInt(payslipId) },
    });

    if (existingPayment) {
      throw new Error('Payment already exists for this payslip');
    }

    const payment = await prisma.payment.create({
      data: {
        payslipId: parseInt(payslipId),
        method,
        status: 'COMPLETED', // Marqué comme payé immédiatement
        date: new Date(),
      },
      include: {
        payslip: {
          include: {
            employee: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // Trigger webhook notification
    await webhookService.notifyPaymentCompleted(companyId, {
      paymentId: payment.id,
      payslipId: payment.payslipId,
      employeeId: payment.payslip.employee.id,
      employeeName: payment.payslip.employee.name,
      amount: payment.payslip.netSalary,
      method: payment.method,
      date: payment.date,
    });

    return payment;
  }

  async getPayments(companyId, filters = {}) {
    const { payslipId, status, limit = 50, offset = 0 } = filters;

    const where = {
      payslip: {
        employee: {
          companyId: parseInt(companyId),
          archived: false,
        },
      },
    };

    if (payslipId) where.payslipId = parseInt(payslipId);
    if (status) where.status = status;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        payslip: {
          include: {
            employee: {
              select: { id: true, name: true, position: true },
            },
            payrun: {
              select: { month: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.payment.count({ where });

    return { payments, total, limit: parseInt(limit), offset: parseInt(offset) };
  }

  async scanAttendance(companyId, data) {
    // Vérifier les settings de la company pour permettre le scan par caissier
    const company = await prisma.company.findUnique({
      where: { id: parseInt(companyId) },
      select: { settings: true },
    });

    if (!company?.settings?.allowCaissierAttendanceScan) {
      throw new Error('Attendance scanning not allowed for caissiers');
    }

    const attendanceService = require('./admin/attendanceService');
    return await attendanceService.scanAttendance(companyId, data);
  }

  async generateReceiptPDF(companyId, paymentId) {
    const payment = await prisma.payment.findFirst({
      where: {
        id: parseInt(paymentId),
        payslip: {
          employee: {
            companyId: parseInt(companyId),
            archived: false,
          },
        },
      },
      include: {
        payslip: {
          include: {
            employee: {
              select: { id: true, name: true },
            },
            payrun: {
              select: { month: true },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Simulation de génération PDF de reçu
    const pdfUrl = `https://storage.example.com/receipts/${paymentId}.pdf`;

    return {
      paymentId,
      pdfUrl,
      generatedAt: new Date(),
    };
  }
}

module.exports = new CaissierService();