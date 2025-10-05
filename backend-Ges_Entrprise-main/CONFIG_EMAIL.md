# 📧 Configuration des Emails

## 🚀 Configuration Rapide avec Mailtrap (Recommandé)

### Étape 1 : Créer un compte Mailtrap
1. Allez sur [https://mailtrap.io/](https://mailtrap.io/)
2. Cliquez sur "Sign Up Free"
3. Créez votre compte (gratuit)

### Étape 2 : Obtenir les paramètres SMTP
1. Dans votre dashboard Mailtrap, cliquez sur "Inboxes" (à gauche)
2. Cliquez sur votre inbox (par défaut "My Inbox")
3. Cliquez sur "SMTP Settings" (en haut)
4. Copiez les informations :
   - **Host**: `smtp.mailtrap.io`
   - **Port**: `2525`
   - **Username**: (votre username Mailtrap)
   - **Password**: (votre password Mailtrap)

### Étape 3 : Configurer le fichier .env
Remplacez dans `backend-Ges_Entrprise-main/.env` :

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=votre-username-mailtrap-ici
SMTP_PASS=votre-password-mailtrap-ici
DISABLE_EMAILS=false
```

### Étape 4 : Tester les emails
```bash
cd backend-Ges_Entrprise-main
node test-email.js
```

### Étape 5 : Voir les emails
1. Retournez sur [mailtrap.io](https://mailtrap.io/)
2. Cliquez sur votre inbox
3. Les emails apparaîtront dans "Check your inbox"

## 🔧 Configuration Alternative avec Gmail

### Prérequis
1. Activer la [vérification en deux étapes](https://myaccount.google.com/signinoptions/two-step-verification)
2. Générer un [mot de passe d'application](https://myaccount.google.com/apppasswords)

### Configuration .env
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application-gmail
DISABLE_EMAILS=false
```

## 🧪 Test des Emails

### Test rapide
```bash
cd backend-Ges_Entrprise-main
node test-email.js
```

### Test complet
1. Créez un employé via l'interface admin
2. Vérifiez les logs du serveur
3. Consultez votre inbox Mailtrap/Gmail

## 📨 Types d'Emails Envoyés

Lors de la création d'un employé, le système envoie **3 emails** :

1. **Email de bienvenue** - Présentation de l'entreprise
2. **Email avec badge** - QR code et informations d'accès
3. **Email d'identifiants** - Login/mot de passe pour se connecter

## 🔧 Dépannage

### Erreur "535 Authentication failed"
- Vérifiez vos identifiants SMTP
- Pour Gmail : utilisez un mot de passe d'application, pas votre mot de passe normal

### Erreur "Connection timeout"
- Vérifiez la connectivité internet
- Vérifiez que le port SMTP n'est pas bloqué

### Emails ne arrivent pas
- Vérifiez `DISABLE_EMAILS=false` dans .env
- Vérifiez les logs du serveur pour les erreurs
- Testez avec le script `test-email.js`

## 📝 Variables d'Environnement

```env
# Configuration SMTP
SMTP_HOST=smtp.mailtrap.io          # Serveur SMTP
SMTP_PORT=2525                      # Port SMTP
SMTP_USER=votre-username            # Nom d'utilisateur
SMTP_PASS=votre-password            # Mot de passe
BASE_URL=http://localhost:3000      # URL de base de l'application

# Contrôle des emails
DISABLE_EMAILS=false                # true = désactiver, false = activer