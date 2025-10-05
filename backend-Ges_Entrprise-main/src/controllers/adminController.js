const employeeService = require('../services/admin/employeeService');
const attendanceService = require('../services/admin/attendanceService');
const timesheetService = require('../services/admin/timesheetService');
const payrollService = require('../services/admin/payrollService');
const badgeService = require('../services/admin/badgeService');
const reportService = require('../services/reportService');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');
const prisma = require('../config/prisma');
const Joi = require('joi');

const employeeSchema = Joi.object({
  name: Joi.string().required(),
  position: Joi.string().required(),
  salary: Joi.number().positive().required(),
  matricule: Joi.string().optional(),
  departmentId: Joi.number().integer().optional(),
  contractType: Joi.string().valid('FIXE', 'HONORAIRE').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  email: Joi.string().email().required(),
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
      const employeeData = { ...req.body };

      // Generate matricule if not provided
      if (!employeeData.matricule) {
        const companyId = req.user.companyId;

        // Get the last employee number for this company
        const lastEmployee = await prisma.employee.findFirst({
          where: { companyId },
          orderBy: { id: 'desc' },
          select: { matricule: true }
        });

        let nextNumber = 1;
        if (lastEmployee?.matricule) {
          // Extract number from matricule (format: EMP-001)
          const match = lastEmployee.matricule.match(/EMP-(\d+)/);
          if (match) {
            nextNumber = parseInt(match[1]) + 1;
          }
        }

        // Generate matricule with leading zeros
        employeeData.matricule = `EMP-${nextNumber.toString().padStart(3, '0')}`;
      }

      const { error } = employeeSchema.validate(employeeData);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const employee = await employeeService.createEmployee(req.user.companyId, employeeData);

      // Send badge email to employee (async, don't wait)
      try {
        if (employee.email) {
          const company = await prisma.company.findUnique({
            where: { id: req.user.companyId },
            select: { name: true, primaryColor: true, secondaryColor: true }
          });

          // Get badge info for email
          const badge = await badgeService.generateEmployeeBadge(employee.id);

          emailService.sendBadgeEmail(employee, badge, company)
            .then(() => console.log('✅ CREATE_EMPLOYEE: Badge email sent successfully'))
            .catch(err => console.error('❌ CREATE_EMPLOYEE: Failed to send badge email:', err.message));
        }
      } catch (emailError) {
        console.error('❌ CREATE_EMPLOYEE: Error preparing badge email:', emailError.message);
        // Don't fail the request if email fails
      }

      res.status(201).json({
        success: true,
        data: employee,
      });
    } catch (error) {
      console.error('❌ CREATE_EMPLOYEE: Error creating employee:', error.message);
      console.error('❌ CREATE_EMPLOYEE: Stack trace:', error.stack);
      res.status(400).json({
        errorCode: 'CREATE_EMPLOYEE_FAILED',
        message: error.message,
      });
    }
  }

  async getEmployees(req, res) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const companyId = req.user.role === 'SUPERADMIN' ? null : req.user.companyId;
      const result = await employeeService.getEmployees(companyId, {
        ...filters,
        page: parseInt(page),
        limit: parseInt(limit)
      });

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
      const { employeeId, type, hoursWorked } = req.body;

      // Validate basic fields
      if (!employeeId || !type) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'employeeId and type are required',
        });
      }

      if (!['CHECK_IN', 'CHECK_OUT'].includes(type)) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'Invalid attendance type',
        });
      }

      // Get employee with contract type
      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(employeeId) },
        select: {
          id: true,
          contractType: true,
          companyId: true,
          archived: true
        }
      });

      if (!employee) {
        return res.status(404).json({
          errorCode: 'EMPLOYEE_NOT_FOUND',
          message: 'Employé non trouvé',
        });
      }

      if (employee.archived) {
        return res.status(400).json({
          errorCode: 'EMPLOYEE_ARCHIVED',
          message: 'Impossible d\'enregistrer la présence d\'un employé archivé',
        });
      }

      // Check if employee belongs to user's company (unless SUPERADMIN)
      if (req.user.role !== 'SUPERADMIN' && employee.companyId !== req.user.companyId) {
        return res.status(403).json({
          errorCode: 'FORBIDDEN',
          message: 'Accès refusé - employé d\'une autre entreprise',
        });
      }

      // Validate contract type logic
      if (employee.contractType === 'HONORAIRE') {
        // For HONORAIRE contracts, hoursWorked is required for CHECK_OUT
        if (type === 'CHECK_OUT' && (!hoursWorked || hoursWorked <= 0)) {
          return res.status(400).json({
            errorCode: 'VALIDATION_ERROR',
            message: 'Le nombre d\'heures travaillées est requis pour les contrats honoraires',
          });
        }
      } else if (employee.contractType === 'FIXE') {
        // For FIXE contracts, hoursWorked should not be provided
        if (hoursWorked !== undefined) {
          return res.status(400).json({
            errorCode: 'VALIDATION_ERROR',
            message: 'Les heures travaillées ne doivent pas être spécifiées pour les contrats fixes',
          });
        }
      }

      const attendanceData = {
        employeeId: parseInt(employeeId),
        type,
        hoursWorked: employee.contractType === 'HONORAIRE' && type === 'CHECK_OUT' ? parseFloat(hoursWorked) : null
      };

      const attendance = await attendanceService.scanAttendance(req.user.companyId, attendanceData);

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
      const { page = 1, limit = 10, ...filters } = req.query;
      const result = await attendanceService.getAttendances(req.user.companyId, {
        ...filters,
        page: parseInt(page),
        limit: parseInt(limit)
      });

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
      const { page = 1, limit = 10, ...filters } = req.query;
      const result = await timesheetService.getTimesheets(req.user.companyId, {
        ...filters,
        page: parseInt(page),
        limit: parseInt(limit)
      });

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
      const { page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // SuperAdmin can see all departments, Admin only their company's
      const whereCondition = req.user.role === 'SUPERADMIN'
        ? {}
        : { companyId: req.user.companyId };

      const [departments, total] = await Promise.all([
        prisma.department.findMany({
          where: whereCondition,
          include: {
            _count: {
              select: { employees: true },
            },
          },
          skip: offset,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.department.count({
          where: whereCondition,
        }),
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          departments,
          total,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
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
      const { page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // SuperAdmin can see all contracts, Admin only their company's
      const whereCondition = req.user.role === 'SUPERADMIN'
        ? {}
        : {
            employee: {
              companyId: req.user.companyId,
              archived: false,
            },
          };

      const [contracts, total] = await Promise.all([
        prisma.contract.findMany({
          where: whereCondition,
          include: {
            employee: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: parseInt(limit),
        }),
        prisma.contract.count({
          where: whereCondition,
        }),
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          contracts,
          total,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
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
      const { page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // SuperAdmin can see all leave requests, Admin only their company's
      const whereCondition = req.user.role === 'SUPERADMIN'
        ? {}
        : {
            employee: {
              companyId: req.user.companyId,
              archived: false,
            },
          };

      const [leaveRequests, total] = await Promise.all([
        prisma.leaveRequest.findMany({
          where: whereCondition,
          include: {
            employee: {
              select: { id: true, name: true, position: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: parseInt(limit),
        }),
        prisma.leaveRequest.count({
          where: whereCondition,
        }),
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          leaveRequests,
          total,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
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

  // Get my company information
  async getMyCompany(req, res) {
    try {
      console.log('🏢 GET_MY_COMPANY: Controller called for user:', {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        companyId: req.user.companyId
      });

      const company = await prisma.company.findUnique({
        where: { id: req.user.companyId },
        select: {
          id: true,
          name: true,
          currency: true,
          logo: true,
          primaryColor: true,
          secondaryColor: true,
          settings: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log('🏢 GET_MY_COMPANY: Company lookup result:', company ? {
        id: company.id,
        name: company.name,
        currency: company.currency
      } : 'null');

      if (!company) {
        console.log('❌ GET_MY_COMPANY: Company not found for companyId:', req.user.companyId);
        return res.status(404).json({
          errorCode: 'COMPANY_NOT_FOUND',
          message: 'Entreprise non trouvée',
        });
      }

      console.log('✅ GET_MY_COMPANY: Company found, returning data');
      res.json({
        success: true,
        data: company,
      });
    } catch (error) {
      console.log('❌ GET_MY_COMPANY: Error fetching company:', error.message);
      res.status(500).json({
        errorCode: 'GET_COMPANY_FAILED',
        message: error.message,
      });
    }
  }

  // Company stats for dashboard
  async getCompanyStats(req, res) {
    try {
      const companyId = req.user.companyId;
      console.log('📊 GET_COMPANY_STATS: Getting stats for companyId:', companyId);

      // Get employee count
      const employeeCount = await prisma.employee.count({
        where: { companyId, archived: false }
      });
      console.log('📊 GET_COMPANY_STATS: Employee count:', employeeCount);

      // Get attendance count for current month
      const currentMonth = new Date().toISOString().slice(0, 7);
      const startOfMonth = new Date(currentMonth + '-01');
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 1);

      console.log('📊 GET_COMPANY_STATS: Current month:', currentMonth);
      console.log('📊 GET_COMPANY_STATS: Date range:', startOfMonth.toISOString(), 'to', endOfMonth.toISOString());

      const attendanceCount = await prisma.attendance.count({
        where: {
          employee: { companyId },
          timestamp: {
            gte: startOfMonth,
            lt: endOfMonth
          }
        }
      });
      console.log('📊 GET_COMPANY_STATS: Attendance count:', attendanceCount);

      // Get total payroll for current month
      const payrun = await prisma.payrun.findFirst({
        where: {
          companyId,
          month: currentMonth
        },
        select: { totalAmount: true }
      });
      console.log('📊 GET_COMPANY_STATS: Payrun found:', payrun);

      // Get reports count (payslips generated)
      const payslipsCount = await prisma.payslip.count({
        where: {
          payrun: { companyId }
        }
      });
      console.log('📊 GET_COMPANY_STATS: Payslips count:', payslipsCount);

      const stats = {
        totalEmployees: employeeCount,
        totalAttendance: attendanceCount,
        totalPayroll: payrun?.totalAmount || 0,
        totalReports: payslipsCount,
      };

      console.log('📊 GET_COMPANY_STATS: Final stats:', stats);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.log('❌ GET_COMPANY_STATS: Error:', error.message);
      res.status(500).json({
        errorCode: 'GET_COMPANY_STATS_FAILED',
        message: error.message,
      });
    }
  }

  // Get dashboard charts data
  async getDashboardCharts(req, res) {
    try {
      const companyId = req.user.companyId;

      // Get attendance data for the last 7 days
      const attendanceData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });

        const presentCount = await prisma.attendance.count({
          where: {
            employee: { companyId },
            timestamp: {
              gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
              lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
            },
            type: 'CHECK_IN'
          }
        });

        attendanceData.push({
          day: dayName,
          present: presentCount,
        });
      }

      // Get employee distribution by department
      const departmentStats = await prisma.employee.groupBy({
        by: ['departmentId'],
        _count: { id: true },
        where: { companyId, archived: false },
      });

      // Get department names separately
      const departmentIds = departmentStats
        .filter(stat => stat.departmentId !== null)
        .map(stat => stat.departmentId);

      const departments = await prisma.department.findMany({
        where: { id: { in: departmentIds } },
        select: { id: true, name: true }
      });

      const departmentMap = departments.reduce((acc, dept) => {
        acc[dept.id] = dept.name;
        return acc;
      }, {});

      const employeeDistribution = departmentStats
        .filter(stat => stat.departmentId !== null)
        .map(stat => ({
          department: departmentMap[stat.departmentId] || 'Sans département',
          count: stat._count.id
        }));

      // Get payroll data for the last 6 months
      const payrollData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toISOString().slice(0, 7);

        const payrun = await prisma.payrun.findFirst({
          where: { companyId, month },
          select: { totalAmount: true }
        });

        payrollData.push({
          month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          amount: payrun?.totalAmount || 0
        });
      }

      res.json({
        success: true,
        data: {
          attendanceData,
          employeeDistribution,
          payrollData
        },
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_DASHBOARD_CHARTS_FAILED',
        message: error.message,
      });
    }
  }

  // Employee Badges
  async generateEmployeeBadge(req, res) {
    try {
      console.log('🎫 GENERATE_BADGE: Starting badge generation for employeeId:', req.params.employeeId);
      console.log('🎫 GENERATE_BADGE: User:', { id: req.user.id, role: req.user.role, companyId: req.user.companyId });

      const { employeeId } = req.params;

      // Verify employee belongs to user's company
      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(employeeId) },
        select: { companyId: true, archived: true, name: true }
      });

      console.log('🎫 GENERATE_BADGE: Employee lookup result:', employee);

      if (!employee) {
        console.log('❌ GENERATE_BADGE: Employee not found');
        return res.status(404).json({
          errorCode: 'EMPLOYEE_NOT_FOUND',
          message: 'Employé non trouvé',
        });
      }

      if (employee.archived) {
        console.log('❌ GENERATE_BADGE: Employee is archived');
        return res.status(400).json({
          errorCode: 'EMPLOYEE_ARCHIVED',
          message: 'Impossible de générer un badge pour un employé archivé',
        });
      }

      // Check if employee belongs to user's company (unless SUPERADMIN)
      if (req.user.role !== 'SUPERADMIN' && employee.companyId !== req.user.companyId) {
        console.log('❌ GENERATE_BADGE: Employee company mismatch - User company:', req.user.companyId, 'Employee company:', employee.companyId);
        return res.status(403).json({
          errorCode: 'FORBIDDEN',
          message: 'Accès refusé - employé d\'une autre entreprise',
        });
      }

      console.log('✅ GENERATE_BADGE: All checks passed, calling badgeService');
      const badge = await badgeService.generateEmployeeBadge(employeeId);

      console.log('✅ GENERATE_BADGE: Badge generated successfully');

      // Send badge email to employee (async, don't wait)
      try {
        // Get employee details with email
        const employeeWithEmail = await prisma.employee.findUnique({
          where: { id: parseInt(employeeId) },
          select: {
            id: true,
            name: true,
            matricule: true,
            position: true,
            email: true,
            company: {
              select: {
                name: true,
                primaryColor: true,
                secondaryColor: true
              }
            }
          }
        });

        if (employeeWithEmail?.email) {
          console.log('📧 GENERATE_BADGE: Sending badge email to:', employeeWithEmail.email);
          // Send email asynchronously
          emailService.sendBadgeEmail(employeeWithEmail, badge, employeeWithEmail.company)
            .then(() => console.log('✅ GENERATE_BADGE: Badge email sent successfully'))
            .catch(err => console.error('❌ GENERATE_BADGE: Failed to send badge email:', err.message));
        } else {
          console.log('⚠️ GENERATE_BADGE: No email found for employee, skipping email send');
        }
      } catch (emailError) {
        console.error('❌ GENERATE_BADGE: Error preparing badge email:', emailError.message);
        // Don't fail the request if email fails
      }

      res.json({
        success: true,
        data: badge,
      });
    } catch (error) {
      console.log('❌ GENERATE_BADGE: Error:', error.message);
      res.status(400).json({
        errorCode: 'GENERATE_BADGE_FAILED',
        message: error.message,
      });
    }
  }

  async getEmployeeBadge(req, res) {
    try {
      const { employeeId } = req.params;

      // Get employee with badge info
      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(employeeId) },
        select: {
          id: true,
          matricule: true,
          name: true,
          position: true,
          archived: true,
          companyId: true,
          department: {
            select: { name: true }
          },
          company: {
            select: {
              name: true,
              logo: true,
              primaryColor: true,
              secondaryColor: true
            }
          }
        }
      });

      if (!employee) {
        return res.status(404).json({
          errorCode: 'EMPLOYEE_NOT_FOUND',
          message: 'Employé non trouvé',
        });
      }

      if (employee.archived) {
        return res.status(400).json({
          errorCode: 'EMPLOYEE_ARCHIVED',
          message: 'Badge non disponible pour un employé archivé',
        });
      }

      // Check if employee belongs to user's company (unless SUPERADMIN)
      if (req.user.role !== 'SUPERADMIN' && employee.companyId !== req.user.companyId) {
        return res.status(403).json({
          errorCode: 'FORBIDDEN',
          message: 'Accès refusé - employé d\'une autre entreprise',
        });
      }

      // Generate QR code for badge
      const qrData = badgeService.generateQRData(employee);
      const qrCode = await badgeService.generateQRCode(qrData);

      res.json({
        success: true,
        data: {
          employee,
          qrData,
          qrCode,
          generatedAt: new Date()
        },
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_BADGE_FAILED',
        message: error.message,
      });
    }
  }

  async getEmployeeBadgeDetails(req, res) {
    try {
      const { employeeId } = req.params;

      // Get employee with badge info
      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(employeeId) },
        select: {
          id: true,
          matricule: true,
          name: true,
          position: true,
          email: true,
          archived: true,
          companyId: true,
          department: {
            select: { name: true }
          },
          company: {
            select: {
              name: true,
              logo: true,
              primaryColor: true,
              secondaryColor: true
            }
          }
        }
      });

      if (!employee) {
        return res.status(404).json({
          errorCode: 'EMPLOYEE_NOT_FOUND',
          message: 'Employé non trouvé',
        });
      }

      if (employee.archived) {
        return res.status(400).json({
          errorCode: 'EMPLOYEE_ARCHIVED',
          message: 'Badge non disponible pour un employé archivé',
        });
      }

      // Check if employee belongs to user's company (unless SUPERADMIN)
      if (req.user.role !== 'SUPERADMIN' && employee.companyId !== req.user.companyId) {
        return res.status(403).json({
          errorCode: 'FORBIDDEN',
          message: 'Accès refusé - employé d\'une autre entreprise',
        });
      }

      // Generate QR code for badge
      const qrData = badgeService.generateQRData(employee);
      const qrCode = await badgeService.generateQRCode(qrData);

      // Get badge URL - use fixed path based on matricule
      const badgeUrl = `/uploads/badges/badge_${employee.matricule}.pdf`;

      res.json({
        success: true,
        data: {
          employee,
          qrData,
          qrCode,
          badgeUrl,
          generatedAt: new Date()
        },
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_BADGE_DETAILS_FAILED',
        message: error.message,
      });
    }
  }

  async getEmployeeBadgePDF(req, res) {
    try {
      const { employeeId } = req.params;
      console.log('🖨️ GET_BADGE_PDF: Request received for employeeId:', employeeId);

      // Get employee
      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(employeeId) },
        select: {
          id: true,
          matricule: true,
          name: true,
          archived: true,
          companyId: true
        }
      });

      console.log('🖨️ GET_BADGE_PDF: Employee found:', employee);

      if (!employee) {
        return res.status(404).json({
          errorCode: 'EMPLOYEE_NOT_FOUND',
          message: 'Employé non trouvé',
        });
      }

      if (employee.archived) {
        return res.status(400).json({
          errorCode: 'EMPLOYEE_ARCHIVED',
          message: 'Badge non disponible pour un employé archivé',
        });
      }

      // Check if employee belongs to user's company (unless SUPERADMIN)
      if (req.user.role !== 'SUPERADMIN' && employee.companyId !== req.user.companyId) {
        return res.status(403).json({
          errorCode: 'FORBIDDEN',
          message: 'Accès refusé - employé d\'une autre entreprise',
        });
      }

      // Check if badge file exists
      const fs = require('fs');
      const path = require('path');
      const badgePath = path.join(process.cwd(), 'uploads/badges', `badge_${employee.matricule}.pdf`);
      console.log('🖨️ GET_BADGE_PDF: Looking for badge file at:', badgePath);
      console.log('🖨️ GET_BADGE_PDF: Employee matricule:', employee.matricule);
      console.log('🖨️ GET_BADGE_PDF: process.cwd():', process.cwd());

      if (!fs.existsSync(badgePath)) {
        console.log('🖨️ GET_BADGE_PDF: Badge file does not exist');
        return res.status(404).json({
          errorCode: 'BADGE_NOT_FOUND',
          message: 'Badge PDF non trouvé',
        });
      }

      console.log('🖨️ GET_BADGE_PDF: Badge file found, sending PDF');

      // Send the PDF file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="badge_${employee.matricule}.pdf"`);

      const fileStream = fs.createReadStream(badgePath);
      fileStream.pipe(res);

    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_BADGE_PDF_FAILED',
        message: error.message,
      });
    }
  }

  // Attendance Scanning
  async scanAttendanceQR(req, res) {
    try {
      const { qrData, type = 'CHECK_IN', hoursWorked } = req.body;

      if (!qrData) {
        return res.status(400).json({
          success: false,
          errorCode: 'VALIDATION_ERROR',
          message: 'QR code data is required',
          sound: 'error'
        });
      }

      if (!['CHECK_IN', 'CHECK_OUT'].includes(type)) {
        return res.status(400).json({
          success: false,
          errorCode: 'VALIDATION_ERROR',
          message: 'Invalid attendance type',
          sound: 'error'
        });
      }

      const result = await badgeService.processAttendanceScan(qrData, req.user.companyId, type, hoursWorked);

      if (result.success) {
        res.json({
          success: true,
          data: result,
        });
      } else {
        res.status(400).json({
          success: false,
          errorCode: 'SCAN_ATTENDANCE_FAILED',
          message: result.message,
          sound: result.sound
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        errorCode: 'SCAN_ATTENDANCE_FAILED',
        message: error.message,
        sound: 'error'
      });
    }
  }

  async validateBadgeQR(req, res) {
    try {
      const { qrData } = req.body;

      if (!qrData) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'QR code data is required',
        });
      }

      const validation = badgeService.validateQRData(qrData);

      res.json({
        success: true,
        data: validation,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'VALIDATE_QR_FAILED',
        message: error.message,
      });
    }
  }
}

module.exports = new AdminController();