const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

class SuperAdminService {
  async createCompany(data) {
    console.log('🏭 Début création entreprise avec données:', {
      name: data.name,
      adminEmail: data.adminEmail,
      adminName: data.adminName,
      hasPassword: !!data.adminPassword
    });

    const {
      name,
      currency,
      logo,
      primaryColor,
      secondaryColor,
      adminEmail,
      adminPassword,
      adminName,
      adminPosition
    } = data;

    // Utiliser une transaction pour assurer l'atomicité
    const result = await prisma.$transaction(async (prisma) => {
      console.log('🔍 Vérification email existant...');
      // Vérifier si l'email existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail }
      });

      if (existingUser) {
        console.log('❌ Email déjà existant:', adminEmail);
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
      console.log('✅ Email disponible');

      console.log('🏢 Création de l\'entreprise...');
      // Créer l'entreprise
      const company = await prisma.company.create({
        data: {
          name,
          currency: currency || 'EUR',
          logo,
          primaryColor,
          secondaryColor,
          settings: {
            timezone: 'Africa/Dakar',
            language: 'fr',
            workingHours: { start: '08:00', end: '17:00' }
          }
        },
      });
      console.log('✅ Entreprise créée, ID:', company.id);

      console.log('👤 Création de l\'utilisateur admin...');
      // Créer l'utilisateur admin
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      const adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          companyId: company.id,
        },
      });
      console.log('✅ Utilisateur créé, ID:', adminUser.id);

      console.log('👷 Création de l\'employé admin...');
      // Créer l'employé admin
      const adminEmployee = await prisma.employee.create({
        data: {
          name: adminName,
          position: adminPosition || 'Administrateur',
          salary: 150000, // Salaire par défaut pour admin
          companyId: company.id,
          userId: adminUser.id,
        },
      });
      console.log('✅ Employé créé, ID:', adminEmployee.id);

      console.log('🏗️ Création des départements...');
      // Créer les départements par défaut
      const defaultDepartments = [
        { name: 'Ressources Humaines', companyId: company.id },
        { name: 'Direction Générale', companyId: company.id },
        { name: 'Comptabilité', companyId: company.id },
        { name: 'Informatique', companyId: company.id },
        { name: 'Commercial', companyId: company.id },
        { name: 'Production', companyId: company.id },
      ];

      await prisma.department.createMany({
        data: defaultDepartments,
      });
      console.log('✅ 6 départements créés');

      console.log('📝 Création du log...');
      // Créer des logs d'initialisation
      await prisma.log.create({
        data: {
          userId: adminUser.id,
          companyId: company.id,
          action: 'COMPANY_CREATED',
          entity: 'Company',
          details: { companyName: company.name, adminEmail: adminUser.email },
        },
      });
      console.log('✅ Log créé');

      console.log('🎉 Transaction terminée avec succès');
      return {
        company,
        admin: {
          user: adminUser,
          employee: adminEmployee
        }
      };
    });

    console.log('✅ Méthode createCompany terminée');
    return result;
  }

  async createCompanyWithAdmin(data) {
    const {
      name,
      currency,
      logo,
      primaryColor,
      secondaryColor,
      adminEmail,
      adminPassword,
      adminName,
      adminPosition
    } = data;

    // Utiliser une transaction pour assurer l'atomicité
    const result = await prisma.$transaction(async (prisma) => {
      // Vérifier si l'email existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail }
      });

      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Créer l'entreprise
      const company = await prisma.company.create({
        data: {
          name,
          currency: currency || 'EUR',
          logo,
          primaryColor,
          secondaryColor,
          settings: {
            timezone: 'Africa/Dakar',
            language: 'fr',
            workingHours: { start: '08:00', end: '17:00' }
          }
        },
      });

      // Créer l'utilisateur admin
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      const adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          companyId: company.id,
        },
      });

      // Créer l'employé admin
      const adminEmployee = await prisma.employee.create({
        data: {
          name: adminName,
          position: adminPosition || 'Administrateur',
          salary: 150000, // Salaire par défaut pour admin
          companyId: company.id,
          userId: adminUser.id,
        },
      });

      // Créer les départements par défaut
      const defaultDepartments = [
        { name: 'Ressources Humaines', companyId: company.id },
        { name: 'Direction Générale', companyId: company.id },
        { name: 'Comptabilité', companyId: company.id },
        { name: 'Informatique', companyId: company.id },
        { name: 'Commercial', companyId: company.id },
        { name: 'Production', companyId: company.id },
      ];

      await prisma.department.createMany({
        data: defaultDepartments,
      });

      // Créer des logs d'initialisation
      await prisma.log.create({
        data: {
          userId: adminUser.id,
          companyId: company.id,
          action: 'COMPANY_CREATED',
          entity: 'Company',
          details: { companyName: company.name, adminEmail: adminUser.email },
        },
      });

      return {
        company,
        admin: {
          user: adminUser,
          employee: adminEmployee
        }
      };
    });

    return result;
  }

  async getCompanies() {
    const companies = await prisma.company.findMany({
      include: {
        users: {
          where: { role: 'ADMIN' },
          select: {
            id: true,
            email: true,
            employee: {
              select: { name: true },
            },
          },
        },
        employees: true,
        payruns: {
          include: {
            payslips: {
              select: { netSalary: true },
            },
          },
        },
        _count: {
          select: { employees: true },
        },
      },
    });

    // Calculate totals
    return companies.map(company => ({
      ...company,
      employeeCount: company._count.employees,
      adminName: company.users.length > 0
        ? (company.users[0].employee?.name || company.users[0].email)
        : null,
      totalPayroll: (company.payruns || []).reduce((total, payrun) =>
        total + (payrun.payslips || []).reduce((sum, payslip) => sum + (payslip.netSalary || 0), 0), 0
      ),
    }));
  }

  async getCompanyById(id) {
    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: {
          select: { id: true, email: true, role: true, status: true },
        },
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    return company;
  }

  async updateCompany(id, data) {
    const { name, settings, currency, logo, primaryColor, secondaryColor } = data;

    const company = await prisma.company.update({
      where: { id: parseInt(id) },
      data: {
        name,
        settings,
        currency,
        logo,
        primaryColor,
        secondaryColor,
      },
    });

    return company;
  }

  async deleteCompany(id) {
    const companyId = parseInt(id);

    // Vérifier si la company existe
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true }
    });

    if (!company) {
      throw new Error('Entreprise introuvable');
    }

    // Vérifier si la company a des utilisateurs actifs
    const userCount = await prisma.user.count({
      where: { companyId: companyId },
    });

    console.log(`Tentative de suppression de l'entreprise ${company.name} (ID: ${companyId}) - Utilisateurs actifs: ${userCount}`);

    if (userCount > 0) {
      throw new Error(`Impossible de supprimer l'entreprise car elle contient ${userCount} utilisateur(s) actif(s). Veuillez d'abord supprimer ou désactiver tous les utilisateurs.`);
    }

    // Supprimer l'entreprise
    await prisma.company.delete({
      where: { id: companyId },
    });

    console.log(`Entreprise ${company.name} (ID: ${companyId}) supprimée avec succès`);

    return { message: 'Entreprise supprimée avec succès' };
  }

  async createUserForCompany(companyId, data) {
    const { email, password, role } = data;

    if (!['ADMIN', 'CAISSIER'].includes(role)) {
      throw new Error('Invalid role for company user');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        companyId: parseInt(companyId),
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        company: { select: { id: true, name: true } },
      },
    });

    return user;
  }

  async getLogs(filters = {}) {
    const { companyId, userId, action, limit = 100, offset = 0 } = filters;

    const where = {};
    if (companyId) where.companyId = parseInt(companyId);
    if (userId) where.userId = parseInt(userId);
    if (action) where.action = action;

    const logs = await prisma.log.findMany({
      where,
      include: {
        user: { select: { email: true } },
        company: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.log.count({ where });

    return { logs, total, limit: parseInt(limit), offset: parseInt(offset) };
  }

  async uploadFile(file) {
    // Simulation d'upload - en vrai, utiliser S3 ou stockage local
    const fileUrl = `https://storage.example.com/${file.filename}`;

    return {
      filename: file.originalname,
      url: fileUrl,
      size: file.size,
    };
  }

  async getDashboardStats() {
    // Get payroll data for the last 6 months
    const payrollData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toISOString().slice(0, 7); // YYYY-MM format

      const totalPayroll = await prisma.payrun.aggregate({
        where: { month },
        _sum: { totalAmount: true }
      });

      payrollData.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        amount: totalPayroll._sum.totalAmount || 0
      });
    }

    // Get employee distribution by department
    const departmentStats = await prisma.employee.groupBy({
      by: ['departmentId'],
      _count: { id: true },
    });

    // Get department names
    const departmentIds = departmentStats
      .map(stat => stat.departmentId)
      .filter(id => id !== null && id !== undefined);

    const departments = departmentIds.length > 0 ? await prisma.department.findMany({
      where: {
        id: {
          in: departmentIds
        }
      },
      select: { id: true, name: true }
    }) : [];

    const departmentMap = departments.reduce((acc, dept) => {
      acc[dept.id] = dept.name;
      return acc;
    }, {});

    // Aggregate counts by department name
    const aggregatedDistribution = departmentStats.reduce((acc, stat) => {
      const deptName = departmentMap[stat.departmentId] || 'Inconnu';
      if (!acc[deptName]) {
        acc[deptName] = 0;
      }
      acc[deptName] += stat._count.id;
      return acc;
    }, {});

    const employeeDistribution = Object.entries(aggregatedDistribution).map(([department, count]) => ({
      department,
      count
    }));

    // Get attendance data for the last 7 days
    const attendanceData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });

      const presentCount = await prisma.attendance.count({
        where: {
          timestamp: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
          },
          type: 'CHECK_IN'
        }
      });

      const absentCount = await prisma.employee.count() - presentCount;

      attendanceData.push({
        day: dayName,
        present: presentCount,
        absent: absentCount
      });
    }

    return {
      payrollData,
      employeeDistribution,
      attendanceData
    };
  }
}

module.exports = new SuperAdminService();