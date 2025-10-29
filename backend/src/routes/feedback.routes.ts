import { Router } from 'express';
import { 
  submitDocumentFeedback,
  updateApplicationStatus,
  getFeedbackStats,
  getSuccessStats,
  getUserApplications,
  getKnowledge,
  updateKnowledge
} from '../controllers/feedbackController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// User feedback routes (authenticated)
router.post('/feedback/submit', authenticateJWT, submitDocumentFeedback);
router.post('/feedback/application-status', authenticateJWT, updateApplicationStatus);
router.get('/feedback/my-applications', authenticateJWT, getUserApplications);

// Analytics routes (authenticated)
router.get('/feedback/analytics', authenticateJWT, getFeedbackStats);
router.get('/feedback/success-rates', authenticateJWT, getSuccessStats);

// Knowledge base routes
router.get('/knowledge', getKnowledge);
router.post('/knowledge/update', authenticateJWT, updateKnowledge);

export default router;
