const request = require('supertest');
const app = require('../server');
const prisma = require('../src/config/prisma');

describe('Payroll Management API - Full Integration Test', () => {
  let superAdminToken, adminToken, caissierToken, employeeToken;
  let companyId, adminId, caissierId, employeeId, employeeUserId;

  beforeAll(async () => {
    // Nettoyer la DB
    await prisma.log.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.payslip.deleteMany();
    await prisma.payrun.deleteMany();
    await prisma.leaveRequest.deleteMany();
    await prisma.timesheet.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.user.deleteMany();
    await prisma.department.deleteMany();
    await prisma.company.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Auth Module', () => {
    test('Register superadmin', async () => {
      const res = await request(app)
        .post('/auth/register-superadmin')
        .send({
          email: 'superadmin@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('Login superadmin', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'superadmin@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      superAdminToken = res.body.data.accessToken;
    });
  });

  describe('2. SuperAdmin Module', () => {
    test('Create company', async () => {
      const res = await request(app)
        .post('/companies')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Test Company',
          currency: 'EUR'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      companyId = res.body.data.id;
    });

    test('Get companies', async () => {
      const res = await request(app)
        .get('/companies')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Create admin user for company', async () => {
      const res = await request(app)
        .post(`/companies/${companyId}/users`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          email: 'admin@test.com',
          password: 'password123',
          role: 'ADMIN'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      adminId = res.body.data.id;
    });

    test('Create caissier user for company', async () => {
      const res = await request(app)
        .post(`/companies/${companyId}/users`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          email: 'caissier@test.com',
          password: 'password123',
          role: 'CAISSIER'
        });

      expect(res.status).toBe(201);
      caissierId = res.body.data.id;
    });
  });

  describe('3. Admin Login and Operations', () => {
    test('Login admin', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      adminToken = res.body.data.accessToken;
    });

    test('Create department', async () => {
      const res = await request(app)
        .post('/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'IT Department'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('Create employee', async () => {
      const res = await request(app)
        .post('/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'John Doe',
          position: 'Developer',
          salary: 3000,
          contractType: 'CDI',
          startDate: '2024-01-01'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      employeeId = res.body.data.id;
      employeeUserId = res.body.data.userId;
    });

    test('Get employees', async () => {
      const res = await request(app)
        .get('/employees')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.employees)).toBe(true);
    });

    test('Scan attendance', async () => {
      const res = await request(app)
        .post('/attendances/scan')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          employeeId,
          type: 'CHECK_IN'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('Create timesheet', async () => {
      const res = await request(app)
        .post('/timesheets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          employeeId,
          month: '2024-10',
          hoursWorked: 160
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('Validate timesheet', async () => {
      // D'abord récupérer l'ID du timesheet
      const timesheetsRes = await request(app)
        .get('/timesheets')
        .set('Authorization', `Bearer ${adminToken}`);

      const timesheetId = timesheetsRes.body.data.timesheets[0].id;

      const res = await request(app)
        .patch(`/timesheets/${timesheetId}/validate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('Generate payrun', async () => {
      const res = await request(app)
        .post('/payruns')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          month: '2024-10'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('Get payslips', async () => {
      const res = await request(app)
        .get('/payslips')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('Get payroll summary', async () => {
      const res = await request(app)
        .get('/reports/payroll-summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('4. Caissier Operations', () => {
    test('Login caissier', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'caissier@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      caissierToken = res.body.data.accessToken;
    });

    test('Get employees (simplified view)', async () => {
      const res = await request(app)
        .get('/employees')
        .set('Authorization', `Bearer ${caissierToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('Get validated timesheets', async () => {
      const res = await request(app)
        .get('/timesheets?validated=true')
        .set('Authorization', `Bearer ${caissierToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('Create payment', async () => {
      // Récupérer l'ID du payslip
      const payslipsRes = await request(app)
        .get('/payslips')
        .set('Authorization', `Bearer ${adminToken}`);

      const payslipId = payslipsRes.body.data.payslips[0].id;

      const res = await request(app)
        .post('/payments')
        .set('Authorization', `Bearer ${caissierToken}`)
        .send({
          payslipId,
          method: 'BANK_TRANSFER'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('Get payments', async () => {
      const res = await request(app)
        .get('/payments')
        .set('Authorization', `Bearer ${caissierToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('5. Employee Operations', () => {
    test('Login employee', async () => {
      // Créer un utilisateur employé d'abord
      const employeeUser = await prisma.user.create({
        data: {
          email: 'employee@test.com',
          password: await require('bcryptjs').hash('password123', 12),
          role: 'EMPLOYEE',
          companyId,
        },
      });

      // Lier à l'employé
      await prisma.employee.update({
        where: { id: employeeId },
        data: { userId: employeeUser.id },
      });

      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'employee@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      employeeToken = res.body.data.accessToken;
    });

    test('Get employee profile', async () => {
      const res = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('Get employee payslips', async () => {
      const res = await request(app)
        .get('/me/payslips')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('Get employee timesheets', async () => {
      const res = await request(app)
        .get('/me/timesheets')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('Create leave request', async () => {
      const res = await request(app)
        .post('/me/leave-request')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          startDate: '2024-12-01',
          endDate: '2024-12-05',
          reason: 'Vacation'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('Get leave requests', async () => {
      const res = await request(app)
        .get('/me/leave-requests')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('6. Admin - Approve Leave Request', () => {
    test('Get leave requests', async () => {
      const res = await request(app)
        .get('/leave-requests')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Approve leave request', async () => {
      const leaveRequestsRes = await request(app)
        .get('/leave-requests')
        .set('Authorization', `Bearer ${adminToken}`);

      const leaveRequestId = leaveRequestsRes.body.data[0].id;

      const res = await request(app)
        .patch(`/leave-requests/${leaveRequestId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'APPROVED'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('7. Error Handling', () => {
    test('Unauthorized access', async () => {
      const res = await request(app)
        .get('/companies');

      expect(res.status).toBe(401);
      expect(res.body.errorCode).toBe('UNAUTHORIZED');
    });

    test('Forbidden access', async () => {
      const res = await request(app)
        .get('/companies')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(403);
      expect(res.body.errorCode).toBe('FORBIDDEN');
    });
  });
});