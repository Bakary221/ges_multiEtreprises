const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Routes publiques
router.post('/login', authController.login);
router.post('/register-superadmin', authController.registerSuperAdmin);
router.post('/refresh', authController.refreshToken);

// Routes protégées
router.use(authenticate);
router.post('/logout', authController.logout);
router.post('/impersonate/:companyId', authorize('SUPERADMIN'), authController.impersonate);

module.exports = router;