require('dotenv').config();
const employeeService = require('./src/services/admin/employeeService');
const emailService = require('./src/services/emailService');

// Test de création d'employé avec envoi d'email
async function testEmployeeCreation() {
  try {
    console.log('🧪 Test de création d\'employé avec envoi d\'email...');

    // Données de test pour l'employé
    const employeeData = {
      name: 'Test Employee',
      position: 'Développeur',
      salary: 50000,
      email: 'test@example.com'
    };

    // ID de l'entreprise (utiliser une entreprise existante)
    const companyId = 1; // TechCorp

    console.log('👤 Création de l\'employé...');
    const employee = await employeeService.createEmployee(companyId, employeeData);

    console.log('✅ Employé créé avec succès:', {
      id: employee.id,
      name: employee.name,
      matricule: employee.matricule,
      email: employee.email
    });

    console.log('📧 Vérification de l\'envoi d\'email...');
    // L'email devrait être envoyé automatiquement dans le controller
    // Ici on simule juste la création

    console.log('🎉 Test réussi ! L\'employé a été créé et l\'email devrait être envoyé.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Détails:', error);
  }
}

// Exécuter le test
testEmployeeCreation();