const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Nettoyer les données existantes
  console.log('🧹 Cleaning existing data...');
  await prisma.log.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.payslip.deleteMany();
  await prisma.payrun.deleteMany();
  await prisma.timesheet.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.integration.deleteMany();
  await prisma.department.deleteMany();
  await prisma.company.deleteMany();

  console.log('✅ Existing data cleaned');

  // 1. Créer des entreprises
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'TechCorp Senegal',
        currency: 'XOF',
        logo: null,
        primaryColor: '#2563EB',
        secondaryColor: '#1E40AF',
        settings: {
          timezone: 'Africa/Dakar',
          language: 'fr',
          workingHours: { start: '08:00', end: '17:00' }
        }
      }
    }),
    prisma.company.create({
      data: {
        name: 'FinancePlus Mali',
        currency: 'XOF',
        logo: null,
        primaryColor: '#059669',
        secondaryColor: '#047857',
        settings: {
          timezone: 'Africa/Bamako',
          language: 'fr',
          workingHours: { start: '08:30', end: '17:30' }
        }
      }
    }),
    prisma.company.create({
      data: {
        name: 'Logistics Côte d\'Ivoire',
        currency: 'XOF',
        logo: null,
        primaryColor: '#DC2626',
        secondaryColor: '#B91C1C',
        settings: {
          timezone: 'Africa/Abidjan',
          language: 'fr',
          workingHours: { start: '08:00', end: '16:00' }
        }
      }
    })
  ]);

  console.log('✅ Companies created');

  // 2. Créer des départements pour chaque entreprise
  const departments = [];
  for (const company of companies) {
    const companyDepts = await Promise.all([
      prisma.department.create({
        data: {
          name: 'Ressources Humaines',
          companyId: company.id
        }
      }),
      prisma.department.create({
        data: {
          name: 'Développement',
          companyId: company.id
        }
      }),
      prisma.department.create({
        data: {
          name: 'Finance',
          companyId: company.id
        }
      }),
      prisma.department.create({
        data: {
          name: 'Marketing',
          companyId: company.id
        }
      }),
      prisma.department.create({
        data: {
          name: 'Opérations',
          companyId: company.id
        }
      })
    ]);
    departments.push(...companyDepts);
  }

  console.log('✅ Departments created');

  // 3. Créer des utilisateurs et employés
  const users = [];
  const employees = [];

  // SuperAdmin
  const superAdminUser = await prisma.user.create({
    data: {
      email: 'superadmin@payroll.com',
      password: await bcrypt.hash('SuperAdmin123!', 10),
      role: 'SUPERADMIN'
    }
  });
  users.push(superAdminUser);

  // Admins pour chaque entreprise
  const adminData = [
    { email: 'admin@techcorp.sn', company: companies[0], dept: departments[0] },
    { email: 'admin@financeplus.ml', company: companies[1], dept: departments[5] },
    { email: 'admin@logistics.ci', company: companies[2], dept: departments[10] }
  ];

  for (const data of adminData) {
    const adminUser = await prisma.user.create({
      data: {
        email: data.email,
        password: await bcrypt.hash('Admin123!', 10),
        role: 'ADMIN',
        companyId: data.company.id
      }
    });

    const adminEmployee = await prisma.employee.create({
      data: {
        name: `Admin ${data.company.name.split(' ')[0]}`,
        position: 'Administrateur',
        salary: 150000,
        departmentId: data.dept.id,
        companyId: data.company.id,
        userId: adminUser.id
      }
    });

    users.push(adminUser);
    employees.push(adminEmployee);
  }

  // Caissiers pour chaque entreprise
  const cashierData = [
    { email: 'caissier@techcorp.sn', company: companies[0], dept: departments[2] },
    { email: 'caissier@financeplus.ml', company: companies[1], dept: departments[7] },
    { email: 'caissier@logistics.ci', company: companies[2], dept: departments[12] }
  ];

  for (const data of cashierData) {
    const cashierUser = await prisma.user.create({
      data: {
        email: data.email,
        password: await bcrypt.hash('Caissier123!', 10),
        role: 'CAISSIER',
        companyId: data.company.id
      }
    });

    const cashierEmployee = await prisma.employee.create({
      data: {
        name: `Caissier ${data.company.name.split(' ')[0]}`,
        position: 'Caissier',
        salary: 80000,
        departmentId: data.dept.id,
        companyId: data.company.id,
        userId: cashierUser.id
      }
    });

    users.push(cashierUser);
    employees.push(cashierEmployee);
  }

  // Employés pour chaque entreprise (8 par entreprise)
  const employeeNames = [
    'Fatou Diop', 'Mamadou Sow', 'Aminata Ba', 'Ibrahima Ndiaye',
    'Khadija Faye', 'Ousmane Diallo', 'Mariama Traoré', 'Cheikh Gueye',
    'Aïssatou Mbaye', 'Moussa Camara', 'Rokhaya Sy', 'Abdoulaye Konaté',
    'Ndeye Fatou', 'Boubacar Toure', 'Adama Coulibaly', 'Papa Ndao',
    'Seynabou Dieng', 'Modou Fall', 'Astou Kane', 'Youssoupha Niang',
    'Diarra Bah', 'Lamine Sarr', 'Hawa Diallo', 'Amadou Wade'
  ];

  const positions = [
    'Développeur Full Stack', 'Designer UX/UI', 'Chef de Projet',
    'Analyste Financier', 'Commercial', 'Responsable RH',
    'Technicien Support', 'Data Analyst'
  ];

  const salaries = [75000, 85000, 95000, 65000, 70000, 80000, 60000, 90000];

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const companyEmployees = employees.filter(e => e.companyId === company.id);

    for (let j = 0; j < 8; j++) {
      const employeeIndex = i * 8 + j;
      const deptIndex = (i * 5) + (j % 5);

      const employeeUser = await prisma.user.create({
        data: {
          email: `employee${employeeIndex + 1}@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
          password: await bcrypt.hash('Employee123!', 10),
          role: 'EMPLOYEE',
          companyId: company.id
        }
      });

      const employee = await prisma.employee.create({
        data: {
          name: employeeNames[employeeIndex],
          position: positions[j % positions.length],
          salary: salaries[j % salaries.length],
          departmentId: departments[deptIndex].id,
          companyId: company.id,
          userId: employeeUser.id
        }
      });

      users.push(employeeUser);
      employees.push(employee);
    }
  }

  console.log('✅ Users and Employees created');

  // 4. Créer des contrats pour les employés
  for (const employee of employees) {
    await prisma.contract.create({
      data: {
        type: 'CDI',
        startDate: new Date('2024-01-01'),
        salary: employee.salary,
        employeeId: employee.id
      }
    });
  }

  console.log('✅ Contracts created');

  // 5. Créer des présences pour les 30 derniers jours
  const attendanceRecords = [];
  const today = new Date();

  for (let daysBack = 30; daysBack >= 0; daysBack--) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysBack);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (const employee of employees) {
      // 90% de présence
      if (Math.random() > 0.1) {
        const checkInTime = new Date(date);
        checkInTime.setHours(8 + Math.floor(Math.random() * 2), 30 + Math.floor(Math.random() * 30));

        const checkOutTime = new Date(date);
        checkOutTime.setHours(16 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));

        await prisma.attendance.create({
          data: {
            employeeId: employee.id,
            timestamp: checkInTime,
            type: 'CHECK_IN'
          }
        });

        await prisma.attendance.create({
          data: {
            employeeId: employee.id,
            timestamp: checkOutTime,
            type: 'CHECK_OUT'
          }
        });
      }
    }
  }

  console.log('✅ Attendance records created');

  // 6. Créer des timesheets pour les 3 derniers mois
  for (let monthBack = 0; monthBack < 3; monthBack++) {
    const month = new Date(today.getFullYear(), today.getMonth() - monthBack, 1);

    for (const employee of employees) {
      const hoursWorked = 140 + Math.floor(Math.random() * 40); // 140-180 heures

      await prisma.timesheet.create({
        data: {
          employeeId: employee.id,
          month: month.toISOString().slice(0, 7), // YYYY-MM format
          hoursWorked: hoursWorked,
          validated: Math.random() > 0.2 // 80% validés
        }
      });
    }
  }

  console.log('✅ Timesheets created');

  // 7. Créer des payruns et bulletins de paie
  for (let monthBack = 0; monthBack < 3; monthBack++) {
    const month = new Date(today.getFullYear(), today.getMonth() - monthBack, 1);

    for (const company of companies) {
      const companyEmployees = employees.filter(e => e.companyId === company.id);
      const totalAmount = companyEmployees.reduce((sum, emp) => sum + emp.salary, 0);

      const payrun = await prisma.payrun.create({
        data: {
          companyId: company.id,
          month: month.toISOString().slice(0, 7),
          totalAmount: totalAmount
        }
      });

      // Créer des bulletins pour chaque employé
      for (const employee of companyEmployees) {
        const netSalary = employee.salary * 0.8; // 80% du brut (simplifié)

        await prisma.payslip.create({
          data: {
            employeeId: employee.id,
            payrunId: payrun.id,
            netSalary: netSalary,
            pdfUrl: `/payslips/${employee.id}_${month.toISOString().slice(0, 7)}.pdf`
          }
        });
      }
    }
  }

  console.log('✅ Payruns and Payslips created');

  // 8. Créer des demandes de congé
  const leaveTypes = ['CONGÉS ANNUELS', 'MALADIE', 'FAMILLE'];
  const leaveStatuses = ['PENDING', 'APPROVED', 'REJECTED'];

  for (let i = 0; i < 20; i++) {
    const employee = employees[Math.floor(Math.random() * employees.length)];
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60));

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 10) + 1);

    await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        startDate: startDate,
        endDate: endDate,
        status: leaveStatuses[Math.floor(Math.random() * leaveStatuses.length)]
      }
    });
  }

  console.log('✅ Leave requests created');

  // 9. Créer des paiements
  const paymentStatuses = ['PENDING', 'COMPLETED', 'FAILED'];
  const paymentMethods = ['BANK_TRANSFER', 'ORANGE_MONEY', 'WAVE'];

  for (const payslip of await prisma.payslip.findMany()) {
    await prisma.payment.create({
      data: {
        payslipId: payslip.id,
        status: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        date: Math.random() > 0.3 ? new Date() : null
      }
    });
  }

  console.log('✅ Payments created');

  // 10. Créer des notifications
  const notificationTypes = ['PAYSLIP_GENERATED', 'LEAVE_APPROVED', 'PAYMENT_COMPLETED'];

  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)];

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
        content: `Notification de test ${i + 1}`,
        status: Math.random() > 0.5 ? 'READ' : 'UNREAD'
      }
    });
  }

  console.log('✅ Notifications created');

  // 11. Créer des logs d'audit
  const actions = ['LOGIN', 'EMPLOYEE_CREATED', 'PAYSLIP_GENERATED', 'LEAVE_REQUESTED'];
  const entities = ['USER', 'EMPLOYEE', 'PAYSLIP', 'LEAVE_REQUEST'];

  for (let i = 0; i < 100; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const company = companies.find(c => c.id === user.companyId);

    await prisma.log.create({
      data: {
        userId: user.id,
        companyId: company?.id,
        action: actions[Math.floor(Math.random() * actions.length)],
        entity: entities[Math.floor(Math.random() * entities.length)],
        details: { test: true, index: i }
      }
    });
  }

  console.log('✅ Audit logs created');

  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📊 Résumé des données créées:');
  console.log(`   • ${companies.length} entreprises`);
  console.log(`   • ${departments.length} départements`);
  console.log(`   • ${users.length} utilisateurs`);
  console.log(`   • ${employees.length} employés`);
  console.log(`   • ${await prisma.contract.count()} contrats`);
  console.log(`   • ${await prisma.attendance.count()} présences`);
  console.log(`   • ${await prisma.timesheet.count()} timesheets`);
  console.log(`   • ${await prisma.payrun.count()} payruns`);
  console.log(`   • ${await prisma.payslip.count()} bulletins`);
  console.log(`   • ${await prisma.leaveRequest.count()} demandes congé`);
  console.log(`   • ${await prisma.payment.count()} paiements`);
  console.log(`   • ${await prisma.notification.count()} notifications`);
  console.log(`   • ${await prisma.log.count()} logs`);
  console.log('');
  console.log('🔐 Comptes de test:');
  console.log('   SuperAdmin: superadmin@payroll.com / SuperAdmin123!');
  console.log('   Admin TechCorp: admin@techcorp.sn / Admin123!');
  console.log('   Admin FinancePlus: admin@financeplus.ml / Admin123!');
  console.log('   Admin Logistics: admin@logistics.ci / Admin123!');
  console.log('   Caissiers: caissier@[company].com / Caissier123!');
  console.log('   Employés: employee[1-24]@[company].com / Employee123!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });