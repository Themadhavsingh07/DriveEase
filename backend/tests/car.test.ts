import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import prisma from '../src/config/db';

const app = createApp();

describe('🚙 Phase 3 Fleet Discovery & Car REST API Tests', () => {
  let sampleCarId = '';
  let adminAccessToken = '';

  beforeAll(async () => {
    await prisma.$connect();

    // Acquire a sample car ID from database
    const car = await prisma.car.findFirst({
      where: { isActive: true },
      include: { category: true },
    });
    if (car) {
      sampleCarId = car.id;
    }

    // Acquire Admin JWT
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@driveease.com',
        password: 'admin123',
      });
    if (loginRes.body?.data?.token) {
      adminAccessToken = loginRes.body.data.token;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Fleet Listing & Pagination', () => {
    it('GET /api/v1/cars should return a paginated fleet list with total count', async () => {
      const res = await request(app).get('/api/v1/cars?page=1&limit=6');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cars = res.body.data?.cars || res.body.cars;
      expect(Array.isArray(cars)).toBe(true);
      expect(cars.length).toBeGreaterThan(0);
      expect(cars.length).toBeLessThanOrEqual(6);

      const pagination = res.body.data?.pagination;
      expect(pagination).toBeDefined();
      expect(pagination.total).toBeGreaterThan(0);
      expect(pagination.page).toBe(1);
    });

    it('GET /api/v1/cars?search=Swift should return search-matched vehicles', async () => {
      const res = await request(app).get('/api/v1/cars?search=Swift');

      expect(res.status).toBe(200);
      const cars = res.body.data?.cars || res.body.cars;
      expect(Array.isArray(cars)).toBe(true);
      cars.forEach((car: any) => {
        const matches =
          car.brand.toLowerCase().includes('swift') ||
          car.model.toLowerCase().includes('swift') ||
          (car.name && car.name.toLowerCase().includes('swift'));
        expect(matches).toBe(true);
      });
    });

    it('GET /api/v1/cars?fuelType=ELECTRIC should return only electric vehicles', async () => {
      const res = await request(app).get('/api/v1/cars?fuelType=ELECTRIC');

      expect(res.status).toBe(200);
      const cars = res.body.data?.cars || res.body.cars;
      expect(Array.isArray(cars)).toBe(true);
      cars.forEach((car: any) => {
        expect(car.fuelType.toUpperCase()).toBe('ELECTRIC');
      });
    });

    it('GET /api/v1/cars?transmission=AUTOMATIC should return only automatic vehicles', async () => {
      const res = await request(app).get('/api/v1/cars?transmission=AUTOMATIC');

      expect(res.status).toBe(200);
      const cars = res.body.data?.cars || res.body.cars;
      expect(Array.isArray(cars)).toBe(true);
      cars.forEach((car: any) => {
        expect(car.transmission.toUpperCase()).toBe('AUTOMATIC');
      });
    });

    it('GET /api/v1/cars?minPrice=2000&maxPrice=6000 should filter cars within price range', async () => {
      const res = await request(app).get('/api/v1/cars?minPrice=2000&maxPrice=6000');

      expect(res.status).toBe(200);
      const cars = res.body.data?.cars || res.body.cars;
      expect(Array.isArray(cars)).toBe(true);
      cars.forEach((car: any) => {
        const price = Number(car.dailyPrice || car.pricePerDay);
        expect(price).toBeGreaterThanOrEqual(2000);
        expect(price).toBeLessThanOrEqual(6000);
      });
    });

    it('GET /api/v1/cars?sortBy=price_asc should sort vehicles by price ascending', async () => {
      const res = await request(app).get('/api/v1/cars?sortBy=price_asc&limit=10');

      expect(res.status).toBe(200);
      const cars = res.body.data?.cars || res.body.cars;
      expect(Array.isArray(cars)).toBe(true);
      if (cars.length > 1) {
        for (let i = 0; i < cars.length - 1; i++) {
          const current = Number(cars[i].dailyPrice || cars[i].pricePerDay);
          const next = Number(cars[i + 1].dailyPrice || cars[i + 1].pricePerDay);
          expect(current).toBeLessThanOrEqual(next);
        }
      }
    });
  });

  describe('2. Categories API', () => {
    it('GET /api/v1/cars/categories should return available vehicle categories', async () => {
      const res = await request(app).get('/api/v1/cars/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const categories = res.body.data?.categories;
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0].name).toBeDefined();
      expect(categories[0].slug).toBeDefined();
    });
  });

  describe('3. Vehicle Details API', () => {
    it('GET /api/v1/cars/:id with valid vehicle ID should return comprehensive specs and images', async () => {
      expect(sampleCarId).toBeTruthy();

      const res = await request(app).get(`/api/v1/cars/${sampleCarId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const car = res.body.data?.car || res.body.car;
      expect(car).toBeDefined();
      expect(car.id).toBe(sampleCarId);
      expect(car.brand).toBeDefined();
      expect(car.model).toBeDefined();
      expect(Number(car.dailyPrice || car.pricePerDay)).toBeGreaterThan(0);
      expect(Array.isArray(car.images)).toBe(true);
    });

    it('GET /api/v1/cars/:id with non-existent UUID should return 404', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).get(`/api/v1/cars/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. RBAC Protection on Vehicle Management', () => {
    it('POST /api/v1/cars without authorization should be rejected with 401', async () => {
      const res = await request(app)
        .post('/api/v1/cars')
        .send({ brand: 'Audi', model: 'A6' });

      expect(res.status).toBe(401);
    });

    it('POST /api/v1/cars with CUSTOMER authorization should be rejected with 403', async () => {
      // Login as customer
      const customerLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'customer@driveease.com',
          password: 'password123',
        });

      const customerToken = customerLogin.body?.data?.token;

      const res = await request(app)
        .post('/api/v1/cars')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ brand: 'Audi', model: 'A6' });

      expect(res.status).toBe(403);
    });
  });
});
