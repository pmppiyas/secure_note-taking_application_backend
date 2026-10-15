import { Router } from 'express';
import NoteController from './note.controller';
import NoteValidation from './note.validation';
import validateRequest from '../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/all', authorize('ADMIN'), NoteController.getAllNotesForAdmin);

router.get('/my-notes', NoteController.getMyNotes);

router.post(
  '/',
  validateRequest(NoteValidation.createNoteSchema),
  NoteController.createNote
);

router.get('/:id', NoteController.getNoteById);

router.patch(
  '/:id',
  validateRequest(NoteValidation.updateNoteSchema),
  NoteController.updateNote
);

router.delete('/:id', NoteController.deleteNote);

export const noteRoutes = router;
export default router;
