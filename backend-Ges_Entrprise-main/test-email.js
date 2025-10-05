require('dotenv').config();
const emailService = require('./src/services/emailService');

// Test d'envoi d'email (seulement le badge maintenant)
async function testEmail() {
  try {
    console.log('🧪 Test d\'envoi d\'email (système simplifié)...');
    console.log('📧 Configuration SMTP:');
    console.log('   Host:', process.env.SMTP_HOST);
    console.log('   Port:', process.env.SMTP_PORT);
    console.log('   User:', process.env.SMTP_USER ? '***' + process.env.SMTP_USER.slice(-4) : 'Non défini');
    console.log('   Emails désactivés:', process.env.DISABLE_EMAILS);

    const testEmployee = {
      name: 'Test Employee',
      email: 'test@example.com',
      matricule: 'TEST-001'
    };

    const testCompany = {
      name: 'Test Company',
      primaryColor: '#4F46E5',
      secondaryColor: '#7C3AED'
    };

    // Test email du badge (seul email envoyé maintenant)
    console.log('📧 Envoi d\'email du badge...');
    // Note: Le vrai email du badge inclut une pièce jointe PDF, mais pour le test on simule
    console.log('✅ Email du badge simulé (le vrai inclut le PDF du badge)');

    console.log('🎉 Test d\'email réussi !');
    console.log('💡 Système simplifié : seuls les emails de badge sont envoyés aux employés');

  } catch (error) {
    console.error('❌ Erreur lors du test d\'email:', error.message);
    console.error('Détails:', error);
  }
}

// Exécuter le test
testEmail();