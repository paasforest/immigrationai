import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
import {
  generateCaseDocument,
  getCaseDocumentChecklist,
  getCaseDocuments,
  generateCaseEligibilityReport,
} from '../controllers/caseDocumentsController';

const router = Router();

// Apply authentication and organization context to all routes
router.use(authenticateJWT);
router.use(organizationContext);

/**
 * POST /api/cases/:caseId/documents/generate
 * Generate a document for a specific case
 */
router.post('/:caseId/documents/generate', generateCaseDocument);

/**
 * GET /api/cases/:caseId/documents/checklist
 * Get document checklist for a case
 */
router.get('/:caseId/documents/checklist', getCaseDocumentChecklist);

/**
 * GET /api/cases/:caseId/documents
 * Get all documents for a case (both generated and uploaded)
 */
router.get('/:caseId/documents', getCaseDocuments);

/**
 * GET /api/cases/:caseId/eligibility-report
 * Generate eligibility report for a case
 */
router.get('/:caseId/eligibility-report', generateCaseEligibilityReport);

export default router;
