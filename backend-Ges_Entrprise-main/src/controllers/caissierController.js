const caissierService = require('../services/caissierService');
const Joi = require('joi');

const paymentSchema = Joi.object({
  payslipId: Joi.number().integer().required(),
  method: Joi.string().valid('BANK_TRANSFER', 'CASH', 'CHECK').required(),
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

  async createPayment(req, res) {
    try {
      const { error } = paymentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const payment = await caissierService.createPayment(req.user.companyId, req.body);

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
      const filters = req.query;
      const result = await caissierService.getPayments(req.user.companyId, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_PAYMENTS_FAILED',
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

  async generateReceiptPDF(req, res) {
    try {
      const { id } = req.params;
      const result = await caissierService.generateReceiptPDF(req.user.companyId, id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'GENERATE_RECEIPT_FAILED',
        message: error.message,
      });
    }
  }
}

module.exports = new CaissierController();