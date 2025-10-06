const express = require('express');
const caissierController = require('../controllers/caissierController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Toutes les routes nécessitent authentification (CAISSIER pour production)
router.use(authenticate);
// router.use(authorize('CAISSIER')); // Temporairement désactivé pour tests

// Routes Employés (vue simplifiée)
router.get('/employees', caissierController.getEmployees);

// Routes Timesheets (validés seulement)
router.get('/timesheets', caissierController.getValidatedTimesheets);

// Routes Payslips
router.get('/payslips', caissierController.getPayslips);
router.get('/payslips/:id/pdf', caissierController.generatePayslipPDF);

// Routes Payruns
router.get('/payruns', caissierController.getPayruns);
router.get('/payruns/:id', caissierController.getPayrunById);
router.patch('/payruns/:id/status', caissierController.updatePayrunStatus);

// Routes Paiements
router.post('/payments', caissierController.createPayment);
router.get('/payments', caissierController.getPayments);
router.delete('/payments/:id', caissierController.cancelPayment);
router.get('/payments/:id/receipt', caissierController.generatePaymentReceipt);
router.get('/payments/stats', caissierController.getPaymentStats);

// Routes Dashboard (statistiques dynamiques)
router.get('/dashboard/stats', caissierController.getDashboardStats);

// Routes Prêts
router.post('/loans', caissierController.createLoan);
router.get('/loans', caissierController.getLoans);
router.get('/loans/:id', caissierController.getLoanById);
router.post('/loans/:id/payments', caissierController.makeLoanPayment);
router.patch('/loans/:id/cancel', caissierController.cancelLoan);
router.get('/employees/:employeeId/loans/summary', caissierController.getEmployeeLoanSummary);

// Routes Présences (si permis)
router.post('/attendances/scan', caissierController.scanAttendance);

// Route de test
router.get('/test', (req, res) => {
  console.log('🔍 CAISSIER: Test route called for user:', req.user);
  res.json({
    success: true,
    message: 'Caissier routes working',
    user: req.user,
    data: {
      payslips: [],
      payments: [],
      loans: []
    }
  });
});

module.exports = router;