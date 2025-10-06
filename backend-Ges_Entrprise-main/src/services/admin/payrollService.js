const prisma = require('../../config/prisma');
const { Parser } = require('json2csv');

class PayrollService {
  async generatePayrun(companyId, data) {
    console.log('🔄 PAYROLL_SERVICE: generatePayrun called with companyId:', companyId, 'data:', data);
    const { month } = data;
    console.log('🔄 PAYROLL_SERVICE: Extracted month:', month);

    // Vérifier s'il y a déjà un payrun pour ce mois
    console.log('🔄 PAYROLL_SERVICE: Checking for existing payrun with companyId:', parseInt(companyId), 'month:', month);
    const existingPayrun = await prisma.payrun.findFirst({
      where: {
        companyId: parseInt(companyId),
        month,
      },
    });

    console.log('🔄 PAYROLL_SERVICE: Existing payrun check result:', existingPayrun);

    if (existingPayrun) {
      console.log('❌ PAYROLL_SERVICE: Payrun already exists for this month');
      throw new Error('Payrun already exists for this month');
    }

    // Récupérer tous les employés actifs (bypass timesheet requirement for testing)
    console.log('🔄 PAYROLL_SERVICE: Fetching employees for companyId:', companyId);
    const employees = await prisma.employee.findMany({
      where: {
        companyId: parseInt(companyId),
        archived: false,
      },
    });

    console.log('🔄 PAYROLL_SERVICE: Found employees:', employees.length);
    console.log('🔄 PAYROLL_SERVICE: Employee details:', employees.map(e => ({ id: e.id, name: e.name, salary: e.salary })));

    let totalAmount = 0;
    const payslips = [];

    for (const employee of employees) {
      console.log('🔄 PAYROLL_SERVICE: Processing employee:', employee.id, employee.name);

      // Calcul simple : salaire mensuel fixe (bypass timesheet for testing)
      const grossSalary = employee.salary;
      const deductions = grossSalary * 0.2; // 20% déductions
      const netSalary = grossSalary - deductions;

      console.log('🔄 PAYROLL_SERVICE: Calculated for employee:', employee.id, {
        grossSalary,
        deductions,
        netSalary
      });

      totalAmount += netSalary;

      payslips.push({
        employeeId: employee.id,
        netSalary,
        grossSalary,
        deductions,
      });
    }

    console.log('🔄 PAYROLL_SERVICE: Total payslips to create:', payslips.length, 'Total amount:', totalAmount);

    // Vérifier qu'il y a au moins un payslip à créer
    if (payslips.length === 0) {
      console.log('❌ PAYROLL_SERVICE: No employees found for companyId:', companyId);
      throw new Error('Aucun employé trouvé pour cette entreprise. Impossible de générer le payrun.');
    }

    // Créer le payrun
    console.log('🔄 PAYROLL_SERVICE: Creating payrun with data:', {
      companyId: parseInt(companyId),
      month,
      totalAmount,
    });

    const payrun = await prisma.payrun.create({
      data: {
        companyId: parseInt(companyId),
        month,
        totalAmount,
      },
    });

    console.log('✅ PAYROLL_SERVICE: Payrun created successfully:', payrun);

    // Créer les payslips
    console.log('🔄 PAYROLL_SERVICE: Creating payslips...');
    for (const payslipData of payslips) {
      console.log('🔄 PAYROLL_SERVICE: Creating payslip for employee:', payslipData.employeeId);
      await prisma.payslip.create({
        data: {
          employeeId: payslipData.employeeId,
          payrunId: payrun.id,
          netSalary: payslipData.netSalary,
        },
      });
    }

    console.log('✅ PAYROLL_SERVICE: All payslips created successfully');

    // Notifier les caissiers de l'entreprise
    try {
      const notificationService = require('../notificationService');
      const caissiers = await prisma.user.findMany({
        where: {
          companyId: parseInt(companyId),
          role: 'CAISSIER',
          status: 'ACTIVE'
        }
      });

      for (const caissier of caissiers) {
        await notificationService.sendNotification(caissier.id, {
          type: 'PAYRUN_CREATED',
          content: `Nouveau payrun créé pour ${month}. ${payslips.length} bulletins de paie sont prêts pour traitement.`,
          metadata: {
            payrunId: payrun.id,
            month: month,
            payslipsCount: payslips.length,
            totalAmount: totalAmount
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications:', error);
      // Ne pas échouer la création du payrun si les notifications échouent
    }

    return {
      payrun,
      payslipsCount: payslips.length,
      totalAmount,
    };
  }

  async getPayslips(companyId, filters = {}) {
    const { employeeId, payrunId, limit = 50, offset = 0 } = filters;

    const where = {};

    // If companyId is provided, filter by company
    if (companyId) {
      where.employee = {
        companyId: parseInt(companyId),
        archived: false,
      };
    } else {
      // For SuperAdmin, include company info
      where.employee = {
        archived: false,
      };
    }

    if (employeeId) where.employeeId = parseInt(employeeId);
    if (payrunId) where.payrunId = parseInt(payrunId);

    const payslips = await prisma.payslip.findMany({
      where,
      include: {
        employee: {
          select: { id: true, name: true, position: true, matricule: true },
          include: companyId ? undefined : {
            company: {
              select: { id: true, name: true }
            }
          }
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

    // Générer le PDF réel
    const pdfService = require('../pdfService');
    const pdfResult = await pdfService.generatePayslipPDF(payslipId);

    // Mettre à jour l'URL dans la DB
    await prisma.payslip.update({
      where: { id: parseInt(payslipId) },
      data: { pdfUrl: pdfResult.pdfUrl },
    });

    return {
      payslipId,
      pdfUrl: pdfResult.pdfUrl,
      filepath: pdfResult.filepath,
      generatedAt: pdfResult.generatedAt,
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

  // CRUD pour Payruns
  async getPayruns(companyId, filters = {}) {
    const { page = 1, limit = 10, month, year } = filters;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { companyId: parseInt(companyId) };

    if (month) {
      if (year) {
        where.month = `${year}-${String(month).padStart(2, '0')}`;
      } else {
        // Filtrer par mois seulement (tous les années)
        where.month = { endsWith: `-${String(month).padStart(2, '0')}` };
      }
    } else if (year) {
      where.month = { startsWith: `${year}-` };
    }

    const payruns = await prisma.payrun.findMany({
      where,
      include: {
        _count: {
          select: { payslips: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: offset,
    });

    const total = await prisma.payrun.count({ where });

    return {
      payruns,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };
  }

  async getPayrunById(companyId, payrunId) {
    const payrun = await prisma.payrun.findFirst({
      where: {
        id: parseInt(payrunId),
        companyId: parseInt(companyId),
      },
      include: {
        payslips: {
          include: {
            employee: {
              select: { id: true, name: true, position: true, matricule: true },
            },
            payments: true,
          },
        },
        _count: {
          select: { payslips: true },
        },
      },
    });

    if (!payrun) {
      throw new Error('Payrun not found');
    }

    return payrun;
  }

  async updatePayrun(companyId, payrunId, data) {
    const payrun = await prisma.payrun.findFirst({
      where: {
        id: parseInt(payrunId),
        companyId: parseInt(companyId),
      },
    });

    if (!payrun) {
      throw new Error('Payrun not found');
    }

    const updatedPayrun = await prisma.payrun.update({
      where: { id: parseInt(payrunId) },
      data,
      include: {
        _count: {
          select: { payslips: true },
        },
      },
    });

    return updatedPayrun;
  }

  async updatePayrunStatus(companyId, payrunId, newStatus, userId) {
    const payrun = await prisma.payrun.findFirst({
      where: {
        id: parseInt(payrunId),
        companyId: parseInt(companyId),
      },
      include: {
        payslips: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!payrun) {
      throw new Error('Payrun not found');
    }

    // Validation des transitions de statut
    const validTransitions = {
      DRAFT: ['CALCULATED'],
      CALCULATED: ['VALIDATED', 'DRAFT'],
      VALIDATED: ['PAID'],
      PAID: ['CLOSED'],
      CLOSED: [], // Aucun changement possible
    };

    if (!validTransitions[payrun.status].includes(newStatus)) {
      throw new Error(`Transition de statut invalide: ${payrun.status} -> ${newStatus}`);
    }

    // Validations spécifiques
    if (newStatus === 'PAID') {
      // Vérifier que tous les payslips ont des paiements
      const unpaidPayslips = payrun.payslips.filter(p => p.payments.length === 0);
      if (unpaidPayslips.length > 0) {
        throw new Error('Tous les bulletins doivent être payés avant de marquer le payrun comme payé');
      }
    }

    if (newStatus === 'CLOSED') {
      // Vérifier que le statut est PAID
      if (payrun.status !== 'PAID') {
        throw new Error('Le payrun doit être marqué comme payé avant d\'être clôturé');
      }
    }

    const updatedPayrun = await prisma.payrun.update({
      where: { id: parseInt(payrunId) },
      data: { status: newStatus },
      include: {
        _count: {
          select: { payslips: true },
        },
      },
    });

    // Notifications
    try {
      const notificationService = require('../notificationService');
      const admins = await prisma.user.findMany({
        where: {
          companyId: parseInt(companyId),
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      });

      const caissiers = await prisma.user.findMany({
        where: {
          companyId: parseInt(companyId),
          role: 'CAISSIER',
          status: 'ACTIVE'
        }
      });

      const recipients = [...admins, ...caissiers];

      for (const recipient of recipients) {
        await notificationService.sendNotification(recipient.id, {
          type: 'PAYRUN_STATUS_UPDATED',
          content: `Le statut du payrun ${payrun.month} a été changé à ${newStatus}`,
          metadata: {
            payrunId: payrun.id,
            month: payrun.month,
            oldStatus: payrun.status,
            newStatus: newStatus,
            updatedBy: userId
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications:', error);
    }

    return updatedPayrun;
  }

  async deletePayrun(companyId, payrunId) {
    const payrun = await prisma.payrun.findFirst({
      where: {
        id: parseInt(payrunId),
        companyId: parseInt(companyId),
      },
      include: {
        payslips: true,
      },
    });

    if (!payrun) {
      throw new Error('Payrun not found');
    }

    // Vérifier s'il y a des paiements effectués
    const paymentsCount = await prisma.payment.count({
      where: {
        payslip: {
          payrunId: parseInt(payrunId),
        },
        status: 'COMPLETED',
      },
    });

    if (paymentsCount > 0) {
      throw new Error('Impossible de supprimer un payrun avec des paiements effectués');
    }

    // Supprimer les payslips et le payrun
    await prisma.payslip.deleteMany({
      where: { payrunId: parseInt(payrunId) },
    });

    await prisma.payrun.delete({
      where: { id: parseInt(payrunId) },
    });

    return { message: 'Payrun supprimé avec succès' };
  }

  // Exporter la liste des employés pour un payrun
  async exportPayrunEmployees(companyId, payrunId, format = 'csv') {
    const payrun = await this.getPayrunById(companyId, payrunId);

    const employees = payrun.payslips.map(payslip => ({
      matricule: payslip.employee.matricule,
      nom: payslip.employee.name,
      poste: payslip.employee.position,
      salaireBrut: payslip.employee.salary,
      salaireNet: payslip.netSalary,
      statutPaiement: payslip.payments.length > 0 ? payslip.payments[0].status : 'NON_PAYE',
      datePaiement: payslip.payments.length > 0 ? payslip.payments[0].date : null,
    }));

    if (format === 'csv') {
      const fields = ['matricule', 'nom', 'poste', 'salaireBrut', 'salaireNet', 'statutPaiement', 'datePaiement'];
      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse(employees);

      return {
        data: csv,
        filename: `payrun_${payrun.month}_employees.csv`,
        type: 'text/csv',
      };
    }

    return employees;
  }
}

module.exports = new PayrollService();