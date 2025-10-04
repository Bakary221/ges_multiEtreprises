const fs = require('fs');
const path = require('path');

class I18n {
  constructor() {
    this.translations = {};
    this.defaultLocale = 'fr';
    this.loadTranslations();
  }

  loadTranslations() {
    const localesPath = path.join(__dirname, '..', 'locales');

    if (!fs.existsSync(localesPath)) {
      fs.mkdirSync(localesPath, { recursive: true });
    }

    // Langues supportées
    const locales = ['fr', 'en'];

    locales.forEach(locale => {
      const filePath = path.join(localesPath, `${locale}.json`);
      if (fs.existsSync(filePath)) {
        try {
          this.translations[locale] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
          console.error(`Error loading ${locale} translations:`, error);
          this.translations[locale] = {};
        }
      } else {
        // Créer fichier par défaut
        this.createDefaultTranslations(locale, filePath);
      }
    });
  }

  createDefaultTranslations(locale, filePath) {
    const defaultTranslations = {
      fr: {
        // Auth
        'auth.login.success': 'Connexion réussie',
        'auth.login.failed': 'Échec de connexion',
        'auth.register.success': 'Inscription réussie',
        'auth.logout.success': 'Déconnexion réussie',

        // Employees
        'employee.created': 'Employé créé avec succès',
        'employee.updated': 'Employé mis à jour',
        'employee.not_found': 'Employé non trouvé',

        // Payments
        'payment.completed': 'Paiement effectué',
        'payment.pending': 'Paiement en attente',

        // Timesheets
        'timesheet.validated': 'Feuille de temps validée',
        'timesheet.submitted': 'Feuille de temps soumise',

        // Errors
        'error.validation': 'Erreur de validation',
        'error.unauthorized': 'Non autorisé',
        'error.forbidden': 'Accès interdit',
        'error.not_found': 'Ressource non trouvée',
        'error.internal': 'Erreur interne du serveur',
      },
      en: {
        // Auth
        'auth.login.success': 'Login successful',
        'auth.login.failed': 'Login failed',
        'auth.register.success': 'Registration successful',
        'auth.logout.success': 'Logout successful',

        // Employees
        'employee.created': 'Employee created successfully',
        'employee.updated': 'Employee updated',
        'employee.not_found': 'Employee not found',

        // Payments
        'payment.completed': 'Payment completed',
        'payment.pending': 'Payment pending',

        // Timesheets
        'timesheet.validated': 'Timesheet validated',
        'timesheet.submitted': 'Timesheet submitted',

        // Errors
        'error.validation': 'Validation error',
        'error.unauthorized': 'Unauthorized',
        'error.forbidden': 'Forbidden',
        'error.not_found': 'Resource not found',
        'error.internal': 'Internal server error',
      }
    };

    this.translations[locale] = defaultTranslations[locale] || {};
    fs.writeFileSync(filePath, JSON.stringify(this.translations[locale], null, 2));
  }

  t(key, locale = null, params = {}) {
    const userLocale = locale || this.defaultLocale;
    const translation = this.translations[userLocale]?.[key] || this.translations[this.defaultLocale]?.[key] || key;

    // Remplacer les paramètres
    return translation.replace(/\{(\w+)\}/g, (match, param) => params[param] || match);
  }

  setLocale(locale) {
    if (this.translations[locale]) {
      this.defaultLocale = locale;
    }
  }

  getAvailableLocales() {
    return Object.keys(this.translations);
  }

  addTranslation(locale, key, value) {
    if (!this.translations[locale]) {
      this.translations[locale] = {};
    }
    this.translations[locale][key] = value;

    // Sauvegarder dans le fichier
    const filePath = path.join(__dirname, '..', 'locales', `${locale}.json`);
    fs.writeFileSync(filePath, JSON.stringify(this.translations[locale], null, 2));
  }
}

module.exports = new I18n();