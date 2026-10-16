import { Router } from 'express';
import PostController from './post.controller';
import PostValidation from './post.validation';
import validateRequest from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', PostController.getAllPosts);

// Get user and their posts via $lookup
router.get('/user/:userId', PostController.getUserPostsWithLookup);

router.post(
  '/',
  authenticate,
  validateRequest(PostValidation.createPostSchema),
  PostController.createPost
);

router.get('/:id', PostController.getPostById);

router.patch(
  '/:id',
  authenticate,
  validateRequest(PostValidation.updatePostSchema),
  PostController.updatePost
);

router.delete('/:id', authenticate, PostController.deletePost);

export const postRoutes = router;
export default router;
