import { z } from 'zod';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

export const bookBodySchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  author: z.string().regex(mongoIdRegex, 'Invalid Author ID format'),
  summary: z.string().optional(),
  isbn: z.string().optional(),
  publishedDate: z.string().datetime().optional().or(z.date().optional()),
});

export const createBookSchema = z.object({
  body: bookBodySchema,
});

export const updateBookSchema = z.object({
  body: bookBodySchema.partial(),
  params: z.object({
    id: z.string().regex(mongoIdRegex, 'Invalid Book ID format'),
  }),
});

export const getBookSchema = z.object({
  params: z.object({
    id: z.string().regex(mongoIdRegex, 'Invalid Book ID format'),
  }),
});

export const listBooksSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    author: z.string().regex(mongoIdRegex).optional(),
  }),
});
