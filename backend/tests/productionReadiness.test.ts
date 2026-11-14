import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { sanitizeData } from '../src/utils/logger';
import { ENV } from '../src/config/env';

describe('🚀 Phase 7: Production Readiness, Health & Security Hardening Tests', () => {
  const app = createApp();

  it('1. GET /api/v1/health returns healthy diagnostic metrics without exposing secrets', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
    expect(res.body.services.database).toBe('healthy');
    expect(typeof res.body.services.databaseLatencyMs).toBe('number');
    expect(typeof res.body.uptimeSeconds).toBe('number');
    expect(res.body.system.nodeVersion).toBeDefined();
    expect(res.body.system.memoryUsedMB).toBeGreaterThan(0);
    expect(res.body.timestamp).toBeDefined();

    // Verify secret hygiene: no sensitive variables leaked
    const jsonStr = JSON.stringify(res.body);
    expect(jsonStr).not.toContain(ENV.JWT_ACCESS_SECRET);
    expect(jsonStr).not.toContain(ENV.JWT_REFRESH_SECRET);
    expect(jsonStr).not.toContain(ENV.COOKIE_SECRET);
    expect(jsonStr).not.toContain(ENV.RAZORPAY_KEY_SECRET);
  });

  it('2. GET /api/health provides backward-compatible health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('3. Injects production security headers via Helmet', async () => {
    const res = await request(app).get('/api/v1/health');

    // Security Headers
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');
  });

  it('4. Sanitizes sensitive data and nested secrets in structured logger', () => {
    const sensitivePayload = {
      user: {
        id: 'user-123',
        email: 'customer@driveease.com',
        password: 'PlainTextPassword123!',
        nestedAuth: {
          token: 'jwt.token.string',
          refreshToken: 'refresh.token.string',
          jwt_secret: 'supersecret',
          razorpay_signature: 'abc123hmac',
        },
      },
      credit_card: '4111111111111234',
      safeField: 'DriveEase Luxury Sedan',
    };

    const sanitized = sanitizeData(sensitivePayload);

    expect(sanitized.user.password).toBe('[REDACTED]');
    expect(sanitized.user.nestedAuth.token).toBe('[REDACTED]');
    expect(sanitized.user.nestedAuth.refreshToken).toBe('[REDACTED]');
    expect(sanitized.user.nestedAuth.jwt_secret).toBe('[REDACTED]');
    expect(sanitized.user.nestedAuth.razorpay_signature).toBe('[REDACTED]');
    expect(sanitized.credit_card).toBe('[REDACTED]');
    expect(sanitized.user.email).toBe('customer@driveease.com');
    expect(sanitized.safeField).toBe('DriveEase Luxury Sedan');
  });

  it('5. Enforces valid CORS configuration', async () => {
    const res = await request(app)
      .options('/api/v1/health')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET');

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
