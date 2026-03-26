import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import database from '../../src/utils/database.js';
import Author from '../../src/models/authorModel.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';
const createAdminToken = () => {
  return jwt.sign({ id: 'admin-id', role: 'admin' }, JWT_SECRET);
};

describe('Author API', () => {
  const adminToken = createAdminToken();

  beforeAll(async () => {
    // We use a separate test DB URI if available
    const uri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/book-author-api-test';
    await database.connect(uri);
  });

  afterAll(async () => {
    await Author.deleteMany({});
    await database.disconnect();
  });

  it('should create a new author when admin', async () => {
    const res = await request(app)
      .post('/api/v1/authors')
      .set('Cookie', [`access_token=${adminToken}`])
      .send({
        name: 'J.K. Rowling',
        bio: 'British author best known for the Harry Potter series.',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.author.name).toBe('J.K. Rowling');
  });

  it('should return 400 for invalid author name', async () => {
    const res = await request(app)
      .post('/api/v1/authors')
      .set('Cookie', [`access_token=${adminToken}`])
      .send({
        name: 'J',
      });

    expect(res.status).toBe(400);
  });

  it('should get all authors', async () => {
    const res = await request(app).get('/api/v1/authors');

    expect(res.status).toBe(200);
    expect(res.body.results).toBeGreaterThan(0);
  });
});
