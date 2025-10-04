const employeeService = require('../services/admin/employeeService');
const attendanceService = require('../services/admin/attendanceService');
const timesheetService = require('../services/admin/timesheetService');
const payrollService = require('../services/admin/payrollService');
const reportService = require('../services/reportService');
const notificationService = require('../services/notificationService');
const Joi = require('joi');

const employeeSchema = Joi.object({
  name: Joi.string().required(),
  position: Joi.string().required(),
  salary: Joi.number().positive().required(),
  departmentId: Joi.number().integer().optional(),
  contractType: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});

const attendanceSchema = Joi.object({
  employeeId: Joi.number().integer().required(),
  type: Joi.string().valid('CHECK_IN', 'CHECK_OUT').required(),
  timestamp: Joi.date().optional(),
});

const timesheetSchema = Joi.object({
  employeeId: Joi.number().integer().required(),
  month: Joi.string().pattern(/^\d{4}-\d{2}$/).required(),
  hoursWorked: Joi.number().min(0).max(400).required(),
});

const payrunSchema = Joi.object({
  month: Joi.string().pattern(/^\d{4}-\d{2}$/).required(),
});

class AdminController {
  // Employees
  async createEmployee(req, res) {
    try {
      const { error } = employeeSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const employee = await employeeService.createEmployee(req.user.companyId, req.body);

      res.status(201).json({
        success: true,
        data: employee,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'CREATE_EMPLOYEE_FAILED',
        message: error.message,
      });
    }
  }

