const express = require('express');
const employeeController = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middlewares/auth');
const getEmployeeFromUser = require('../middlewares/employeeAuth');

const router = express.Router();

// Toutes les routes nécessitent authentification EMPLOYEE
router.use(authenticate);
router.use(authorize('EMPLOYEE'));
router.use(getEmployeeFromUser);

// Routes self-service
router.get('/me', employeeController.getProfile);
router.put('/me/profile', employeeController.updateProfile);
router.get('/me/payslips', employeeController.getMyPayslips);
router.get('/me/timesheets', employeeController.getMyTimesheets);
router.post('/me/leave-request', employeeController.createLeaveRequest);
router.get('/me/leave-requests', employeeController.getMyLeaveRequests);

module.exports = router;