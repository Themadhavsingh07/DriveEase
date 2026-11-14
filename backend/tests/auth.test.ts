import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import prisma from '../src/config/db';

const app = createApp();

describe('🔐 Phase 3 Authentication & RBAC Integration Tests', () => {
  const testUserEmail = `test.user.${Date.now()}@example.com`;
  const testUserPassword = 'SecurePassword123!';
  let customerAccessToken = '';
  let customerRefreshTokenCookie = '';
  let adminAccessToken = '';

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up test user if created
    try {
      await prisma.refreshToken.deleteMany({
        where: { user: { email: testUserEmail } },
      });
      await prisma.user.deleteMany({
        where: { email: testUserEmail },
      });
    } catch (err) {
      console.warn('Cleanup warning:', err);
    }
    await prisma.$disconnect();
  });

  describe('1. User Registration Flow', () => {
    it('POST /api/v1/auth/register should create a new user account with 201', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Integration Tester',
          firstName: 'Integration',
          lastName: 'Tester',
          email: testUserEmail,
          password: testUserPassword,
          phone: '+91 9876543210',
          drivingLicenseNumber: 'DL-TEST-9999',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(testUserEmail);
      expect(res.body.data.user.password).toBeUndefined(); // Password must NEVER be returned
      expect(res.body.data.user.role).toBe('CUSTOMER');
    });

    it('POST /api/v1/auth/register should reject duplicate email registrations with 409 or 400', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Duplicate Tester',
          firstName: 'Duplicate',
          lastName: 'Tester',
          email: testUserEmail,
          password: testUserPassword,
        });

      expect([400, 409]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/register should reject passwords failing security complexity', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `invalid.${Date.now()}@example.com`,
          password: 'weak',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. User Login Flow & Cookie Handling', () => {
    it('POST /api/v1/auth/login with valid customer credentials should return tokens and cookies', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'customer@driveease.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('customer@driveease.com');

      customerAccessToken = res.body.data.token;

      // Verify Set-Cookie header for refresh and access tokens
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(cookieStr).toContain('refreshToken=');

      // Extract refreshToken cookie for rotation tests
      const refreshMatch = cookieStr.match(/refreshToken=([^;]+)/);
      if (refreshMatch) {
        customerRefreshTokenCookie = `refreshToken=${refreshMatch[1]}`;
      }
    });

    it('POST /api/v1/auth/login with wrong password should fail with 401', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'customer@driveease.com',
          password: 'IncorrectPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/login with non-existent email should fail with 401', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@nowhere.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Token Refresh Rotation & Reuse Detection', () => {
    let secondRefreshTokenCookie = '';

    it('POST /api/v1/auth/refresh should rotate the refresh token and grant new access token', async () => {
      expect(customerRefreshTokenCookie).toBeTruthy();

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', customerRefreshTokenCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(cookieStr).toContain('refreshToken=');

      const refreshMatch = cookieStr.match(/refreshToken=([^;]+)/);
      if (refreshMatch) {
        secondRefreshTokenCookie = `refreshToken=${refreshMatch[1]}`;
      }
    });

    it('POST /api/v1/auth/refresh with a REUSED/REVOKED refresh token should be rejected (401 or 403)', async () => {
      // customerRefreshTokenCookie was rotated in the previous test and is now invalidated
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', customerRefreshTokenCookie);

      expect([401, 403]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Current User Session (GET /api/v1/auth/me)', () => {
    it('GET /api/v1/auth/me should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/auth/me with valid Bearer token should return user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${customerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('customer@driveease.com');
    });
  });

  describe('5. Role-Based Access Control (RBAC)', () => {
    it('CUSTOMER role should be denied access to /api/v1/admin/dashboard with 403', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${customerAccessToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('CUSTOMER role should be denied access to /api/v1/admin/users with 403', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${customerAccessToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('ADMIN role login should succeed and grant access to /api/v1/admin/dashboard with 200', async () => {
      // 1. Login as Admin
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@driveease.com',
          password: 'admin123',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.user.role).toBe('ADMIN');
      adminAccessToken = loginRes.body.data.token;

      // 2. Access Admin Dashboard
      const dashRes = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(dashRes.status).toBe(200);
      expect(dashRes.body.success).toBe(true);
      expect(dashRes.body.data.stats).toBeDefined();
    });
  });

  describe('6. User Logout Flow', () => {
    it('POST /api/v1/auth/logout should clear auth cookies and return 200', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${customerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
