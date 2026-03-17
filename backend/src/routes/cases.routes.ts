import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext, organizationContextAllowExpired } from '../middleware/organizationContext';
import {
  createCaseHandler,
  getCases,
  getCaseByIdHandler,
  updateCaseHandler,
  deleteCaseHandler,
  getCaseStats,
  getApplicantDashboard,
} from '../controllers/caseController';
import {
  crossValidateController,
  readinessScoreController,
} from '../controllers/aiController';

const router = Router();

router.use(auth);

// Read-only routes — allow expired trial so dashboard/overview don't 402
router.get('/', organizationContextAllowExpired, getCases);
router.get('/stats', organizationContextAllowExpired, getCaseStats);
router.get('/applicant-dashboard', organizationContextAllowExpired, getApplicantDashboard);
router.get('/:id', organizationContextAllowExpired, getCaseByIdHandler);
router.get('/:caseId/readiness-score', organizationContextAllowExpired, readinessScoreController);

// Write routes — require active trial
router.post('/', organizationContext, createCaseHandler);
router.put('/:id', organizationContext, updateCaseHandler);
router.delete('/:id', organizationContext, deleteCaseHandler);
router.post('/:caseId/cross-validate', organizationContext, crossValidateController);

export default router;
