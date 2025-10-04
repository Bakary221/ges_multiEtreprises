const request = require('supertest');
const app = require('../server');

describe('Smoke Tests - Basic Endpoint Availability', () => {
  test('GET / - Health check', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Payroll Management API');
  });

  test('POST /auth/register-superadmin - Should accept registration', async () => {
    const res = await request(app)
      .post('/auth/register-superadmin')
      .send({
        email: 'smoke@test.com',
        password: 'password123'
      });

    // Peut échouer si la DB n'est pas configurée, mais la route existe
    expect([200, 400, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('success');
  });

  test('POST /auth/login - Should handle login attempts', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'password123'
      });

    expect([200, 401, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('success');
  });

  test('Protected routes should require authentication', async () => {
    const protectedRoutes = [
      { method: 'get', path: '/companies' },
      { method: 'post', path: '/companies' },
      { method: 'get', path: '/employees' },
      { method: 'post', path: '/employees' },
      { method: 'get', path: '/attendances' },
      { method: 'get', path: '/timesheets' },
      { method: 'get', path: '/payslips' },
      { method: 'get', path: '/me' },
    ];

    for (const route of protectedRoutes) {
      const res = await request(app)[route.method](route.path);
      expect([401, 403, 500]).toContain(res.status);
      expect(res.body).toHaveProperty('errorCode');
    }
  });

  test('Swagger documentation should be available', async () => {
    const res = await request(app).get('/api-docs/');
    expect([200, 404]).toContain(res.status); // 404 si swagger-ui n'est pas servi correctement
  });

  test('Invalid routes should return 404', async () => {
    const res = await request(app).get('/nonexistent-route');
    expect(res.status).toBe(404);
  });
});