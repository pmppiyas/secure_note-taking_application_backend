import { Router } from 'express';
import UserController from './user.controller';
import UserValidation from './user.validation';
import PostController from '../post/post.controller';
import validateRequest from '../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

import MetadataController from '../metadata/metadata.controller';

const router = Router();

// Dashboard Metadata
router.get('/metadata', authenticate, MetadataController.getMetadata);

// Scenario 1 Aggregation: Group users by interests (Authenticated)
router.get(
  '/group-by-interests',
  authenticate,
  UserController.groupUsersByInterests
);

// Scenario 2 Aggregation: Get user posts via $lookup (Public alias: /users/:userId/posts)
router.get('/:userId/posts', PostController.getUserPostsWithLookup);

// Admin-only User CRUD routes
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
