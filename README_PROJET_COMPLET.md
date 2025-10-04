# 🚀 **PROJET COMPLET - Système de Gestion de Paie**

## 📋 Vue d'ensemble

Application complète de gestion de paie multi-entreprises avec interface moderne React et API REST robuste. Le système supporte 4 niveaux d'utilisateurs (SuperAdmin, Admin, Caissier, Employé) avec des fonctionnalités complètes de RH et paie.

## 🏗️ Architecture

```
Projet_Entreprise/
├── backend-Ges_Entrprise-main/     # API REST Node.js + Prisma
│   ├── prisma/
│   │   ├── schema.prisma          # Schéma base de données
│   │   └── seed.js               # Données de test complètes
│   ├── src/
│   │   ├── controllers/           # Logique métier
│   │   ├── routes/               # Définition des routes
│   │   ├── services/             # Services métier
│   │   └── middlewares/          # Auth, validation
│   └── server.js                 # Point d'entrée
└── frontend/                      # Application React
    ├── src/
    │   ├── components/           # Composants réutilisables
    │   ├── pages/               # Pages par rôle
    │   ├── services/            # Services API
    │   └── utils/               # Utilitaires
    └── vite.config.js           # Proxy CORS
```

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** >= 16
- **MySQL** >= 8.0
- **npm** >= 8

### 1. Configuration Base de Données
```bash
# Créer la base de données MySQL
CREATE DATABASE payroll_db;
```

### 2. Backend Setup
```bash
cd backend-Ges_Entrprise-main

# Installer dépendances
npm install

# Configurer .env
cp .env.example .env
# Modifier DATABASE_URL avec vos identifiants MySQL

# Setup complet (migration + données de test)
npm run db:setup
```

### 3. Frontend Setup
```bash
cd ../frontend

# Installer dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

### 4. Lancement Final
```bash
# Terminal 1 - Backend
cd backend-Ges_Entrprise-main && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

**URLs :**
- **Frontend** : `http://localhost:5179/`
- **Backend API** : `http://localhost:3000/`
- **Documentation API** : `http://localhost:3000/api-docs`

## 🔐 Comptes de Test

### SuperAdmin (accès global)
```
Email: superadmin@payroll.com
Mot de passe: SuperAdmin123!
```

### Admins (1 par entreprise)
```
TechCorp: admin@techcorp.sn / Admin123!
FinancePlus: admin@financeplus.ml / Admin123!
Logistics: admin@logistics.ci / Admin123!
```

### Caissiers (1 par entreprise)
```
TechCorp: caissier@techcorp.sn / Caissier123!
FinancePlus: caissier@financeplus.ml / Caissier123!
Logistics: caissier@logistics.ci / Caissier123!
```

### Employés (8 par entreprise)
```
Format: employee[1-8]@[entreprise].com / Employee123!
Ex: employee1@techcorpsenegal.com
```

## 📊 Fonctionnalités par Rôle

### 👑 SuperAdmin
- ✅ **Dashboard** : Statistiques globales avec graphiques
- ✅ **Gestion entreprises** : CRUD complet
- ✅ **Connexion entreprise** : Impersonation admin
- ✅ **Logs système** : Audit trail global

### 🏢 Admin
- ✅ **Dashboard** : Métriques entreprise
- ✅ **Employés** : Gestion complète (CRUD)
- ✅ **Présences** : Pointage et historique
- ✅ **Timesheets** : Validation mensuelle
- ✅ **Départements** : Organisation RH
- ✅ **Contrats** : Gestion juridique
- ✅ **Congés** : Approbation demandes
- ✅ **Rapports** : Analytics détaillés
- ✅ **Paie** : Génération bulletins

### 💰 Caissier
- ✅ **Dashboard** : Vue paiements
- ✅ **Paiements** : Traitement et validation
- ✅ **Reçus** : Génération PDF
- ✅ **Employés** : Consultation (lecture seule)

