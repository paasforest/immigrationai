import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
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

// All case routes require authentication and organization context
router.use(auth);
router.use(organizationContext);

// Case routes
router.get('/', getCases); // GET /api/cases
router.post('/', createCaseHandler); // POST /api/cases
router.get('/stats', getCaseStats); // GET /api/cases/stats
router.get('/applicant-dashboard', getApplicantDashboard); // GET /api/cases/applicant-dashboard
router.get('/:id', getCaseByIdHandler); // GET /api/cases/:id
router.put('/:id', updateCaseHandler); // PUT /api/cases/:id
router.delete('/:id', deleteCaseHandler); // DELETE /api/cases/:id

// Case Intelligence
router.get('/:caseId/readiness-score', readinessScoreController); // GET /api/cases/:caseId/readiness-score
router.post('/:caseId/cross-validate', crossValidateController); // POST /api/cases/:caseId/cross-validate

export default router;
