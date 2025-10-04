const express = require('express');
const superAdminController = require('../controllers/superAdminController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Toutes les routes nécessitent authentification SUPERADMIN
router.use(authenticate);
router.use(authorize('SUPERADMIN'));

// Routes pour les entreprises
router.post('/companies', superAdminController.createCompany);
router.get('/companies', superAdminController.getCompanies);
router.get('/companies/:id', superAdminController.getCompanyById);
router.put('/companies/:id', superAdminController.updateCompany);
router.delete('/companies/:id', superAdminController.deleteCompany);

// Routes pour les utilisateurs d'entreprise
router.post('/companies/:companyId/users', superAdminController.createUserForCompany);

// Routes pour les logs
router.get('/logs', superAdminController.getLogs);

// Routes pour les fichiers
router.post('/files/upload', superAdminController.uploadFile);

// Routes pour les statistiques du dashboard
router.get('/dashboard/stats', superAdminController.getDashboardStats);

module.exports = router;