const employeeService = require('../services/employeeService');
const Joi = require('joi');

const profileSchema = Joi.object({
  name: Joi.string().required(),
  position: Joi.string().required(),
});

const leaveRequestSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  reason: Joi.string().optional(),
});

class EmployeeController {
  async getProfile(req, res) {
    try {
      const profile = await employeeService.getProfile(req.employeeId, req.user.companyId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      const status = error.message === 'Employee not found' ? 404 : 500;
      res.status(status).json({
        errorCode: 'GET_PROFILE_FAILED',
        message: error.message,
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { error } = profileSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const profile = await employeeService.updateProfile(req.employeeId, req.user.companyId, req.body);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'UPDATE_PROFILE_FAILED',
        message: error.message,
      });
    }
  }

  async getMyPayslips(req, res) {
    try {
      const filters = req.query;
      const result = await employeeService.getMyPayslips(req.employeeId, req.user.companyId, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_PAYSLIPS_FAILED',
        message: error.message,
      });
    }
  }

  async getMyTimesheets(req, res) {
    try {
      const filters = req.query;
      const result = await employeeService.getMyTimesheets(req.employeeId, req.user.companyId, filters);

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

  async createLeaveRequest(req, res) {
    try {
      const { error } = leaveRequestSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const leaveRequest = await employeeService.createLeaveRequest(req.employeeId, req.user.companyId, req.body);

      res.status(201).json({
        success: true,
        data: leaveRequest,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'CREATE_LEAVE_REQUEST_FAILED',
        message: error.message,
      });
    }
  }

  async getMyLeaveRequests(req, res) {
    try {
      const filters = req.query;
      const result = await employeeService.getMyLeaveRequests(req.employeeId, req.user.companyId, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_LEAVE_REQUESTS_FAILED',
        message: error.message,
      });
    }
  }
}

module.exports = new EmployeeController();