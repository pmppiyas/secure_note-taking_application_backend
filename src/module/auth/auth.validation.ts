import { z } from 'zod';

const registerValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .trim(),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address')
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    role: z.enum(['USER', 'ADMIN']).optional(),
    interests: z.array(z.string()).optional(),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address')
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(1, 'Password is required'),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
};

export default AuthValidation;
