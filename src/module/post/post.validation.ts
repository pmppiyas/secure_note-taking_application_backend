import { z } from 'zod';

const createPostSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .trim(),
    body: z
      .string()
      .min(1, 'Body is required'),
  }),
});

const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').trim().optional(),
    body: z.string().min(1, 'Body cannot be empty').optional(),
  }),
});

export const PostValidation = {
  createPostSchema,
  updatePostSchema,
};

export default PostValidation;
