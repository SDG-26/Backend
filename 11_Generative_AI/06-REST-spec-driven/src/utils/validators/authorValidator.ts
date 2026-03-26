import { z } from 'zod';

export const authorBodySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().optional(),
  birthDate: z.string().datetime().optional().or(z.date().optional()),
  active: z.boolean().optional(),
});

export const createAuthorSchema = z.object({
  body: authorBodySchema,
});

export const updateAuthorSchema = z.object({
  body: authorBodySchema.partial(),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  }),
});

export const getAuthorSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  }),
});
