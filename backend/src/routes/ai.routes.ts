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
  createTravelItinerary,
  calculateFinancialCapacityController,
  analyzeBankStatementController,
  analyzeDocumentAuthenticityController,
  analyzeApplicationFormController,
  analyzeVisaRejectionController,
  buildReapplicationStrategyController,
  checkDocumentConsistencyController,
  generateStudentVisaPackageController,
  generateAIChecklist,
  improveDocumentController,
  analyzeFinancialDocs,
  generateSponsorLetter,
  getPreDocRequirements
} from '../controllers/aiController';
import { optionalAuth, authenticateJWT, requirePlan } from '../middleware/auth';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';

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

// Financial Capacity Calculator (Professional+ required - CRITICAL feature)
router.post('/ai/calculate-financial-capacity', authenticateJWT, requirePlan('professional', 'enterprise'), calculateFinancialCapacityController);

// Bank Statement Analyzer (Professional+ required - CRITICAL feature)
router.post('/ai/analyze-bank-statement', authenticateJWT, requirePlan('professional', 'enterprise'), analyzeBankStatementController);

// Document Authenticity Checklist (Professional+ required)
router.post('/ai/document-authenticity', authenticateJWT, requirePlan('professional', 'enterprise'), analyzeDocumentAuthenticityController);

// Application Form Pre-Checker (Entry+ required)
router.post('/ai/application-form-checker', authenticateJWT, requirePlan('entry', 'professional', 'enterprise'), analyzeApplicationFormController);

// Visa Rejection Analyzer (Professional+ required)
router.post('/ai/visa-rejection', authenticateJWT, requirePlan('professional', 'enterprise'), analyzeVisaRejectionController);

// Reapplication Strategy Builder (Professional+ required)
router.post('/ai/reapplication-strategy', authenticateJWT, requirePlan('professional', 'enterprise'), buildReapplicationStrategyController);

// Document Consistency Checker (Professional+ required)
router.post('/ai/document-consistency', authenticateJWT, requirePlan('professional', 'enterprise'), checkDocumentConsistencyController);

// Student Visa Package Generator (Professional+ required)
router.post('/ai/student-visa-package', authenticateJWT, requirePlan('professional', 'enterprise'), generateStudentVisaPackageController);

// AI Checklist Generation (Professional+ required, requires organization context)
router.post('/ai/generate-checklist', auth, organizationContext, generateAIChecklist);

// Document Improvement (Professional+ required)
router.post('/ai/improve-document', authenticateJWT, requirePlan('professional', 'enterprise'), improveDocumentController);

// Financial Documentation Assistant (Professional+ required, requires organization context)
router.post('/ai/analyze-financial', auth, organizationContext, analyzeFinancialDocs);
router.post('/ai/sponsor-letter', auth, organizationContext, generateSponsorLetter);

// Pre-Document Intelligence (Professional+ required, requires organization context)
// Accepts { caseId } OR { visaType, originCountry, destinationCountry }
router.post('/ai/pre-doc-requirements', auth, organizationContext, getPreDocRequirements);

export default router;

