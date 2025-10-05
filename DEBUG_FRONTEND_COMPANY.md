# 🔍 Debug : Création d'entreprise depuis le Frontend

## 📋 Problème identifié
Le frontend crée l'entreprise mais les données de l'admin ne sont pas dans les tables `users` et `employees`.

## 🛠️ Debug activé
J'ai ajouté des logs dans le code pour tracer le problème :

### **Frontend** (`CreateCompany.jsx`) :
```javascript
console.log('📤 Données envoyées au backend:', formData);
const response = await companyService.createCompany(formData);
console.log('📥 Réponse du backend:', response);
```

### **Backend** (`superAdminController.js`) :
```javascript
console.log('📥 Données reçues du frontend:', req.body);
// + logs de validation et création
```

## 🚀 Test de debug

### 1. Ouvrir la console du navigateur
- **Chrome/Edge** : F12 → Console
- **Firefox** : F12 → Console

### 2. Tester la création d'entreprise
1. Aller sur `http://localhost:5175`
2. Se connecter en SuperAdmin
3. Aller dans "Entreprises" → "Créer une entreprise"
4. Remplir le formulaire :
   - **Nom** : `Debug Test Company`
   - **Admin Name** : `Debug Test Admin`
   - **Admin Email** : `debug@testcompany.com`
   - **Admin Password** : `password123`
5. Cliquer sur "Créer l'Entreprise"

### 3. Observer les logs

#### **Console Frontend** (navigateur) :
```
📤 Données envoyées au backend: {
  name: "Debug Test Company",
  adminName: "Debug Test Admin",
  adminEmail: "debug@testcompany.com",
  adminPassword: "password123",
  adminPosition: "Administrateur",
  currency: "XOF",
  // ...
}
📥 Réponse du backend: { success: true, data: {...} }
```

#### **Console Backend** (terminal) :
```
📥 Données reçues du frontend: {
  name: "Debug Test Company",
  adminName: "Debug Test Admin",
  adminEmail: "debug@testcompany.com",
  adminPassword: "password123",
  adminPosition: "Administrateur",
  // ...
}
✅ Validation passée, création de l'entreprise...
✅ Entreprise créée avec succès: { company: {...}, admin: {...} }
```

### 4. Vérifier la base de données
```bash
cd backend-Ges_Entrprise-main
node check-data.js
```

## 🔍 Analyse des résultats

### **Si les logs montrent** :
- ✅ **Frontend envoie** : `adminEmail`, `adminPassword`, `adminName`
- ✅ **Backend reçoit** : `adminEmail`, `adminPassword`, `adminName`
- ✅ **Backend crée** : utilisateur + employé

**Alors le code fonctionne !** Vérifiez votre outil de base de données.

### **Si les logs montrent** :
- ❌ **Backend reçoit** : seulement `name`, `currency` (pas les champs admin)

**Alors le problème est dans l'envoi des données du frontend.**

### **Si les logs montrent** :
- ✅ **Backend reçoit** : tous les champs admin
- ❌ **Mais pas de création** : utilisateur/employé

**Alors le problème est dans le service backend.**

## 🎯 Prochaines étapes

1. **Testez** la création d'entreprise
2. **Copiez** les logs du navigateur et du terminal
3. **Vérifiez** la base de données avec `node check-data.js`

Cela nous permettra d'identifier exactement où se trouve le problème ! 🔧