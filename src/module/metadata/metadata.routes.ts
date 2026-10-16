import { Router } from 'express';
import MetadataController from './metadata.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', MetadataController.getMetadata);

export const metadataRoutes = router;
export default router;
