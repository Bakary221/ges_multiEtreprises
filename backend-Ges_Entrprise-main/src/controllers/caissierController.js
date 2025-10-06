const caissierService = require('../services/caissierService');
const paymentService = require('../services/caissier/paymentService');
const loanService = require('../services/caissier/loanService');
const payrollService = require('../services/admin/payrollService');
const Joi = require('joi');

const paymentSchema = Joi.object({
  payslipId: Joi.number().integer().required(),
  amount: Joi.number().positive().optional(),
  method: Joi.string().valid('VIREMENT', 'CASH', 'CHEQUE').optional(),
  notes: Joi.string().optional(),
});

const loanSchema = Joi.object({
  employeeId: Joi.number().integer().required(),
  amount: Joi.number().positive().required(),
  interestRate: Joi.number().min(0).max(100).optional(),
  termMonths: Joi.number().integer().positive().required(),
  purpose: Joi.string().optional(),
});

const loanPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
});

const attendanceSchema = Joi.object({
  employeeId: Joi.number().integer().required(),
  type: Joi.string().valid('CHECK_IN', 'CHECK_OUT').required(),
  timestamp: Joi.date().optional(),
});

class CaissierController {
  async getEmployees(req, res) {
    try {
      const employees = await caissierService.getEmployeesSimplified(req.user.companyId);

      res.json({
        success: true,
        data: employees,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_EMPLOYEES_FAILED',
        message: error.message,
      });
    }
  }

