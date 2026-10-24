require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

beforeAll(async () => {
  // Ensure DB connection is active
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
});

afterAll(async () => {
  // Clean up test user
  await User.deleteMany({ email: /test.*@example\.com/ });
  await mongoose.connection.close();
});

describe('Authentication & Authorization Suite', () => {
  const testUser = {
    name: 'Test Customer',
    email: 'testcustomer@example.com',
    password: 'Password@123',
    phone: '9998887770',
  };

  let authToken = '';

  it('1. Successfully registers a new customer', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.role).toBe('customer');
  });

  it('2. Rejects registration with existing email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('3. Successfully logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  it('4. Rejects login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword!',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('5. Protects /api/v1/auth/me without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('6. Allows access to /api/v1/auth/me with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
  });
});
