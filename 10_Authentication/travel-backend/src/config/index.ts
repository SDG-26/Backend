import { z } from 'zod/v4';

const envSchema = z.object({
  MONGO_URI: z.url({ protocol: /mongodb/ }),
  DB_NAME: z.string(),
  ACCESS_JWT_SECRET: z
    .string({ error: 'ACCESS_JWT_SECRET is required and must be at least 64 characters long' })
    .min(64),
  CLIENT_BASE_URL: z.url().default('http://localhost:5173'),
  SALT_ROUNDS: z.coerce.number().default(10),
  JWT_EXPIRATION_TIME: z.string().default('15min')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.log('Invalid environment variables:\n', z.prettifyError(parsedEnv.error));
  process.exit(1);
}

export const { MONGO_URI, DB_NAME, ACCESS_JWT_SECRET, CLIENT_BASE_URL, SALT_ROUNDS, JWT_EXPIRATION_TIME } =
  parsedEnv.data;
