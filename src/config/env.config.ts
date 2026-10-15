import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().default('mongodb://127.0.0.1:27017/secure-notes'),
  JWT_SECRET: z.string().default('default_jwt_secret_key_change_in_production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@example.com'),
  SEED_ADMIN_PASSWORD: z.string().default('admin123'),
  SEED_DEFAULT_PASSWORD: z.string().default('password123'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment configuration:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

const env = parsedEnv.data;

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGO_URI,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
  seedAdminEmail: env.SEED_ADMIN_EMAIL,
  seedAdminPassword: env.SEED_ADMIN_PASSWORD,
  seedDefaultPassword: env.SEED_DEFAULT_PASSWORD,
};

export default config;
