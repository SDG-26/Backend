import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import database from '../../src/utils/database.js';
import Author from '../../src/models/authorModel.js';
import Book from '../../src/models/bookModel.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';
const createAdminToken = () => {
  return jwt.sign({ id: 'admin-id', role: 'admin' }, JWT_SECRET);
};

describe('Book API', () => {
  const adminToken = createAdminToken();
  let authorId: string;

  beforeAll(async () => {
    const uri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/book-author-api-test';
    await database.connect(uri);
    
    // Create an author for the books
    const author = await Author.create({ name: 'Test Author' });
    authorId = (author._id as any).toString();
  });

  afterAll(async () => {
    await Book.deleteMany({});
    await Author.deleteMany({});
    await database.disconnect();
  });

  it('should create a new book when admin', async () => {
    const res = await request(app)
      .post('/api/v1/books')
      .set('Cookie', [`access_token=${adminToken}`])
      .send({
        title: 'The Great Gatsby',
        author: authorId,
        isbn: '1234567890'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.book.title).toBe('The Great Gatsby');
  });

  it('should get paginated books', async () => {
    const res = await request(app).get('/api/v1/books?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.books)).toBe(true);
  });

  it('should search for books by title', async () => {
    const res = await request(app).get('/api/v1/books?search=Gatsby');
    expect(res.status).toBe(200);
    expect(res.body.results).toBeGreaterThan(0);
  });
});
