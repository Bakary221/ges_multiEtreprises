# 🔍 Debug : LogoTest Company - Couleurs Bleues au lieu d'Orange

## 🎯 Problème
Quand vous vous connectez avec `logotest@company.com`, le sidebar affiche du **bleu** au lieu d'**orange**, et le logo ne s'affiche pas.

## 📊 **Données Attendues pour LogoTest**
```json
{
  "id": 25,
  "name": "LogoTest Company",
  "primaryColor": "#FF6B35",
  "secondaryColor": "#F7931E",
  "logo": "http://localhost:3000/uploads/logos/logo-1759595987913-180758774.jpeg"
}
```

## 🧪 **Étapes de Debug**

### **1. Ouvrir Console Navigateur (F12)**

**Connectez-vous avec `logotest@company.com`** et regardez les logs :

#### **CompanyContext Logs**
```
CompanyContext useEffect triggered: {
  user: { companyId: 25, role: "ADMIN", ... },
  userRole: "ADMIN",
  companyId: 25
}
Loading company data for companyId: 25
loadCompanyData called with companyId: 25
Token available: true
API response status: 200
API response data: {
  success: true,
  data: {
    id: 25,
    name: "LogoTest Company",
    primaryColor: "#FF6B35",
    secondaryColor: "#F7931E",
    logo: "http://localhost:3000/uploads/logos/..."
  }
}
Company data received: { primaryColor: "#FF6B35", ... }
Company set in state: { primaryColor: "#FF6B35", ... }
```

#### **AdminLayout Logs**
```
AdminLayout render - Company data: {
  id: 25,
  name: "LogoTest Company",
  primaryColor: "#FF6B35",
  secondaryColor: "#F7931E",
  logo: "http://localhost:3000/uploads/logos/logo-1759595987913-180758774.jpeg"
}
```

### **2. Si les Logs Sont Présents**

**✅ Le système fonctionne !** Les données sont chargées correctement.

**Vérifiez dans l'interface :**
- Le sidebar devrait être **orange** (#FF6B35)
- Le logo devrait s'afficher
- Les éléments devraient être en **orange clair** (#F7931E)

### **3. Si Company Data est `null` ou `undefined`**

**❌ Problème détecté !**

#### **Cause Possible 1 : CompanyContext ne se déclenche pas**
```
CompanyContext useEffect triggered: { user: null, userRole: null }
Not loading company data - conditions not met
```

**Solution :** L'authentification n'est pas complète. Rafraîchissez la page.

#### **Cause Possible 2 : API échoue**
```
API response status: 401
API response data: { errorCode: "INVALID_TOKEN" }
```

**Solution :** Le token a expiré. Reconnectez-vous.

#### **Cause Possible 3 : Erreur réseau**
```
Error loading company data: TypeError: Failed to fetch
```

**Solution :** Le serveur backend n'est pas démarré.

### **4. Vérifier l'État du Serveur**

**Terminal Backend :**
```bash
cd backend-Ges_Entrprise-main && npm run dev
# Devrait afficher : Server running on port 3000
```

**Terminal Frontend :**
```bash
cd frontend && npm run dev
# Devrait afficher : Local: http://localhost:5173/
```

### **5. Test Direct de l'API**

**Ouvrez un nouvel onglet et allez à :**
```
http://localhost:3000/company
```

**Avec les headers :**
```
Authorization: Bearer [votre-token-dans-le-localStorage]
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "name": "LogoTest Company",
    "primaryColor": "#FF6B35",
    "secondaryColor": "#F7931E",
    "logo": "http://localhost:3000/uploads/logos/logo-1759595987913-180758774.jpeg"
  }
}
```

## 🎯 **Résolution**

### **Si les données arrivent bien :**
- ✅ **Videz le cache** : Ctrl+F5
- ✅ **Reconnectez-vous** : `logotest@company.com`

### **Si les données n'arrivent pas :**
- ❌ **Redémarrez les serveurs**
- ❌ **Vérifiez la console** pour les erreurs
- ❌ **Reconnectez-vous**

## 🚀 **Test Final**

1. **Ouvrez la console** (F12)
2. **Connectez-vous** : `logotest@company.com`
3. **Vérifiez les logs** CompanyContext et AdminLayout
4. **Confirmez** : Sidebar orange + logo affiché

Le système **devrait maintenant afficher l'orange et le logo** ! 🟠🖼️