import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
import {
  getEvaluationBodies,
  checkUniversityRecognition,
  getAttestationSteps,
  generateCredentialGuide,
} from '../controllers/credentialController';

const router = Router();

// All credential routes require authentication and organization context
router.use(auth);
router.use(organizationContext);

// Credential routes
router.get('/evaluation-bodies', getEvaluationBodies); // GET /api/credentials/evaluation-bodies
router.get('/university-check', checkUniversityRecognition); // GET /api/credentials/university-check
router.get('/attestation-steps', getAttestationSteps); // GET /api/credentials/attestation-steps
router.post('/generate-guide', generateCredentialGuide); // POST /api/credentials/generate-guide

export default router;
