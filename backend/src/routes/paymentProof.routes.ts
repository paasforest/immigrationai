import { Router } from 'express';
import { paymentProofController, uploadMiddleware } from '../controllers/paymentProofController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Upload payment proof (requires auth)
router.post('/upload-proof', requireAuth, uploadMiddleware, paymentProofController.uploadProof);

// Get payment proof status (requires auth)
router.get('/proof-status', requireAuth, paymentProofController.getProofStatus);

export default router;

