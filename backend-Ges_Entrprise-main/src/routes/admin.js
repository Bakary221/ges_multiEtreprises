const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Toutes les routes nécessitent authentification
router.use(authenticate);

// Routes Employés
router.post('/employees', authorize(['ADMIN', 'SUPERADMIN']), adminController.createEmployee);
router.get('/employees', authorize(['ADMIN', 'SUPERADMIN']), adminController.getEmployees);
router.get('/employees/:id', authorize(['ADMIN', 'SUPERADMIN']), adminController.getEmployeeById);
router.put('/employees/:id', authorize(['ADMIN', 'SUPERADMIN']), adminController.updateEmployee);
router.patch('/employees/:id/status', authorize(['ADMIN', 'SUPERADMIN']), adminController.updateEmployeeStatus);
router.patch('/employees/:id/archive', authorize(['ADMIN', 'SUPERADMIN']), adminController.archiveEmployee);

// Routes Présences
router.post('/attendances/scan', authorize(['ADMIN', 'SUPERADMIN']), adminController.scanAttendance);
router.get('/attendances', authorize(['ADMIN', 'SUPERADMIN']), adminController.getAttendances);

// Routes Timesheets
router.post('/timesheets', authorize(['ADMIN', 'SUPERADMIN']), adminController.createTimesheet);
router.get('/timesheets', authorize(['ADMIN', 'SUPERADMIN']), adminController.getTimesheets);
router.patch('/timesheets/:id/validate', authorize(['ADMIN', 'SUPERADMIN']), adminController.validateTimesheet);

// Routes Paie
router.post('/payruns', authorize(['ADMIN', 'SUPERADMIN']), adminController.generatePayrun);
router.get('/payruns', authorize(['ADMIN', 'SUPERADMIN']), adminController.getPayruns);
router.patch('/payruns/:id/status', authorize(['ADMIN', 'SUPERADMIN']), adminController.updatePayrunStatus);
router.get('/payslips', authorize(['ADMIN', 'SUPERADMIN']), adminController.getPayslips);
router.get('/payslips/:id', authorize(['ADMIN', 'SUPERADMIN']), adminController.getPayslipById);
router.get('/payslips/:id/pdf', authorize(['ADMIN', 'SUPERADMIN']), adminController.generatePayslipPDF);

// Routes Rapports
router.get('/reports/payroll-summary', authorize(['ADMIN', 'SUPERADMIN']), adminController.getPayrollSummary);
router.get('/reports/employee-distribution', authorize(['ADMIN', 'SUPERADMIN']), adminController.getEmployeeDistribution);
router.get('/reports/attendance-summary', authorize(['ADMIN', 'SUPERADMIN']), adminController.getAttendanceSummary);
router.get('/reports/export/:type', authorize(['ADMIN', 'SUPERADMIN']), adminController.exportReport);

// Routes RH étendue
router.post('/departments', authorize(['ADMIN', 'SUPERADMIN']), adminController.createDepartment);
router.get('/departments', authorize(['ADMIN', 'SUPERADMIN']), adminController.getDepartments);
router.post('/contracts', authorize(['ADMIN', 'SUPERADMIN']), adminController.createContract);
router.get('/contracts', authorize(['ADMIN', 'SUPERADMIN']), adminController.getContracts);
router.patch('/contracts/:id', authorize(['ADMIN', 'SUPERADMIN']), adminController.updateContract);

// Routes Congés & absences
router.get('/leave-requests', authorize(['ADMIN', 'SUPERADMIN']), adminController.getLeaveRequests);
router.patch('/leave-requests/:id/approve', authorize(['ADMIN', 'SUPERADMIN']), adminController.approveLeaveRequest);

// Routes Notifications
router.post('/notifications/send', authorize(['ADMIN', 'SUPERADMIN']), adminController.sendNotification);
router.get('/notifications', authorize(['ADMIN', 'SUPERADMIN']), adminController.getNotifications);

// Routes Logs entreprise
router.get('/logs/company', authorize(['ADMIN', 'SUPERADMIN']), adminController.getCompanyLogs);

// Routes Entreprise
router.get('/company', authorize(['ADMIN', 'SUPERADMIN']), adminController.getMyCompany);

// Routes Statistiques
router.get('/company/stats', authorize(['ADMIN', 'SUPERADMIN']), adminController.getCompanyStats);
router.get('/dashboard/charts', authorize(['ADMIN', 'SUPERADMIN']), adminController.getDashboardCharts);

// Routes Badges
router.post('/employees/:employeeId/badge', authorize(['ADMIN', 'SUPERADMIN']), adminController.generateEmployeeBadge);
router.get('/employees/:employeeId/badge', authorize(['ADMIN', 'SUPERADMIN']), adminController.getEmployeeBadge);
router.get('/employees/:employeeId/badge-details', authorize(['ADMIN', 'SUPERADMIN']), adminController.getEmployeeBadgeDetails);
router.get('/employees/:employeeId/badge-pdf', authorize(['ADMIN', 'SUPERADMIN']), adminController.getEmployeeBadgePDF);
router.post('/attendance/scan-qr', authorize(['ADMIN', 'SUPERADMIN']), adminController.scanAttendanceQR);
router.post('/badge/validate-qr', authorize(['ADMIN', 'SUPERADMIN']), adminController.validateBadgeQR);

module.exports = router;
