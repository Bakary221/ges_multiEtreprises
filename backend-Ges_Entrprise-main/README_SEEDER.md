# 🌱 Seeder - Données de Test Complètes

## 📋 Vue d'ensemble

Le seeder crée un jeu de données complet pour tester toutes les fonctionnalités du système de gestion de paie. Il génère des données réalistes pour 3 entreprises avec tous leurs employés, présences, paies, etc.

## 🚀 Utilisation Rapide

### Configuration de la base de données
```bash
# 1. Installer les dépendances
npm install

# 2. Configurer la base de données dans .env
DATABASE_URL="mysql://user:password@localhost:3306/payroll_db"

# 3. Appliquer les migrations
npm run db:migrate

# 4. Lancer le seeder
npm run db:seed

# OU tout en une fois
npm run db:setup
```

## 📊 Données Créées

### 🏢 Entreprises (3)
- **TechCorp Senegal** - Dakar, XOF
- **FinancePlus Mali** - Bamako, XOF
- **Logistics Côte d'Ivoire** - Abidjan, XOF

### 👥 Utilisateurs (31 total)
- **1 SuperAdmin** : Contrôle global du système
- **3 Admins** : 1 par entreprise (gestion RH, paie, employés)
- **3 Caissiers** : 1 par entreprise (paiements, reçus)
- **24 Employés** : 8 par entreprise (différents départements)

### 🏗️ Structure par Entreprise
Pour chaque entreprise :
- **5 Départements** : RH, Développement, Finance, Marketing, Opérations
- **8 Employés** : Répartis dans les départements
- **1 Admin** + **1 Caissier** + **8 Employés** = **10 utilisateurs**

### 📈 Données Historiques

#### Présences (30 jours)
- **Horaires** : 8h-17h (avec variations réalistes)
- **Taux de présence** : 90% (absences occasionnelles)
- **Weekends exclus** : Pas de présences le samedi/dimanche

#### Timesheets (3 mois)
- **Heures travaillées** : 140-180h par mois
- **Taux de validation** : 80% validés, 20% en attente

#### Bulletins de Paie (3 mois)
- **Calcul simplifié** : 80% du salaire brut
- **Payruns mensuels** : Regroupement par entreprise
- **PDF générés** : URLs simulées pour téléchargement

#### Congés (20 demandes)
- **Types** : Annuels, Maladie, Famille
- **Statuts** : En attente, Approuvé, Rejeté
- **Durées variables** : 1-10 jours

#### Paiements (liés aux bulletins)
- **Méthodes** : Virement, Orange Money, Wave
- **Statuts** : En attente, Réussi, Échec
- **Dates** : Certaines payées, d'autres en attente

### 🔔 Notifications & Logs
- **50 notifications** : Divers types (paie, congés, paiements)
- **100 logs d'audit** : Traçabilité des actions

## 🔐 Comptes de Test

### SuperAdmin (accès global)
```
Email: superadmin@payroll.com
Mot de passe: SuperAdmin123!
Rôle: SUPERADMIN
```

### Admins (1 par entreprise)
```
TechCorp: admin@techcorp.sn / Admin123!
FinancePlus: admin@financeplus.ml / Admin123!
Logistics: admin@logistics.ci / Admin123!
Rôle: ADMIN
```

### Caissiers (1 par entreprise)
```
TechCorp: caissier@techcorp.sn / Caissier123!
FinancePlus: caissier@financeplus.ml / Caissier123!
Logistics: caissier@logistics.ci / Caissier123!
Rôle: CAISSIER
```

### Employés (8 par entreprise)
```
Format: employee[1-8]@[entreprise].com
Mot de passe: Employee123!
Rôle: EMPLOYEE

Exemples:
employee1@techcorpsenegal.com
employee2@financeplusmali.com
employee3@logisticscotedivoire.com
```

## 📋 Scripts Disponibles

```bash
# Migration uniquement
npm run db:migrate

# Seeder uniquement (après migration)
npm run db:seed

# Reset complet de la DB
npm run db:reset

# Setup complet (migration + seed)
npm run db:setup

# Reset + Migration + Seed (recommandé)
npm run db:fresh
```

## 🎯 Scénarios de Test

### SuperAdmin
- ✅ Voir toutes les entreprises
- ✅ Créer/modifier/supprimer entreprises
- ✅ Se connecter à une entreprise
- ✅ Consulter statistiques globales

### Admin
- ✅ Gérer employés (CRUD)
- ✅ Pointer présences
- ✅ Valider timesheets
- ✅ Générer bulletins de paie
- ✅ Approuver congés
- ✅ Consulter rapports

### Caissier
- ✅ Traiter paiements
- ✅ Générer reçus
- ✅ Voir employés (lecture seule)

### Employé
- ✅ Consulter profil
- ✅ Voir bulletins de paie
- ✅ Demander congés
- ✅ Voir timesheets personnels

## 🔄 Régénération des Données

Pour régénérer les données de test :

```bash
# Reset complet et re-seed
npm run db:reset
npm run db:seed

# OU en une commande
npm run db:setup
```

## ⚠️ Notes Importantes

- **Mot de passe commun** : Tous les comptes ont des mots de passe simples pour les tests
- **Données réalistes** : Noms africains, entreprises régionales, salaires locaux
- **Historique complet** : 3 mois de données pour tester les rapports
- **Cohérence** : Toutes les relations foreign key sont respectées
- **Performance** : Optimisé pour ne pas surcharger la base

## 🎉 Prêt à Tester !

Après avoir lancé le seeder, vous pouvez :

1. **Démarrer le backend** : `npm run dev`
2. **Démarrer le frontend** : `cd ../frontend && npm run dev`
3. **Se connecter** avec n'importe quel compte ci-dessus
4. **Explorer** toutes les fonctionnalités du système

Le système est maintenant **100% fonctionnel** avec des données de test complètes ! 🚀