const express = require('express');
const integrationController = require('../controllers/integrationController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Toutes les routes nécessitent authentification
router.use(authenticate);

// Routes publiques (pour les employés)
router.get('/providers', integrationController.getSupportedProviders);
router.get('/exchange-rate/:from/:to', integrationController.getExchangeRate);

// Routes ADMIN seulement
router.use(authorize('ADMIN'));
router.post('/payments/initiate', integrationController.initiatePayment);
router.get('/payments/:transactionId/status', integrationController.checkPaymentStatus);
router.post('/payments/bulk', integrationController.bulkPayment);

module.exports = router;