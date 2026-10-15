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

export const PostValidation = {
  createPostSchema,
};

export default PostValidation;
