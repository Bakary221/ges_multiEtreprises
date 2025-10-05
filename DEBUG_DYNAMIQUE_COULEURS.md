# 🔍 Debug : Couleurs Dynamiques par Entreprise

## 🎯 Objectif
Déboguer pourquoi toutes les entreprises voient la même couleur au lieu de leurs couleurs spécifiques.

## 📋 Logs à Vérifier

### **1. Console Browser (F12)**

#### **CompanyContext Logs**
```
CompanyContext useEffect: { user: {...}, userRole: "ADMIN", companyId: 25 }
Loading company data for companyId: 25
loadCompanyData called with companyId: 25
Token available: true
API response status: 200
API response data: { success: true, data: {...} }
Company data received: { id: 25, name: "LogoTest Company", primaryColor: "#FF6B35", ... }
Company set in state: { id: 25, name: "LogoTest Company", primaryColor: "#FF6B35", ... }
```

#### **AdminLayout Logs**
```
AdminLayout render: {
  user: {...},
  company: { id: 25, name: "LogoTest Company", primaryColor: "#FF6B35", ... }
}
```

### **2. Test par Entreprise**

#### **Test LogoTest Company (Orange)**
```
1. Se connecter: logotest@company.com / password123
2. Vérifier console:
   ✅ companyId: 25
   ✅ primaryColor: "#FF6B35"
   ✅ secondaryColor: "#F7931E"
   ✅ Interface: Orange
```

#### **Test jamih (Bleu)**
```
1. Se connecter: jamih@gmail.com / password123
2. Vérifier console:
   ✅ companyId: 24
   ✅ primaryColor: "#2563EB"
   ✅ secondaryColor: "#1E40AF"
   ✅ Interface: Bleu
```

#### **Test tek (Bleu)**
```
1. Se connecter: tek@gmail.com / password123
2. Vérifier console:
   ✅ companyId: 23
   ✅ primaryColor: "#2563EB"
   ✅ secondaryColor: "#1E40AF"
   ✅ Interface: Bleu
```

## 🔧 **Dépannage**

### **Si company est null/undefined**
```
❌ AdminLayout render: { user: {...}, company: null }
```

**Solutions :**
1. **Vérifier token** : `localStorage.getItem('accessToken')` existe ?
2. **Vérifier API** : `/api/company` retourne 200 ?
3. **Vérifier user.companyId** : Est défini dans AuthContext ?

### **Si couleurs sont les mêmes**
```
❌ primaryColor: "#4F46E5" (fallback)
```

**Solutions :**
1. **Base de données** : Couleurs définies dans table `company` ?
2. **API response** : Contient `primaryColor` et `secondaryColor` ?
3. **CompanyContext** : `setCompany(companyData)` appelé ?

### **Si logo ne s'affiche pas**
```
❌ company.logo: null
```

**Solutions :**
1. **Base de données** : Logo défini dans table `company` ?
2. **URL valide** : `http://localhost:3000/uploads/logos/...` accessible ?

## 🎯 **Résultat Attendu**

**Chaque entreprise doit avoir :**
- ✅ **CompanyContext** : Charge ses propres données
- ✅ **AdminLayout** : Applique ses propres couleurs
- ✅ **Interface** : Branding unique par entreprise
- ✅ **Logo** : Affiché si présent

## 🚀 **Actions Immédiates**

1. **Ouvrir console** (F12) pendant connexion admin
2. **Vérifier logs** CompanyContext et AdminLayout
3. **Comparer** avec les données attendues ci-dessus
4. **Corriger** les problèmes identifiés

Le système **doit être 100% dynamique** ! 🔧