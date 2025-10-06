const prisma = require('../../config/prisma');

class PaymentService {
  // Effectuer un paiement pour un payslip
  async makePayment(companyId, payslipId, paymentData, paidByUserId) {
    const { amount, method = 'VIREMENT', notes } = paymentData;

    // Vérifier que le payslip appartient à l'entreprise
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
          select: { id: true, name: true, matricule: true },
        },
        payments: {
          where: { status: 'COMPLETED' },
        },
      },
    });

    if (!payslip) {
      throw new Error('Payslip non trouvé ou n\'appartient pas à cette entreprise');
    }

    // Vérifier s'il y a déjà un paiement complété
    if (payslip.payments.length > 0) {
      throw new Error('Ce payslip a déjà été payé');
    }

    // Vérifier que le montant correspond au salaire net
    if (Math.abs(parseFloat(amount) - payslip.netSalary) > 0.01) {
      throw new Error(`Le montant du paiement (${amount}) ne correspond pas au salaire net (${payslip.netSalary})`);
    }

    // Créer le paiement
    const payment = await prisma.payment.create({
      data: {
        payslipId: parseInt(payslipId),
        status: 'COMPLETED',
        method,
        date: new Date(),
      },
    });

    return {
      payment,
      payslip: {
        ...payslip,
        payments: [payment],
      },
    };
  }

  // Annuler un paiement (pour corrections)
  async cancelPayment(companyId, paymentId, cancelledByUserId) {
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
              select: { id: true, name: true, matricule: true },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Paiement non trouvé');
    }

    if (payment.status !== 'COMPLETED') {
      throw new Error('Seuls les paiements complétés peuvent être annulés');
    }

    // Marquer le paiement comme annulé (on pourrait ajouter un statut CANCELLED)
    // Pour l'instant, on supprime le paiement
    await prisma.payment.delete({
      where: { id: parseInt(paymentId) },
    });

    return {
      message: 'Paiement annulé avec succès',
      payment,
    };
  }

  // Récupérer les paiements d'une entreprise ou toutes les entreprises (SuperAdmin)
  async getPayments(companyId, filters = {}) {
    const { payslipId, employeeId, status, method, page = 1, limit = 10 } = filters;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    // If companyId is provided, filter by company
    if (companyId) {
      where.payslip = {
        employee: {
          companyId: parseInt(companyId),
          archived: false,
        },
      };
    } else {
      // For SuperAdmin, include company info
      where.payslip = {
        employee: {
          archived: false,
        },
      };
    }

    if (payslipId) where.payslipId = parseInt(payslipId);
    if (employeeId) {
      where.payslip = {
        ...where.payslip,
        employeeId: parseInt(employeeId),
      };
    }
    if (status) where.status = status;
    if (method) where.method = method;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        payslip: {
          include: {
            employee: {
              select: { id: true, name: true, matricule: true, position: true },
              include: companyId ? undefined : {
                company: {
                  select: { id: true, name: true }
                }
              }
            },
            payrun: {
              select: { id: true, month: true },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: parseInt(limit),
      skip: offset,
    });

    const total = await prisma.payment.count({ where });

    return {
      payments,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };
  }

  // Récupérer un paiement par ID
  async getPaymentById(companyId, paymentId) {
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
              select: { id: true, name: true, matricule: true, position: true, salary: true },
            },
            payrun: {
              select: { id: true, month: true, totalAmount: true },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Paiement non trouvé');
    }

    return payment;
  }

  // Générer un reçu de paiement
  async generatePaymentReceipt(companyId, paymentId) {
    const payment = await this.getPaymentById(companyId, paymentId);

    // Générer le PDF réel
    const pdfService = require('../pdfService');
    const pdfResult = await pdfService.generatePaymentReceiptPDF(paymentId);

    return {
      paymentId: payment.id,
      employeeName: payment.payslip.employee.name,
      employeeMatricule: payment.payslip.employee.matricule,
      amount: payment.payslip.netSalary,
      method: payment.method,
      date: payment.date,
      payrunMonth: payment.payslip.payrun.month,
      receiptNumber: `REC-${payment.id}-${Date.now()}`,
      pdfUrl: pdfResult.pdfUrl,
      generatedAt: pdfResult.generatedAt,
    };
  }

  // Statistiques de paiement pour le caissier
  async getPaymentStats(companyId, filters = {}) {
    const { month, year } = filters;
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();
    const monthString = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

    // Paiements du mois
    const payments = await prisma.payment.findMany({
      where: {
        payslip: {
          payrun: {
            companyId: parseInt(companyId),
            month: monthString,
          },
        },
        status: 'COMPLETED',
      },
      include: {
        payslip: {
          select: { netSalary: true },
        },
      },
    });

    const totalPaid = payments.reduce((sum, payment) => sum + payment.payslip.netSalary, 0);
    const paymentCount = payments.length;

    // Payslips en attente de paiement pour ce mois
    const pendingPayslips = await prisma.payslip.count({
      where: {
        payrun: {
          companyId: parseInt(companyId),
          month: monthString,
        },
        payments: {
          none: {
            status: 'COMPLETED',
          },
        },
      },
    });

    return {
      month: monthString,
      totalPaid,
      paymentCount,
      pendingPayslips,
      averagePayment: paymentCount > 0 ? totalPaid / paymentCount : 0,
    };
  }
}

module.exports = new PaymentService();