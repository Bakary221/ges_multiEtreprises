# Payroll Management API

Backend API REST complet pour la gestion de paie et d'employés multi-entreprises avec authentification RBAC.

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Configuration DB (modifier .env)
DATABASE_URL="mysql://user:pass@localhost:3306/payroll_db"

# Migration base de données
npx prisma migrate dev

# Démarrage
npm start
# ou développement
npm run dev
```

## 📋 Fonctionnalités

### 🔐 Authentification RBAC
- **SuperAdmin** : Gestion globale multi-entreprises
- **Admin** : Gestion entreprise (employés, paie, rapports)
- **Caissier** : Paiements et vues financières
- **Employé** : Self-service (profil, paie, congés)

### 🏢 Gestion Multi-Entreprises
- Création et gestion d'entreprises
- Isolation des données par `companyId`
- Utilisateurs rattachés à leur entreprise

### 👥 Gestion RH Complète
- CRUD employés avec contrats
- Gestion présences/pointage
- Timesheets et validation
- Calcul automatique de paie
- Gestion congés et absences

### 📊 Rapports & Analytics
- Résumé paie par période
- Distribution employés
- Statistiques présences
- Exports CSV/JSON

## 📚 API Endpoints

### Auth
```
POST /auth/register-superadmin
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/impersonate/:companyId
```

### SuperAdmin
```
POST /companies
GET  /companies
GET  /companies/:id
PUT  /companies/:id
DELETE /companies/:id
POST /companies/:id/users
GET  /logs
POST /files/upload
```

### Admin
```
# Employés
POST /employees
GET  /employees
GET  /employees/:id
PUT  /employees/:id
PATCH /employees/:id/status
PATCH /employees/:id/archive

# Présences
POST /attendances/scan
GET  /attendances

# Timesheets
POST /timesheets
GET  /timesheets
PATCH /timesheets/:id/validate

# Paie
POST /payruns
GET  /payslips
GET  /payslips/:id
GET  /payslips/:id/pdf

# RH étendue
POST /departments
GET  /departments
POST /contracts
GET  /contracts
PATCH /contracts/:id

# Congés
GET  /leave-requests
PATCH /leave-requests/:id/approve

# Rapports
GET  /reports/payroll-summary
GET  /reports/employee-distribution
GET  /reports/attendance-summary
GET  /reports/export/:type

# Logs & Notifications
GET  /logs/company
POST /notifications/send
GET  /notifications
```

### Caissier
```
GET  /employees          # Vue simplifiée
GET  /timesheets         # Validés uniquement
POST /payments
GET  /payments
POST /attendances/scan   # Si permis
GET  /receipts/:id/pdf
```

### Employé (Self-Service)
```
GET  /me
PUT  /me/profile
GET  /me/payslips
GET  /me/timesheets
POST /me/leave-request
GET  /me/leave-requests
```

## 🔧 Configuration

### Variables d'environnement (.env)
```env
DATABASE_URL=mysql://user:password@localhost:3306/payroll_db
JWT_SECRET=votre-secret-jwt-ici
JWT_REFRESH_SECRET=votre-refresh-secret-ici
PORT=3000
NODE_ENV=development
```

### Base de données
Le schéma Prisma gère automatiquement :
- Relations multi-tenant
- Indexes et contraintes
- Migrations versionnées

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

## 📖 Documentation API

Swagger UI disponible sur : `http://localhost:3000/api-docs`

## 🏗️ Architecture

```
src/
├── config/          # Configuration (Prisma, Swagger)
├── controllers/     # Logique contrôleurs par module
├── middlewares/     # Auth, validation, erreurs
├── routes/          # Définition routes
├── services/        # Logique métier
├── utils/           # Utilitaires (JWT, etc.)
└── models/          # Modèles de données (Prisma)
```

## 🔒 Sécurité

- **JWT** avec access + refresh tokens
- **RBAC** strict avec 4 niveaux
- **Validation** inputs avec Joi
- **Rate limiting** (extensible)
- **Logs** audit trail complets
- **CORS** et **Helmet** configurés

## 📊 Base de Données

Schéma principal :
- `User` (auth + RBAC)
- `Company` (multi-tenant)
- `Employee` (profil RH)
- `Attendance` (pointage)
- `Timesheet` (feuilles temps)
- `Payslip` (bulletins paie)
- `Payment` (paiements)
- `LeaveRequest` (congés)
- Plus : Department, Contract, Notification, Log

## 🚀 Déploiement

1. **Build** : `npm run build` (si applicable)
2. **DB** : Migration Prisma en production
3. **Serveur** : `npm start`
4. **Monitoring** : Logs Morgan + gestion erreurs

## 🔥 **Fonctionnalités Avancées**

### 🌐 Webhooks - Notifications Temps Réel
- Événements automatiques (paiements, validations, créations)
- Signature HMAC sécurisée
- Retry automatique et logging

### 🌍 Multi-langue (FR/EN)
- Traductions complètes
- Contexte utilisateur
- Extensible à d'autres langues

### 💳 Intégrations Bancaires
- **Orange Money**, **Wave**, **Bank Transfer**
- Paiements mobiles Afrique
- Taux de change automatiques
- Validation destinataires

### 📊 Analytics Avancés
- Prévisions paie
- KPIs RH (absentéisme, coût/employé)
- Exports Excel/CSV
- Dashboard multi-entreprises

### 🔐 Sécurité Renforcée
- RBAC 4 niveaux
- Audit trail complet
- Validation stricte
- Gestion erreurs standardisée

### 📱 Mobile-First
- API optimisée PWA
- Support hors ligne
- Sync automatique
- UX adaptée mobile

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commits descriptifs
4. Tests pour nouvelles features
5. Pull request

---

## 📚 Documentation Complète

- **[API Endpoints](./README.md)** - Guide complet des routes
- **[Advanced Features](./ADVANCED_FEATURES.md)** - Fonctionnalités avancées
- **[Test Results](./TEST_RESULTS.md)** - Résultats des tests
- **Swagger UI** : `http://localhost:3000/api-docs`

---

**Status** : ✅ Production Ready + Advanced Features

**Technologies** : Node.js, Express, Prisma, MySQL, JWT, Joi, Swagger, Webhooks, i18n