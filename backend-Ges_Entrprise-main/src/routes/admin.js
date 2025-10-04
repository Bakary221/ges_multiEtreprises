const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Toutes les routes nécessitent authentification ADMIN ou SUPERADMIN
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPERADMIN'));

// Routes Employés
router.post('/employees', adminController.createEmployee);
router.get('/employees', adminController.getEmployees);
router.get('/employees/:id', adminController.getEmployeeById);
router.put('/employees/:id', adminController.updateEmployee);
router.patch('/employees/:id/status', adminController.updateEmployeeStatus);
router.patch('/employees/:id/archive', adminController.archiveEmployee);

// Routes Présences
router.post('/attendances/scan', adminController.scanAttendance);
router.get('/attendances', adminController.getAttendances);

// Routes Timesheets
router.post('/timesheets', adminController.createTimesheet);
router.get('/timesheets', adminController.getTimesheets);
router.patch('/timesheets/:id/validate', adminController.validateTimesheet);

// Routes Paie
router.post('/payruns', adminController.generatePayrun);
router.get('/payslips', adminController.getPayslips);
router.get('/payslips/:id', adminController.getPayslipById);
router.get('/payslips/:id/pdf', adminController.generatePayslipPDF);

// Routes Rapports
router.get('/reports/payroll-summary', adminController.getPayrollSummary);
router.get('/reports/employee-distribution', adminController.getEmployeeDistribution);
router.get('/reports/attendance-summary', adminController.getAttendanceSummary);
router.get('/reports/export/:type', adminController.exportReport);

// Routes RH étendue
router.post('/departments', adminController.createDepartment);
router.get('/departments', adminController.getDepartments);
router.post('/contracts', adminController.createContract);
router.get('/contracts', adminController.getContracts);
router.patch('/contracts/:id', adminController.updateContract);

// Routes Congés & absences
router.get('/leave-requests', adminController.getLeaveRequests);
router.patch('/leave-requests/:id/approve', adminController.approveLeaveRequest);

// Routes Notifications
router.post('/notifications/send', adminController.sendNotification);
router.get('/notifications', adminController.getNotifications);

// Routes Logs entreprise
router.get('/logs/company', adminController.getCompanyLogs);

module.exports = router;