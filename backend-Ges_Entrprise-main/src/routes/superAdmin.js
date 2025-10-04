const express = require('express');
const superAdminController = require('../controllers/superAdminController');
const { authenticate, authorize } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/logos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  }
});

const router = express.Router();

// Toutes les routes nécessitent authentification SUPERADMIN
router.use(authenticate);
router.use(authorize('SUPERADMIN'));

// Routes pour les entreprises
router.post('/companies', superAdminController.createCompany);
router.post('/companies/with-admin', superAdminController.createCompanyWithAdmin);
router.get('/companies', superAdminController.getCompanies);
router.get('/companies/:id', superAdminController.getCompanyById);
router.put('/companies/:id', superAdminController.updateCompany);
router.delete('/companies/:id', superAdminController.deleteCompany);

// Routes pour les utilisateurs d'entreprise
router.post('/companies/:companyId/users', superAdminController.createUserForCompany);

// Routes pour les logs
router.get('/logs', superAdminController.getLogs);

// Routes pour les fichiers
router.post('/files/upload', upload.single('file'), superAdminController.uploadFile);

// Routes pour les statistiques du dashboard
router.get('/dashboard/stats', superAdminController.getDashboardStats);

module.exports = router;