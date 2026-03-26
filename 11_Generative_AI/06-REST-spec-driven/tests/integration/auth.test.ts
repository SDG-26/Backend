import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import database from '../../src/utils/database.js';
import User from '../../src/models/userModel.js';

describe('Auth API', () => {

  beforeAll(async () => {
    const uri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/book-author-api-test';
    await database.connect(uri);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await database.disconnect();
  });

  it('should signup a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        username: 'testuser',
        password: 'password123',
        role: 'user'
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.username).toBe('testuser');
    expect(res.header['set-cookie']).toBeDefined();
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.header['set-cookie']).toBeDefined();
  });

  it('should fail login with wrong credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
  });
});
