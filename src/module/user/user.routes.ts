import { Router } from 'express';
import UserController from './user.controller';
import UserValidation from './user.validation';
import validateRequest from '../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

router.get(
  '/group-by-interests',
  authenticate,
  UserController.groupUsersByInterests
);

router.get('/', authenticate, authorize('ADMIN'), UserController.getAllUsers);

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validateRequest(UserValidation.createUserValidationSchema),
  UserController.createUser
);

router.get(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  UserController.getUserById
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateRequest(UserValidation.updateUserValidationSchema),
  UserController.updateUser
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  UserController.deleteUser
);

export const userRoutes = router;
export default router;
