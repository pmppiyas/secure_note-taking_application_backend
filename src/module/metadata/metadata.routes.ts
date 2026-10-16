import { Router } from 'express';
import MetadataController from './metadata.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Admin-specific metadata endpoint: GET /api/v1/metadata/admin
router.get('/admin', authorize('ADMIN'), MetadataController.getAdminMetadata);

// Unified user/admin metadata endpoint: GET /api/v1/metadata
router.get('/', MetadataController.getMetadata);

export const metadataRoutes = router;
export default router;
