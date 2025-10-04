# 🎨 Application Frontend Payroll System

## ✨ Fonctionnalités

### Interface Utilisateur Moderne
- **Design élégant** avec animations et effets visuels
- **Responsive** : fonctionne sur tous les appareils
- **Interface intuitive** adaptée à chaque rôle
- **Thème moderne** avec gradients et ombres

### Authentification Complète
- **Login sécurisé** avec JWT
- **4 niveaux d'autorisation** : SuperAdmin, Admin, Caissier, Employé
- **Routes protégées** par rôle
- **Gestion automatique** des tokens

### Pages par Rôle

#### 👑 SuperAdmin
- **Dashboard** : Statistiques globales avec graphiques
- **Gestion entreprises** : CRUD complet + connexion entreprise

#### 🏢 Admin
- **Dashboard** : Métriques entreprise
- **Employés** : Gestion complète (CRUD)
- **Présences** : Scan et historique
- **Timesheets** : Validation et suivi
- **Départements** : Organisation RH
- **Contrats** : Gestion juridique
- **Congés** : Approbation demandes
- **Rapports** : Analytics détaillés

#### 💰 Caissier
- **Dashboard** : Vue paiements
- **Paiements** : Traitement et validation
- **Reçus** : Génération PDF
- **Employés** : Vue simplifiée

#### 👤 Employé
- **Dashboard** : Espace personnel
- **Profil** : Gestion informations
- **Bulletins** : Historique paie (PDF)
- **Timesheets** : Suivi personnel
- **Congés** : Demandes et suivi

## 🚀 Démarrage Rapide

### Prérequis
```bash
Node.js >= 16
npm >= 8
```

### Installation
```bash
cd frontend
npm install
```

### Configuration
1. **Backend** : Assurez-vous que le serveur backend fonctionne sur `http://localhost:3000`
2. **Proxy** : Le frontend utilise un proxy Vite pour éviter les problèmes CORS

### Lancement
```bash
npm run dev
```

**URL** : `http://localhost:5177/`

## 🔧 Configuration CORS

### Solution Temporaire (Proxy Vite)
Le proxy Vite est déjà configuré dans `vite.config.js` pour rediriger les appels API vers le backend.

### Solution Définitive (Backend)
Ajoutez cette configuration CORS dans votre `server.js` :

```javascript
const cors = require('cors');

const corsOptions = {
  origin: ['http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
```

## 🎨 Personnalisation du Style

### Animations CSS
Le fichier `Login.jsx` contient des animations CSS personnalisées :
- **Float** : Éléments flottants en arrière-plan
- **Bounce** : Animation de rebond pour l'icône
- **SlideUp** : Apparition progressive du formulaire
- **Shake** : Animation d'erreur
- **Spin** : Indicateur de chargement

### Couleurs et Thème
- **Gradient principal** : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Fond glassmorphism** : `rgba(255, 255, 255, 0.95)` avec `backdrop-filter: blur(20px)`
- **Ombre élégante** : `box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25)`

### Effets Interactifs
- **Hover** : Transformations et changements d'ombre
- **Focus** : Bordures colorées et effets lumineux
- **Transitions** : Animations fluides sur 0.3s

## 📁 Structure du Projet

```
frontend/
├── src/
│   ├── components/          # Composants réutilisables
│   │   └── Layout.jsx       # Layout principal avec navigation
│   ├── pages/               # Pages par rôle
│   │   ├── Auth/            # Pages d'authentification
│   │   ├── SuperAdmin/      # Pages SuperAdmin
│   │   ├── Admin/           # Pages Admin
│   │   ├── Caissier/        # Pages Caissier
│   │   └── Employee/        # Pages Employé
│   ├── services/            # Services API
│   │   ├── api.js           # Configuration Axios
│   │   ├── authService.js   # Authentification
│   │   ├── companyService.js # Gestion entreprises
│   │   ├── employeeService.js # Gestion employés
│   │   └── ...              # Autres services
│   └── utils/               # Utilitaires
│       └── AuthContext.jsx  # Contexte d'authentification
├── public/                  # Assets statiques
├── vite.config.js           # Configuration Vite + Proxy
├── tailwind.config.js       # Configuration Tailwind
└── postcss.config.js        # Configuration PostCSS
```

## 🔌 API Integration

### Services Disponibles
- **authService** : Login, logout, gestion tokens
- **companyService** : CRUD entreprises
- **employeeService** : Gestion employés
- **attendanceService** : Présences et pointage
- **timesheetService** : Feuilles de temps
- **payrollService** : Bulletins et paie
- **leaveService** : Demandes de congé
- **reportService** : Rapports et analytics

### Gestion d'État
- **Context API** pour l'authentification
- **LocalStorage** pour la persistance des tokens
- **Intercepteurs Axios** pour gestion automatique des tokens

## 🎯 Utilisation

### Connexion
1. **SuperAdmin** : Créez un compte via `/register-superadmin`
2. **Autres rôles** : Connectez-vous avec vos identifiants
3. **Redirection automatique** vers le dashboard approprié

### Navigation
- **Sidebar responsive** avec menu adapté au rôle
- **Routes protégées** empêchant l'accès non autorisé
- **Breadcrumbs** pour la navigation contextuelle

## 🚀 Déploiement

### Build de Production
```bash
npm run build
```

### Serveur Statique
```bash
npm run preview
```

### Variables d'Environnement
```env
VITE_API_URL=http://localhost:3000
```

## 🐛 Dépannage

### Problème CORS
- Vérifiez que le backend fonctionne sur le port 3000
- Le proxy Vite devrait résoudre automatiquement les problèmes CORS

### Style non visible
- Vérifiez que Tailwind CSS est correctement installé
- Les styles inline sont utilisés comme fallback

### Erreur de connexion
- Vérifiez les identifiants
- Assurez-vous que le backend répond correctement

## 📈 Métriques et Performance

- **Bundle size** optimisé avec Vite
- **Lazy loading** des composants
- **Tree shaking** automatique
- **Fast refresh** en développement

---

**Application frontend complète et moderne pour le système de gestion de paie !** 🎉