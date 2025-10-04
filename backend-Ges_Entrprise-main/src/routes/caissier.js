const express = require('express');
const caissierController = require('../controllers/caissierController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Toutes les routes nécessitent authentification CAISSIER
router.use(authenticate);
router.use(authorize('CAISSIER'));

// Routes Employés (vue simplifiée)
router.get('/employees', caissierController.getEmployees);

// Routes Timesheets (validés seulement)
router.get('/timesheets', caissierController.getValidatedTimesheets);

// Routes Paiements
router.post('/payments', caissierController.createPayment);
router.get('/payments', caissierController.getPayments);

// Routes Présences (si permis)
router.post('/attendances/scan', caissierController.scanAttendance);

// Routes Reçus
router.get('/receipts/:id/pdf', caissierController.generateReceiptPDF);

module.exports = router;