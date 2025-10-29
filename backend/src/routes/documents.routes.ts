import { Router } from 'express';
import { documentController } from '../controllers/documentController';
import { authenticateJWT } from '../middleware/auth';
import { documentLimiter } from '../middleware/rateLimit';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

// Document generation routes (with rate limiting)
router.post('/generate-sop', documentLimiter, documentController.generateSOP);
router.post('/generate-cover-letter', documentLimiter, documentController.generateCoverLetter);
router.post('/review-sop', documentLimiter, documentController.reviewSOP);

// Document management routes
router.get('/', documentController.getUserDocuments);
router.get('/:id', documentController.getDocument);
router.delete('/:id', documentController.deleteDocument);

export default router;


