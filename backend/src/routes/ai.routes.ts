import { Router } from 'express';
import { 
  chat, 
  createSOP, 
  reviewSOP, 
  checkVisaEligibility,
  createEmailTemplate,
  createSupportLetter,
  createTravelHistory,
  createFinancialLetter,
  createPurposeOfVisit
} from '../controllers/aiController';
import { optionalAuth, authenticateJWT, requirePlan } from '../middleware/auth';

const router = Router();

// AI Chat - Immigration Expert (Available to all plans)
router.post('/ai/chat', optionalAuth, chat);

// Document Generation - SOP (Available to all plans)
router.post('/ai/generate-sop', optionalAuth, createSOP);

// Document Analysis - SOP Review (Available to all plans)
router.post('/ai/analyze-sop', optionalAuth, reviewSOP);

// Visa Eligibility Check (Available to all plans)
router.post('/ai/check-eligibility', optionalAuth, checkVisaEligibility);

// NEW DOCUMENT GENERATORS - Premium features
// Email Template Generator (Professional+ required)
router.post('/ai/generate-email', authenticateJWT, requirePlan('professional', 'enterprise'), createEmailTemplate);

// Support Letters (Professional+ required)
router.post('/ai/generate-support-letter', authenticateJWT, requirePlan('professional', 'enterprise'), createSupportLetter);

// Travel History Formatter (Professional+ required)
router.post('/ai/format-travel-history', authenticateJWT, requirePlan('professional', 'enterprise'), createTravelHistory);

// Financial Justification Letter (Professional+ required)
router.post('/ai/generate-financial-letter', authenticateJWT, requirePlan('professional', 'enterprise'), createFinancialLetter);

// Purpose of Visit Explanation (Professional+ required)
router.post('/ai/generate-purpose-of-visit', authenticateJWT, requirePlan('professional', 'enterprise'), createPurposeOfVisit);

export default router;

