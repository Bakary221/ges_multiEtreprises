const puppeteer = require('playwright');

async function testCompanyCreation() {
  console.log('🧪 Test de création d\'entreprise depuis le frontend...\n');

  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Aller à la page de login
    console.log('1. Accès à la page de login...');
    await page.goto('http://localhost:5175/login');

    // Attendre que la page se charge
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Se connecter en tant que superadmin (vous devrez adapter les credentials)
    console.log('2. Connexion en tant que SuperAdmin...');
    await page.fill('input[type="email"]', 'superadmin@test.com'); // Adapter selon vos données
    await page.fill('input[type="password"]', 'password123'); // Adapter selon vos données

    await page.click('button[type="submit"]');

    // Attendre la redirection
    await page.waitForURL('**/superadmin/**', { timeout: 10000 });

    console.log('3. Redirection vers dashboard SuperAdmin réussie');

    // Aller à la page de création d'entreprise
    console.log('4. Accès à la page de création d\'entreprise...');
    await page.goto('http://localhost:5175/superadmin/companies/create');

    // Attendre que le formulaire se charge
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });

    // Remplir le formulaire
    console.log('5. Remplissage du formulaire...');
    await page.fill('input[name="name"]', 'Test Frontend Company');
    await page.fill('input[name="adminName"]', 'Frontend Test Admin');
    await page.fill('input[name="adminEmail"]', 'frontend@testcompany.com');
    await page.fill('input[name="adminPassword"]', 'password123');
    await page.fill('input[name="adminPosition"]', 'CTO');

    // Soumettre le formulaire
    console.log('6. Soumission du formulaire...');
    await page.click('button[type="submit"]');

    // Attendre le succès
    await page.waitForSelector('.bg-green-100', { timeout: 15000 });

    console.log('✅ Création d\'entreprise réussie depuis le frontend !');

    // Vérifier les données en base
    console.log('7. Vérification des données en base...');
    const { PrismaClient } = require('./backend-Ges_Entrprise-main/node_modules/@prisma/client');
    const prisma = new PrismaClient();

    const companies = await prisma.company.findMany({
      where: { name: 'Test Frontend Company' },
      include: {
        users: true,
        employees: true
      }
    });

    if (companies.length > 0) {
      const company = companies[0];
      console.log('🏢 Entreprise trouvée:', company.name);
      console.log('👤 Utilisateur admin:', company.users.length > 0 ? company.users[0].email : 'Aucun');
      console.log('👷 Employé admin:', company.employees.length > 0 ? company.employees[0].name : 'Aucun');
      console.log('✅ Test complet réussi !');
    } else {
      console.log('❌ Entreprise non trouvée en base');
    }

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    await browser.close();
  }
}

testCompanyCreation();