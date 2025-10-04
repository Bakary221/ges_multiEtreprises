require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware de sécurité et logging
// app.use(helmet()); // Temporairement désactivé pour debug
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// app.use(morgan('combined')); // Temporairement désactivé pour debug
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
// const { swaggerUi, specs } = require('./src/config/swagger');
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Payroll Management API' });
});

// Routes des modules
app.use('/auth', require('./src/routes/auth'));
// Temporairement commenté pour debug
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