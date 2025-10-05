const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Vérification des données dans la base de données...\n');

  try {
    // Compter les entreprises
    const companyCount = await prisma.company.count();
    console.log(`📊 Nombre total d'entreprises: ${companyCount}`);

    // Récupérer la dernière entreprise créée
    const lastCompany = await prisma.company.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          where: { role: 'ADMIN' }
        },
        employees: true,
        departments: true
      }
    });

    if (lastCompany) {
      console.log('\n🏢 DERNIÈRE ENTREPRISE CRÉÉE:');
      console.log(`   ID: ${lastCompany.id}`);
      console.log(`   Nom: ${lastCompany.name}`);
      console.log(`   Devise: ${lastCompany.currency}`);
      console.log(`   Créée le: ${lastCompany.createdAt}`);

      console.log('\n👥 UTILISATEURS ADMIN:');
      lastCompany.users.forEach(user => {
        console.log(`   ID: ${user.id}, Email: ${user.email}, Rôle: ${user.role}, Status: ${user.status}`);
      });

      console.log('\n👷 EMPLOYÉS:');
      lastCompany.employees.forEach(employee => {
        console.log(`   ID: ${employee.id}, Nom: ${employee.name}, Poste: ${employee.position}, UserID: ${employee.userId}`);
      });

      console.log('\n🏛️ DÉPARTEMENTS:');
      lastCompany.departments.forEach(dept => {
        console.log(`   ID: ${dept.id}, Nom: ${dept.name}`);
      });
    }

    // Vérifier les utilisateurs
    const userCount = await prisma.user.count();
    console.log(`\n👤 Nombre total d'utilisateurs: ${userCount}`);

    // Vérifier les employés
    const employeeCount = await prisma.employee.count();
    console.log(`👷 Nombre total d'employés: ${employeeCount}`);

    // Vérifier les départements
    const deptCount = await prisma.department.count();
    console.log(`🏛️ Nombre total de départements: ${deptCount}`);

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();