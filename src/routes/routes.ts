import { Router } from 'express';
import { authRoutes } from '../module/auth/auth.routes';
import { userRoutes } from '../module/user/user.routes';
import { noteRoutes } from '../module/note/note.routes';
import { postRoutes } from '../module/post/post.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/notes',
    route: noteRoutes,
  },
  {
    path: '/posts',
    route: postRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
