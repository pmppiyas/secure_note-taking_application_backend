import { Router } from 'express';
import AuthController from './auth.controller';
import AuthValidation from './auth.validation';
import validateRequest from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post(
  '/register',
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.register
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login
);

router.get(
  '/me',
  authenticate,
  AuthController.getMe
);

export const authRoutes = router;
export default router;
