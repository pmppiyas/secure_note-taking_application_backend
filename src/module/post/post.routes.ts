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

export const postRoutes = router;
export default router;
