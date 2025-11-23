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
  createPurposeOfVisit,
  createTiesToHomeCountry,
  createTravelItinerary
} from '../controllers/aiController';
import { optionalAuth, authenticateJWT, requirePlan } from '../middleware/auth';

const router = Router();

// AI Chat - Immigration Expert (Available to all plans, but limits enforced)
router.post('/ai/chat', optionalAuth, chat);

// Document Generation - SOP (Limits enforced per tier)
router.post('/ai/generate-sop', authenticateJWT, createSOP);

// Document Analysis - SOP Review (Limits enforced per tier)
router.post('/ai/analyze-sop', authenticateJWT, reviewSOP);

// Visa Eligibility Check (Limits enforced per tier)
router.post('/ai/check-eligibility', authenticateJWT, checkVisaEligibility);

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

// Ties to Home Country Demonstrator (Professional+ required)
router.post('/ai/generate-ties-to-home-country', authenticateJWT, requirePlan('professional', 'enterprise'), createTiesToHomeCountry);

// Travel Itinerary Builder (Entry+ required)
router.post('/ai/generate-travel-itinerary', authenticateJWT, requirePlan('entry', 'professional', 'enterprise'), createTravelItinerary);

export default router;

