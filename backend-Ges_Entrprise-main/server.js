require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');

const app = express();

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

// Servir les fichiers statiques
app.use('/uploads', express.static('uploads'));

// Middleware de sécurité et logging
// app.use(helmet()); // Temporairement désactivé pour debug
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// app.use(morgan('combined')); // Temporairement désactivé pour debug

// Routes spéciales pour l'upload (sans middleware JSON)
const uploadRouter = express.Router();

// Route d'upload sans middleware JSON
uploadRouter.post('/files/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        errorCode: 'VALIDATION_ERROR',
        message: 'Aucun fichier uploadé',
      });
    }

    // Retourner l'URL accessible du fichier
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/logos/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        filename: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
      },
    });
  } catch (error) {
    res.status(500).json({
      errorCode: 'UPLOAD_FAILED',
      message: error.message,
    });
  }
});

// Appliquer le routeur d'upload AVANT les autres middlewares
app.use('/', uploadRouter);

// Middleware JSON - appliqué seulement aux routes qui en ont besoin
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger documentation
// const { swaggerUi, specs } = require('./src/config/swagger');
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Payroll Management API' });
});

// Routes publiques
app.use('/auth', require('./src/routes/auth'));

// Routes nécessitant authentification
const { authenticate } = require('./src/middlewares/auth');

// Appliquer l'authentification aux routes protégées
app.use('/', authenticate);
app.use('/', require('./src/routes/superAdmin'));
app.use('/', require('./src/routes/admin'));
app.use('/', require('./src/routes/caissier'));
app.use('/', require('./src/routes/employee'));
app.use('/webhooks', require('./src/routes/webhooks'));
app.use('/integrations', require('./src/routes/integrations'));

// TODO: Ajouter les autres routes des modules

const PORT = process.env.PORT || 3000;

// Middleware de gestion d'erreurs (doit être le dernier)
app.use(require('./src/middlewares/errorHandler'));

// Export pour les tests
module.exports = app;

// Démarrage du serveur seulement si ce fichier est exécuté directement
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}