### 👤 Employé
- ✅ **Dashboard** : Espace personnel
- ✅ **Profil** : Gestion informations
- ✅ **Bulletins** : Historique paie (PDF)
- ✅ **Timesheets** : Suivi personnel
- ✅ **Congés** : Demandes et suivi

## 🛠️ Scripts Disponibles

### Backend
```bash
npm run dev          # Développement avec nodemon
npm start           # Production
npm run db:migrate  # Migration Prisma
npm run db:seed     # Données de test
npm run db:setup    # Migration + Seed
npm run db:fresh    # Reset + Migration + Seed (recommandé)
npm run db:reset    # Reset complet DB
npm test           # Tests unitaires
```

### Frontend
```bash
npm run dev        # Serveur développement
npm run build      # Build production
npm run preview    # Aperçu production
```

## 📈 Données de Test

Le seeder crée **31 utilisateurs** répartis dans **3 entreprises** :

- **3 Entreprises** : TechCorp (SN), FinancePlus (ML), Logistics (CI)
- **15 Départements** : 5 par entreprise
- **27 Employés** : 9 par entreprise (8 employés + 1 admin/caissier)
- **30 jours** de présences réalistes
- **3 mois** de timesheets et bulletins
- **20 demandes** de congé
- **50 notifications** et **100 logs** d'audit

## 🔒 Sécurité

- **JWT** avec access + refresh tokens
- **RBAC** strict (4 niveaux)
- **Bcrypt** pour hashage mots de passe
- **CORS** configuré
- **Helmet** pour headers sécurité
- **Joi** pour validation données
- **Audit trail** complet

## 🎨 Interface Utilisateur

- **Design simple** et professionnel
- **Responsive** : Mobile, tablette, desktop
- **CSS pur** avec classes utilitaires
- **Animations subtiles** (loading, transitions)
- **Feedback utilisateur** complet
- **Navigation intuitive** par rôle

## 📚 Documentation

- ✅ **README_FRONTEND.md** : Guide frontend
- ✅ **README_SEEDER.md** : Données de test
- ✅ **API Docs** : Swagger UI (`/api-docs`)
- ✅ **Code commenté** : Documentation inline

## 🚀 Déploiement

### Production Backend
```bash
npm run build
npm start
```

### Production Frontend
```bash
npm run build
# Servir le dossier dist/
```

### Variables d'environnement
```env
# Backend
DATABASE_URL=mysql://user:pass@host:port/db
JWT_SECRET=votre-secret-jwt
JWT_REFRESH_SECRET=votre-refresh-secret
PORT=3000

# Frontend (optionnel)
VITE_API_URL=http://localhost:3000
```

## 🐛 Dépannage

### Erreur CORS
- Vérifier que le backend fonctionne sur le port 3000
- Le proxy Vite résout automatiquement les problèmes CORS en développement

### Erreur Base de Données
```bash
# Si données dupliquées (emails existants)
npm run db:fresh    # Reset + Migration + Seed

# OU étape par étape
npm run db:reset    # Reset complet
npm run db:migrate  # Migration
npm run db:seed     # Données de test
```

### Erreur Frontend
```bash
# Nettoyer cache
rm -rf node_modules/.vite
npm install
```

## 🎯 Points Forts

- ✅ **Architecture complète** : Frontend + Backend + DB
- ✅ **Sécurité robuste** : Auth, RBAC, audit
- ✅ **Données de test** : 31 comptes prêts à l'emploi
- ✅ **Interface moderne** : Simple et fonctionnelle
- ✅ **API complète** : 40+ endpoints documentés
- ✅ **Tests unitaires** : Jest configuré
- ✅ **Documentation** : Guides complets

## 🎉 Prêt à l'utilisation !

Le système est **100% fonctionnel** avec :

1. **Backend opérationnel** avec API REST complète
2. **Frontend moderne** avec interface utilisateur
3. **Base de données** avec données de test réalistes
4. **Documentation** complète pour utilisation et déploiement

**Lancez `npm run db:setup` dans le backend, puis démarrez les deux serveurs pour commencer !** 🚀