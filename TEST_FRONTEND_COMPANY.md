# 🧪 Test de création d'entreprise depuis le Frontend

## 📋 Prérequis
- Backend démarré sur `http://localhost:3000`
- Frontend démarré sur `http://localhost:5175`
- Base de données MySQL accessible

## 🚀 Étapes de test

### 1. Accéder au Frontend
```
Ouvrez votre navigateur et allez à : http://localhost:5175
```

### 2. Se connecter en tant que SuperAdmin
- **Email** : Utilisez un compte SuperAdmin existant
- **Mot de passe** : Mot de passe du compte

### 3. Aller à la création d'entreprise
- Cliquez sur "Entreprises" dans le menu latéral
- Cliquez sur "Créer une entreprise" ou le bouton "+"

### 4. Remplir le formulaire

#### Section "Informations de l'Entreprise" :
- **Nom de l'Entreprise** : `Test Frontend Company`
- **Devise** : `XOF`
- **Logo** : Optionnel
- **Couleurs** : Garder par défaut

#### Section "Administrateur de l'Entreprise" :
- **Nom Complet** : `Frontend Test Admin`
- **Poste** : `CTO`
- **Email** : `frontend@testcompany.com`
- **Mot de Passe** : `password123`

### 5. Soumettre le formulaire
- Cliquez sur "Créer l'Entreprise"
- Attendez le message de succès vert

### 6. Vérifier la création
- Vous devriez être redirigé vers la liste des entreprises
- L'entreprise "Test Frontend Company" devrait apparaître

## 🔍 Vérification en base de données

Après la création, vérifiez avec le script :

```bash
cd backend-Ges_Entrprise-main
node check-data.js
```

Vous devriez voir :
- ✅ **Entreprise** : "Test Frontend Company"
- ✅ **Utilisateur** : "frontend@testcompany.com" (rôle ADMIN)
- ✅ **Employé** : "Frontend Test Admin" (lié à l'utilisateur)
- ✅ **Départements** : 6 départements créés

## 🎯 Résultat attendu

Si tout fonctionne, vous verrez :
```
🏢 ENTREPRISES:
  ID: XX | Nom: Test Frontend Company | Créé: ...

👤 UTILISATEURS:
  ID: XX | Email: frontend@testcompany.com | Rôle: ADMIN | Entreprise: XX

👷 EMPLOYÉS:
  ID: XX | Nom: Frontend Test Admin | UserId: XX | Entreprise: XX
```

## 🐛 Si ça ne marche pas

### Erreur possible 1 : "adminEmail is not allowed"
- **Cause** : Schéma Joi incorrect
- **Solution** : Vérifier le contrôleur `superAdminController.js`

### Erreur possible 2 : "Invalid access token"
- **Cause** : Token expiré ou invalide
- **Solution** : Se reconnecter

### Erreur possible 3 : "Company already exists"
- **Cause** : Entreprise avec ce nom existe déjà
- **Solution** : Changer le nom

## ✅ Code fonctionnel

Le code backend fonctionne parfaitement :
- ✅ Création entreprise dans `companies`
- ✅ Création utilisateur dans `users`
- ✅ Création employé dans `employees` avec liaison `userId`
- ✅ Création 6 départements
- ✅ Création log d'initialisation

**Testez maintenant depuis l'interface frontend !** 🎉