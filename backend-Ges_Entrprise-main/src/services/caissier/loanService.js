const prisma = require('../../config/prisma');

class LoanService {
  // Créer un prêt pour un employé
  async createLoan(companyId, data, grantedByUserId) {
    const { employeeId, amount, interestRate = 0, termMonths, purpose } = data;

    // Vérifier que l'employé appartient à l'entreprise
    const employee = await prisma.employee.findFirst({
      where: {
        id: parseInt(employeeId),
        companyId: parseInt(companyId),
        archived: false,
      },
    });

    if (!employee) {
      throw new Error('Employé non trouvé ou n\'appartient pas à cette entreprise');
    }

    // Calculer le paiement mensuel (formule simple d'amortissement)
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = interestRate > 0
      ? (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1)
      : amount / termMonths;

    // Créer le prêt
    const loan = await prisma.loan.create({
      data: {
        employeeId: parseInt(employeeId),
        amount: parseFloat(amount),
        interestRate: parseFloat(interestRate),
        termMonths: parseInt(termMonths),
        monthlyPayment: parseFloat(monthlyPayment),
        remainingAmount: parseFloat(amount),
        purpose,
        grantedBy: grantedByUserId,
        status: 'ACTIVE',
      },
      include: {
        employee: {
          select: { id: true, name: true, position: true },
        },
        grantedByUser: {
          select: { id: true, email: true },
        },
      },
    });

    return loan;
  }

  // Récupérer tous les prêts d'une entreprise ou toutes les entreprises (SuperAdmin)
  async getLoans(companyId, filters = {}) {
    const { employeeId, status, page = 1, limit = 10 } = filters;
    const offset = (parseInt(page) - 1) * parseInt(limit);

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
    if (status) where.status = status;

    const loans = await prisma.loan.findMany({
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
        grantedByUser: {
          select: { id: true, email: true },
        },
        approvedByUser: {
          select: { id: true, email: true },
        },
        payments: {
          orderBy: { paidAt: 'desc' },
        },
        _count: {
          select: { payments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: offset,
    });

    const total = await prisma.loan.count({ where });

    return {
      loans,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };
  }

  // Récupérer un prêt par ID
  async getLoanById(companyId, loanId) {
    const loan = await prisma.loan.findFirst({
      where: {
        id: parseInt(loanId),
        employee: {
          companyId: parseInt(companyId),
          archived: false,
        },
      },
      include: {
        employee: {
          select: { id: true, name: true, position: true, matricule: true },
        },
        grantedByUser: {
          select: { id: true, email: true },
        },
        approvedByUser: {
          select: { id: true, email: true },
        },
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
    });

    if (!loan) {
      throw new Error('Prêt non trouvé');
    }

    return loan;
  }

  // Effectuer un paiement sur un prêt
  async makeLoanPayment(companyId, loanId, paymentData, paidByUserId) {
    const { amount } = paymentData;

    const loan = await this.getLoanById(companyId, loanId);

    if (loan.status !== 'ACTIVE') {
      throw new Error('Ce prêt n\'est pas actif');
    }

    if (parseFloat(amount) > loan.remainingAmount) {
      throw new Error('Le montant du paiement dépasse le solde restant');
    }

    // Créer le paiement
    const payment = await prisma.loanPayment.create({
      data: {
        loanId: parseInt(loanId),
        amount: parseFloat(amount),
      },
    });

    // Mettre à jour le solde restant du prêt
    const newRemainingAmount = loan.remainingAmount - parseFloat(amount);
    const newStatus = newRemainingAmount <= 0 ? 'COMPLETED' : 'ACTIVE';

    await prisma.loan.update({
      where: { id: parseInt(loanId) },
      data: {
        remainingAmount: Math.max(0, newRemainingAmount),
        status: newStatus,
      },
    });

    return {
      payment,
      loan: await this.getLoanById(companyId, loanId),
    };
  }

  // Approuver un prêt (pour admin)
  async approveLoan(companyId, loanId, approvedByUserId) {
    const loan = await prisma.loan.findFirst({
      where: {
        id: parseInt(loanId),
        employee: {
          companyId: parseInt(companyId),
          archived: false,
        },
      },
    });

    if (!loan) {
      throw new Error('Prêt non trouvé');
    }

    if (loan.approvedBy) {
      throw new Error('Ce prêt est déjà approuvé');
    }

    const updatedLoan = await prisma.loan.update({
      where: { id: parseInt(loanId) },
      data: {
        approvedBy: approvedByUserId,
      },
      include: {
        employee: {
          select: { id: true, name: true, position: true },
        },
        approvedByUser: {
          select: { id: true, email: true },
        },
      },
    });

    return updatedLoan;
  }

  // Annuler un prêt
  async cancelLoan(companyId, loanId) {
    const loan = await prisma.loan.findFirst({
      where: {
        id: parseInt(loanId),
        employee: {
          companyId: parseInt(companyId),
          archived: false,
        },
      },
    });

    if (!loan) {
      throw new Error('Prêt non trouvé');
    }

    if (loan.status !== 'ACTIVE') {
      throw new Error('Seuls les prêts actifs peuvent être annulés');
    }

    const updatedLoan = await prisma.loan.update({
      where: { id: parseInt(loanId) },
      data: {
        status: 'CANCELLED',
      },
      include: {
        employee: {
          select: { id: true, name: true, position: true },
        },
      },
    });

    return updatedLoan;
  }

  // Calculer le résumé des prêts pour un employé
  async getEmployeeLoanSummary(companyId, employeeId) {
    const loans = await prisma.loan.findMany({
      where: {
        employeeId: parseInt(employeeId),
        employee: {
          companyId: parseInt(companyId),
          archived: false,
        },
      },
      select: {
        id: true,
        amount: true,
        remainingAmount: true,
        status: true,
        monthlyPayment: true,
        _count: {
          select: { payments: true },
        },
      },
    });

    const summary = {
      totalLoans: loans.length,
      activeLoans: loans.filter(l => l.status === 'ACTIVE').length,
      totalBorrowed: loans.reduce((sum, loan) => sum + loan.amount, 0),
      totalRemaining: loans.reduce((sum, loan) => sum + loan.remainingAmount, 0),
      monthlyPayments: loans
        .filter(l => l.status === 'ACTIVE')
        .reduce((sum, loan) => sum + loan.monthlyPayment, 0),
      loans: loans,
    };

    return summary;
  }
}

module.exports = new LoanService();