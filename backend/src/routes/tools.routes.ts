import { Router } from 'express';
import { auth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  scoreHomeTiesHandler,
  credentialLookupHandler,
  credentialOptionsHandler,
} from '../controllers/toolsController';

const router = Router();

// All tool routes require authentication
router.use(auth);

// Home Ties Scorer
router.post('/home-ties/score', asyncHandler(scoreHomeTiesHandler));

// Credential Evaluation Matrix
router.get('/credential-evaluation/options', asyncHandler(credentialOptionsHandler));
router.post('/credential-evaluation/lookup', asyncHandler(credentialLookupHandler));

export default router;
