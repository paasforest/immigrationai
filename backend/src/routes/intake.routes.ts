import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
import { requireAdmin } from '../middleware/requireAdmin';
import {
  submitIntake,
  getServices,
  getIntakeStatus,
  getMyLeads,
  respondToLead,
  getMySpecializations,
  upsertSpecialization,
  deleteSpecialization,
  upsertPublicProfile,
  getMyProfile,
  getPublicDirectory,
  getPublicProfile,
  getPendingVerifications,
  verifyProfessional,
  getAllIntakes,
  getRoutingStats,
  getMyLeadStats,
  patchEligibilityScore,
  submitVerificationDoc,
  verificationUpload,
  getLeadUsage,
  sendIntakeMessage,
  getIntakeMessages,
} from '../controllers/intakeController';

const router = Router();

// Public routes (no auth)
router.post('/submit', submitIntake); // POST /api/intake/submit
router.get('/services', getServices); // GET /api/intake/services
router.get('/status/:ref', getIntakeStatus); // GET /api/intake/status/:ref
router.get('/directory', getPublicDirectory); // GET /api/intake/directory
router.get('/directory/:userId', getPublicProfile); // GET /api/intake/directory/:userId
router.patch('/:id/eligibility-score', patchEligibilityScore); // PATCH /api/intake/:id/eligibility-score (no auth — silent background call)

// Pre-case messaging (public — identified by referenceNumber + email)
router.post('/messages', sendIntakeMessage);          // POST /api/intake/messages
router.get('/messages/:ref', getIntakeMessages);      // GET  /api/intake/messages/:ref

// Protected routes (auth + organizationContext)
router.use(auth);
router.use(organizationContext);

router.get('/my-leads', getMyLeads); // GET /api/intake/my-leads
router.post('/respond', respondToLead); // POST /api/intake/respond
router.get('/specializations', getMySpecializations); // GET /api/intake/specializations
router.post('/specializations', upsertSpecialization); // POST /api/intake/specializations
router.delete('/specializations/:id', deleteSpecialization); // DELETE /api/intake/specializations/:id
router.post('/profile', upsertPublicProfile); // POST /api/intake/profile
router.get('/profile', getMyProfile); // GET /api/intake/profile
router.get('/my-stats', getMyLeadStats);    // GET /api/intake/my-stats
router.get('/lead-usage', getLeadUsage);    // GET /api/intake/lead-usage
router.post('/profile/upload-verification', verificationUpload, submitVerificationDoc); // POST /api/intake/profile/upload-verification

// Admin routes (require admin role)
router.get('/admin/verifications', requireAdmin, getPendingVerifications); // GET /api/intake/admin/verifications
router.post('/admin/verify', requireAdmin, verifyProfessional); // POST /api/intake/admin/verify
router.get('/admin/all-intakes', requireAdmin, getAllIntakes); // GET /api/intake/admin/all-intakes
router.get('/admin/routing-stats', requireAdmin, getRoutingStats); // GET /api/intake/admin/routing-stats

export default router;