  async getEmployees(req, res) {
    try {
      const filters = req.query;
      const companyId = req.user.role === 'SUPERADMIN' ? null : req.user.companyId;
      const result = await employeeService.getEmployees(companyId, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_EMPLOYEES_FAILED',
        message: error.message,
      });
    }
  }

  async getEmployeeById(req, res) {
    try {
      const { id } = req.params;
      const employee = await employeeService.getEmployeeById(req.user.companyId, id);

      res.json({
        success: true,
        data: employee,
      });
    } catch (error) {
      const status = error.message === 'Employee not found' ? 404 : 500;
      res.status(status).json({
        errorCode: 'GET_EMPLOYEE_FAILED',
        message: error.message,
      });
    }
  }

  async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const employee = await employeeService.updateEmployee(req.user.companyId, id, req.body);

      res.json({
        success: true,
        data: employee,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'UPDATE_EMPLOYEE_FAILED',
        message: error.message,
      });
    }
  }

  async updateEmployeeStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'Status is required',
        });
      }

      const result = await employeeService.updateEmployeeStatus(req.user.companyId, id, status);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'UPDATE_STATUS_FAILED',
        message: error.message,
      });
    }
  }

  async archiveEmployee(req, res) {
    try {
      const { id } = req.params;
      const result = await employeeService.archiveEmployee(req.user.companyId, id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'ARCHIVE_EMPLOYEE_FAILED',
        message: error.message,
      });
    }
  }

  // Attendances
  async scanAttendance(req, res) {
    try {
      const { error } = attendanceSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const attendance = await attendanceService.scanAttendance(req.user.companyId, req.body);

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

  async getAttendances(req, res) {
    try {
      const filters = req.query;
      const result = await attendanceService.getAttendances(req.user.companyId, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_ATTENDANCES_FAILED',
        message: error.message,
      });
    }
  }

  // Timesheets
  async createTimesheet(req, res) {
    try {
      const { error } = timesheetSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const timesheet = await timesheetService.createTimesheet(req.user.companyId, req.body);

      res.status(201).json({
        success: true,
        data: timesheet,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'CREATE_TIMESHEET_FAILED',
        message: error.message,
      });
    }
  }

  async getTimesheets(req, res) {
    try {
      const filters = req.query;
      const result = await timesheetService.getTimesheets(req.user.companyId, filters);

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

  async validateTimesheet(req, res) {
    try {
      const { id } = req.params;
      const timesheet = await timesheetService.validateTimesheet(req.user.companyId, id);

      res.json({
        success: true,
        data: timesheet,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'VALIDATE_TIMESHEET_FAILED',
        message: error.message,
      });
    }
  }

  // Payroll
  async generatePayrun(req, res) {
    try {
      const { error } = payrunSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const result = await payrollService.generatePayrun(req.user.companyId, req.body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'GENERATE_PAYRUN_FAILED',
        message: error.message,
      });
    }
  }

  async getPayslips(req, res) {
    try {
      const filters = req.query;
      const result = await payrollService.getPayslips(req.user.companyId, filters);

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

  async getPayslipById(req, res) {
    try {
      const { id } = req.params;
      const payslip = await payrollService.getPayslipById(req.user.companyId, id);

      res.json({
        success: true,
        data: payslip,
      });
    } catch (error) {
      const status = error.message === 'Payslip not found' ? 404 : 500;
      res.status(status).json({
        errorCode: 'GET_PAYSLIP_FAILED',
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
        errorCode: 'GENERATE_PDF_FAILED',
        message: error.message,
      });
    }
  }

  // Reports
  async getPayrollSummary(req, res) {
    try {
      const filters = req.query;
      const summary = await reportService.getPayrollSummary(req.user.companyId, filters);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_PAYROLL_SUMMARY_FAILED',
        message: error.message,
      });
    }
  }

  async getEmployeeDistribution(req, res) {
    try {
      const distribution = await reportService.getEmployeeDistribution(req.user.companyId);

      res.json({
        success: true,
        data: distribution,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_EMPLOYEE_DISTRIBUTION_FAILED',
        message: error.message,
      });
    }
  }

  async getAttendanceSummary(req, res) {
    try {
      const filters = req.query;
      const summary = await reportService.getAttendanceSummary(req.user.companyId, filters);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_ATTENDANCE_SUMMARY_FAILED',
        message: error.message,
      });
    }
  }

  async exportReport(req, res) {
    try {
      const { type } = req.params;
      const filters = req.query;
      const result = await reportService.exportReport(req.user.companyId, type, filters);

      res.setHeader('Content-Type', result.type);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.json(result.data);
    } catch (error) {
      res.status(400).json({
        errorCode: 'EXPORT_REPORT_FAILED',
        message: error.message,
      });
    }
  }

  // RH étendue - Départements
  async createDepartment(req, res) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'Department name is required',
        });
      }

      const department = await prisma.department.create({
        data: {
          name,
          companyId: req.user.companyId,
        },
      });

      res.status(201).json({
        success: true,
        data: department,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'CREATE_DEPARTMENT_FAILED',
        message: error.message,
      });
    }
  }

  async getDepartments(req, res) {
    try {
      const departments = await prisma.department.findMany({
        where: { companyId: req.user.companyId },
        include: {
          _count: {
            select: { employees: true },
          },
        },
      });

      res.json({
        success: true,
        data: departments,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_DEPARTMENTS_FAILED',
        message: error.message,
      });
    }
  }

  // RH étendue - Contrats
  async createContract(req, res) {
    try {
      const { employeeId, type, startDate, endDate, salary } = req.body;

      const contract = await prisma.contract.create({
        data: {
          employeeId: parseInt(employeeId),
          type,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          salary: parseFloat(salary),
        },
      });

      res.status(201).json({
        success: true,
        data: contract,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'CREATE_CONTRACT_FAILED',
        message: error.message,
      });
    }
  }

  async getContracts(req, res) {
    try {
      const contracts = await prisma.contract.findMany({
        where: {
          employee: {
            companyId: req.user.companyId,
            archived: false,
          },
        },
        include: {
          employee: {
            select: { id: true, name: true },
          },
        },
      });

      res.json({
        success: true,
        data: contracts,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_CONTRACTS_FAILED',
        message: error.message,
      });
    }
  }

  async updateContract(req, res) {
    try {
      const { id } = req.params;
      const { type, startDate, endDate, salary } = req.body;

      const contract = await prisma.contract.update({
        where: { id: parseInt(id) },
        data: {
          type,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : null,
          salary: salary ? parseFloat(salary) : undefined,
        },
      });

      res.json({
        success: true,
        data: contract,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'UPDATE_CONTRACT_FAILED',
        message: error.message,
      });
    }
  }

  // Congés & absences
  async getLeaveRequests(req, res) {
    try {
      const leaveRequests = await prisma.leaveRequest.findMany({
        where: {
          employee: {
            companyId: req.user.companyId,
            archived: false,
          },
        },
        include: {
          employee: {
            select: { id: true, name: true, position: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: leaveRequests,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_LEAVE_REQUESTS_FAILED',
        message: error.message,
      });
    }
  }

  async approveLeaveRequest(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'Invalid status',
        });
      }

      const leaveRequest = await prisma.leaveRequest.update({
        where: { id: parseInt(id) },
        data: { status },
        include: {
          employee: {
            select: { id: true, name: true },
          },
        },
      });

      res.json({
        success: true,
        data: leaveRequest,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'APPROVE_LEAVE_REQUEST_FAILED',
        message: error.message,
      });
    }
  }

  // Notifications
  async sendNotification(req, res) {
    try {
      const { userId, type, content } = req.body;

      if (!userId || !type || !content) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'userId, type, and content are required',
        });
      }

      const notification = await notificationService.sendNotification(userId, { type, content });

      res.status(201).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'SEND_NOTIFICATION_FAILED',
        message: error.message,
      });
    }
  }

  async getNotifications(req, res) {
    try {
      const filters = req.query;
      const result = await notificationService.getNotifications(req.user.id, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_NOTIFICATIONS_FAILED',
        message: error.message,
      });
    }
  }

  // Company logs
  async getCompanyLogs(req, res) {
    try {
      const filters = { ...req.query, companyId: req.user.companyId };
      const result = await require('../services/superAdminService').getLogs(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_LOGS_FAILED',
        message: error.message,
      });
    }
  }
}

module.exports = new AdminController();