  async getValidatedTimesheets(req, res) {
    try {
      const filters = req.query;
      const result = await caissierService.getValidatedTimesheets(req.user.companyId, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_TIMESHEETS_FAILED',
        message: error.message,
      });
    }
  }

  // Get payslips for caissier to process payments
  async getPayslips(req, res) {
    try {
      console.log('🔍 CAISSIER: Getting payslips for companyId:', req.user.companyId);
      const filters = req.query;
      const result = await payrollService.getPayslips(req.user.companyId, filters);
      console.log('🔍 CAISSIER: Payslips result:', result);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('❌ CAISSIER: Error getting payslips:', error.message);
      res.status(500).json({
        errorCode: 'GET_PAYSLIPS_FAILED',
        message: error.message,
      });
    }
  }

  async createPayment(req, res) {
    try {
      const { error } = paymentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const payment = await paymentService.makePayment(req.user.companyId, req.body.payslipId, req.body, req.user.id);

      res.status(201).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'CREATE_PAYMENT_FAILED',
        message: error.message,
      });
    }
  }

  async getPayments(req, res) {
    try {
      console.log('🔍 CAISSIER: Getting payments for companyId:', req.user.companyId);
      const filters = req.query;
      const result = await paymentService.getPayments(req.user.companyId, filters);
      console.log('🔍 CAISSIER: Payments result:', result);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('❌ CAISSIER: Error getting payments:', error.message);
      res.status(500).json({
        errorCode: 'GET_PAYMENTS_FAILED',
        message: error.message,
      });
    }
  }

  async cancelPayment(req, res) {
    try {
      const { id } = req.params;
      const result = await paymentService.cancelPayment(req.user.companyId, id, req.user.id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'CANCEL_PAYMENT_FAILED',
        message: error.message,
      });
    }
  }

  // Loans management
  async createLoan(req, res) {
    try {
      const { error } = loanSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const loan = await loanService.createLoan(req.user.companyId, req.body, req.user.id);

      res.status(201).json({
        success: true,
        data: loan,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'CREATE_LOAN_FAILED',
        message: error.message,
      });
    }
  }

  async getLoans(req, res) {
    try {
      const filters = req.query;
      const result = await loanService.getLoans(req.user.companyId, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_LOANS_FAILED',
        message: error.message,
      });
    }
  }

  async getLoanById(req, res) {
    try {
      const { id } = req.params;
      const loan = await loanService.getLoanById(req.user.companyId, id);

      res.json({
        success: true,
        data: loan,
      });
    } catch (error) {
      const status = error.message === 'Prêt non trouvé' ? 404 : 500;
      res.status(status).json({
        errorCode: 'GET_LOAN_FAILED',
        message: error.message,
      });
    }
  }

  async makeLoanPayment(req, res) {
    try {
      const { id } = req.params;
      const { error } = loanPaymentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const result = await loanService.makeLoanPayment(req.user.companyId, id, req.body, req.user.id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'MAKE_LOAN_PAYMENT_FAILED',
        message: error.message,
      });
    }
  }

  async cancelLoan(req, res) {
    try {
      const { id } = req.params;
      const result = await loanService.cancelLoan(req.user.companyId, id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'CANCEL_LOAN_FAILED',
        message: error.message,
      });
    }
  }

  async getEmployeeLoanSummary(req, res) {
    try {
      const { employeeId } = req.params;
      const summary = await loanService.getEmployeeLoanSummary(req.user.companyId, employeeId);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_LOAN_SUMMARY_FAILED',
        message: error.message,
      });
    }
  }

  async scanAttendance(req, res) {
    try {
      const { error } = attendanceSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const attendance = await caissierService.scanAttendance(req.user.companyId, req.body);

      res.status(201).json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'SCAN_ATTENDANCE_FAILED',
        message: error.message,
      });
    }
  }

  async generatePayslipPDF(req, res) {
    try {
      const { id } = req.params;
      const result = await payrollService.generatePayslipPDF(req.user.companyId, id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'GENERATE_PAYSLIP_PDF_FAILED',
        message: error.message,
      });
    }
  }

  async generatePaymentReceipt(req, res) {
    try {
      const { id } = req.params;
      const receipt = await paymentService.generatePaymentReceipt(req.user.companyId, id);

      res.json({
        success: true,
        data: receipt,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'GENERATE_RECEIPT_FAILED',
        message: error.message,
      });
    }
  }

  async getPaymentStats(req, res) {
    try {
      const filters = req.query;
      const stats = await paymentService.getPaymentStats(req.user.companyId, filters);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_PAYMENT_STATS_FAILED',
        message: error.message,
      });
    }
  }

  // Payrun management for caissier
  async getPayruns(req, res) {
    try {
      const filters = req.query;
      const result = await payrollService.getPayruns(req.user.companyId, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_PAYRUNS_FAILED',
        message: error.message,
      });
    }
  }

  async getPayrunById(req, res) {
    try {
      const { id } = req.params;
      const payrun = await payrollService.getPayrunById(req.user.companyId, id);

      res.json({
        success: true,
        data: payrun,
      });
    } catch (error) {
      const status = error.message === 'Payrun not found' ? 404 : 500;
      res.status(status).json({
        errorCode: 'GET_PAYRUN_FAILED',
        message: error.message,
      });
    }
  }

  // Update payrun status (caissier can change CALCULATED->VALIDATED->PAID->CLOSED)
  async updatePayrunStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'Status is required',
        });
      }

      if (!['CALCULATED', 'VALIDATED', 'PAID', 'CLOSED'].includes(status)) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'Invalid status for caissier. Caissier can only set CALCULATED, VALIDATED, PAID, or CLOSED',
        });
      }

      const result = await payrollService.updatePayrunStatus(req.user.companyId, id, status, req.user.id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'UPDATE_PAYRUN_STATUS_FAILED',
        message: error.message,
      });
    }
  }

  async getDashboardStats(req, res) {
    try {
      console.log('🔍 CAISSIER: Getting dashboard stats for companyId:', req.user.companyId);

      // Get payment statistics
      const paymentStats = await paymentService.getPaymentStats(req.user.companyId);

      // Get employee count
      const employeeCount = await prisma.employee.count({
        where: { companyId: req.user.companyId, archived: false }
      });

      // Get payslips count (pending payments)
      const payslipsCount = await prisma.payslip.count({
        where: {
          employee: { companyId: req.user.companyId },
          payments: { none: {} } // No payments yet
        }
      });

      // Get receipts generated count
      const receiptsCount = await prisma.payment.count({
        where: {
          payslip: {
            employee: { companyId: req.user.companyId }
          }
        }
      });

      const stats = {
        successfulPayments: paymentStats.successfulPayments || 0,
        pendingPayments: paymentStats.pendingPayments || 0,
        totalEmployees: employeeCount,
        receiptsGenerated: receiptsCount,
      };

      console.log('🔍 CAISSIER: Dashboard stats:', stats);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('❌ CAISSIER: Error getting dashboard stats:', error.message);
      res.status(500).json({
        errorCode: 'GET_DASHBOARD_STATS_FAILED',
        message: error.message,
      });
    }
  }
}

module.exports = new CaissierController();