import { Router } from 'express';
import { eligibilityController } from '../controllers/eligibilityController';
import { apiLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/check', apiLimiter, eligibilityController.checkEligibility);

export default router;

