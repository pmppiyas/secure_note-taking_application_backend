import { Router } from 'express';
import NoteController from './note.controller';
import NoteValidation from './note.validation';
import validateRequest from '../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// Apply authenticate middleware to all note routes
router.use(authenticate);

// Admin-only: list all notes across users (Must be BEFORE /:id)
router.get('/all', authorize('ADMIN'), NoteController.getAllNotesForAdmin);

// User-specific: list own notes (Must be BEFORE /:id)
router.get('/my-notes', NoteController.getMyNotes);

// Create a new note
router.post(
  '/',
  validateRequest(NoteValidation.createNoteSchema),
  NoteController.createNote
);

// Get a single note by id
router.get('/:id', NoteController.getNoteById);

// Update a note by id
router.patch(
  '/:id',
  validateRequest(NoteValidation.updateNoteSchema),
  NoteController.updateNote
);

// Delete a note by id
router.delete('/:id', NoteController.deleteNote);

export const noteRoutes = router;
export default router;
