import { z } from 'zod/v4';
import { Types } from 'mongoose';

export const userInputSchema = z.strictObject({
  firstName: z
    .string({ error: 'firstName must be a string' })
    .min(2, { message: 'firstName is required and must be at least 2 characters long' }),
  lastName: z
    .string({ error: 'lastName must be a string' })
    .min(2, { message: 'lastName is required and must be at least 2 characters long' }),
  email: z.email({ error: 'email must be a valid email address' }),
  password: z.string().min(8, { message: 'Password must contain at least 8 characters' }),
  isActive: z.boolean().default(true)
});

export const userOutputSchema = z.strictObject({
  _id: z.instanceof(Types.ObjectId),
  ...userInputSchema.shape,
  createdAt: z.date(),
  updatedAt: z.date()
});
