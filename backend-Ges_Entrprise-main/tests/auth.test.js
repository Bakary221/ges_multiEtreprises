const request = require('supertest');
const app = require('../server');
const prisma = require('../src/config/prisma');

describe('Auth API', () => {
  beforeAll(async () => {
    // Nettoyer la DB de test
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /auth/register-superadmin', () => {
    it('should register a superadmin', async () => {
      const response = await request(app)
        .post('/auth/register-superadmin')
        .send({
          email: 'superadmin@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('superadmin@test.com');
      expect(response.body.data.role).toBe('SUPERADMIN');
    });

    it('should not register duplicate email', async () => {
      const response = await request(app)
        .post('/auth/register-superadmin')
        .send({
          email: 'superadmin@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('REGISTRATION_FAILED');
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'superadmin@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.role).toBe('SUPERADMIN');
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'superadmin@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.errorCode).toBe('AUTH_FAILED');
    });
  });
});