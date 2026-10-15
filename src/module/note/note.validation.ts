import { z } from 'zod';

const createNoteSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .trim(),
    content: z
      .string()
      .min(1, 'Content is required'),
  }),
});

const updateNoteSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .trim()
      .optional(),
    content: z
      .string()
      .min(1, 'Content cannot be empty')
      .optional(),
  }),
});

export const NoteValidation = {
  createNoteSchema,
  updateNoteSchema,
};

export default NoteValidation;
