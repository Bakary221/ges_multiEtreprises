const express = require('express');
const webhookController = require('../controllers/webhookController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Toutes les routes nécessitent authentification ADMIN
router.use(authenticate);
router.use(authorize('ADMIN'));

// Routes webhooks
router.post('/', webhookController.registerWebhook);
router.get('/', webhookController.getWebhooks);
router.delete('/:id', webhookController.deleteWebhook);
router.post('/:id/test', webhookController.testWebhook);

module.exports = router;