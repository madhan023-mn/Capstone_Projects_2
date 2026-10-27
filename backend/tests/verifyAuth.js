require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

const connectDB = require('../config/db');

const runAuthVerification = async () => {
  console.log('🧪 Starting Authentication & Authorization Verification Suite...\n');

  try {
    await connectDB();
    console.log('✅ Connected to database for verification');

    // Clean up test user if left over
    await User.deleteMany({ email: 'testcustomer@example.com' });

    const testUser = {
      name: 'Test Customer',
      email: 'testcustomer@example.com',
      password: 'Password@123',
      phone: '9998887770',
    };

    // Test 1: Register
    console.log('\n--- 1. Testing Customer Registration ---');
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);
    if (regRes.status === 201 && regRes.body.token && regRes.body.data.user.email === testUser.email) {
      console.log('✅ PASS: Registered new customer with status 201 and JWT token generated.');
    } else {
      throw new Error(`FAIL: Registration failed with status ${regRes.status}: ${JSON.stringify(regRes.body)}`);
    }

    // Test 2: Duplicate registration check
    console.log('\n--- 2. Testing Duplicate Email Prevention ---');
    const dupRes = await request(app).post('/api/v1/auth/register').send(testUser);
    if (dupRes.status === 400 && dupRes.body.success === false) {
      console.log('✅ PASS: Duplicate email was correctly rejected with status 400.');
    } else {
      throw new Error(`FAIL: Duplicate email allowed! Status: ${dupRes.status}`);
    }

    // Test 3: Login with correct credentials
    console.log('\n--- 3. Testing Login with Valid Credentials ---');
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    if (loginRes.status === 200 && loginRes.body.token) {
      console.log('✅ PASS: Login successful with status 200 and valid JWT returned.');
    } else {
      throw new Error(`FAIL: Login failed: ${JSON.stringify(loginRes.body)}`);
    }

    const token = loginRes.body.token;

    // Test 4: Login with bad credentials
    console.log('\n--- 4. Testing Login with Invalid Password ---');
    const badLoginRes = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword!',
    });
    if (badLoginRes.status === 401 && badLoginRes.body.success === false) {
      console.log('✅ PASS: Invalid password correctly rejected with status 401 Unauthorized.');
    } else {
      throw new Error(`FAIL: Bad login was not rejected correctly. Status: ${badLoginRes.status}`);
    }

    // Test 5: Protected route without token
    console.log('\n--- 5. Testing Protected Route Without Token ---');
    const unauthRes = await request(app).get('/api/v1/auth/me');
    if (unauthRes.status === 401) {
      console.log('✅ PASS: Protected route without token was blocked with status 401.');
    } else {
      throw new Error(`FAIL: Unauthenticated access permitted! Status: ${unauthRes.status}`);
    }

    // Test 6: Protected route with valid Bearer token
    console.log('\n--- 6. Testing Protected Route With Valid Bearer Token ---');
    const authRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    if (authRes.status === 200 && authRes.body.data.user.email === testUser.email) {
      console.log('✅ PASS: Bearer token validated successfully, returned user profile.');
    } else {
      throw new Error(`FAIL: Bearer token access failed. Status: ${authRes.status}`);
    }

    // Test 7: Update profile
    console.log('\n--- 7. Testing Profile Update ---');
    const updateRes = await request(app)
      .patch('/api/v1/auth/update-me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Customer Name', phone: '1112223334' });
    if (updateRes.status === 200 && updateRes.body.data.user.name === 'Updated Customer Name') {
      console.log('✅ PASS: User profile updated successfully with status 200.');
    } else {
      throw new Error(`FAIL: Profile update failed. Status: ${updateRes.status}`);
    }

    // Cleanup
    await User.deleteMany({ email: 'testcustomer@example.com' });
    console.log('\n✨ ALL AUTHENTICATION AND AUTHORIZATION TESTS PASSED WITH 100% SUCCESS! ✨\n');

    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Test execution error:', err);
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

runAuthVerification();
