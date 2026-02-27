import { Request, Response } from 'express';
import { 
  chatWithAI, 
  generateSOP, 
  analyzeSOP, 
  checkEligibility,
  generateEmailTemplate,
  generateSupportLetter,
  formatTravelHistory,
  generateFinancialLetter,
  generatePurposeOfVisit,
  generateTiesToHomeCountry,
  generateTravelItinerary,
  calculateFinancialCapacity,
  analyzeBankStatement,
  analyzeDocumentAuthenticity,
  analyzeApplicationForm,
  analyzeVisaRejection,
  buildReapplicationStrategy,
  checkDocumentConsistency,
  generateStudentVisaPackage,
  generateChecklistItems,
  improveDocument,
  generatePreDocIntelligence
} from '../services/aiService';
import { sendSuccess, sendError } from '../utils/helpers';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types/request';
import { canAccessFeature } from '../services/limitEnforcement';

// AI Chat Endpoint
export const chat = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return sendError(res, 'validation_error', 'Message is required', 400);
    }

    // Check feature access if user is authenticated
    const authReq = req as AuthRequest;
    if (authReq.user?.userId) {
      const accessCheck = await canAccessFeature(authReq.user.userId, 'ai_chat');
      if (!accessCheck.allowed) {
        return sendError(res, 'LIMIT_EXCEEDED', accessCheck.reason || 'Feature not available in your plan', 403);
      }
    }

    const response = await chatWithAI(message, history || []);

    return sendSuccess(res, { message: response }, 'Chat response generated');
  } catch (error: any) {
    logger.error('Chat endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to generate chat response', 500);
  }
};

// Generate SOP Endpoint
export const createSOP = async (req: AuthRequest, res: Response) => {
  try {
    const {
      fullName,
      currentCountry,
      targetCountry,
      purpose,
      institution,
      program,
      background,
      motivation,
      careerGoals,
    } = req.body;

    // Validation
    if (!fullName || !targetCountry || !institution) {
      return sendError(res, 'validation_error', 'Required fields: fullName, targetCountry, institution', 400);
    }

    const userId = req.user?.userId;
    
    // CRITICAL: Check user limits if authenticated
    if (userId) {
      const accessCheck = await canAccessFeature(userId, 'sop_generation', 'sop');
      if (!accessCheck.allowed) {
        return sendError(res, 'LIMIT_EXCEEDED', accessCheck.reason || 'Monthly limit exceeded', 403);
      }
    }

    const result = await generateSOP({
      fullName,
      currentCountry: currentCountry || '',
      targetCountry,
      purpose: purpose || 'study',
      institution,
      program: program || '',
      background: background || '',
      motivation: motivation || '',
      careerGoals: careerGoals || '',
    }, userId);

    // Optionally save to database
    // const userId = (req as any).user?.userId;
    // if (userId) {
    //   await prisma.document.create({
    //     data: {
    //       userId,
    //       type: 'sop',
    //       title: `SOP for ${institution}`,
    //       generatedOutput: result.sop,
    //       inputData: req.body,
    //     },
    //   });
    // }

    return sendSuccess(res, { 
      sop: result.sop,
      tokensUsed: result.tokensUsed 
    }, 'SOP generated successfully');
  } catch (error: any) {
    logger.error('SOP generation endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to generate SOP', 500);
  }
};

// Analyze SOP Endpoint
export const reviewSOP = async (req: AuthRequest, res: Response) => {
  try {
    // CRITICAL: Check user limits if authenticated
    if (req.user?.userId) {
      const accessCheck = await canAccessFeature(req.user.userId, 'sop_reviewer');
      if (!accessCheck.allowed) {
        return sendError(res, 'LIMIT_EXCEEDED', accessCheck.reason || 'Feature not available in your plan', 403);
      }
    }

    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return sendError(res, 'validation_error', 'SOP text is required', 400);
    }

    if (text.length < 100) {
      return sendError(res, 'validation_error', 'SOP text too short. Minimum 100 characters required', 400);
    }

    const userId = req.user?.userId;
    const analysis = await analyzeSOP(text, userId);

    return sendSuccess(res, {
      analysis: {
        score: analysis.score,
        suggestions: analysis.suggestions,
      },
      tokensUsed: analysis.tokensUsed,
    }, 'SOP analysis completed');
  } catch (error: any) {
    logger.error('SOP analysis endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to analyze SOP', 500);
  }
};

// Check Visa Eligibility Endpoint
export const checkVisaEligibility = async (req: AuthRequest, res: Response) => {
  try {
    // CRITICAL: Check user limits if authenticated
    if (req.user?.userId) {
      const accessCheck = await canAccessFeature(req.user.userId, 'visa_eligibility_check');
      if (!accessCheck.allowed) {
        return sendError(res, 'LIMIT_EXCEEDED', accessCheck.reason || 'Monthly limit exceeded', 403);
      }
    }

    const {
      targetCountry,
      visaType,
      age,
      education,
      workExperience,
      languageTest,
      languageScore,
      funds,
      // Family-specific fields
      relationship,
      sponsorStatus,
      sponsorIncome,
      // Work-specific fields
      jobOffer,
      employer,
      salary,
      // Study-specific fields
      institution,
      program,
      tuition,
      // General fields
      nationality,
      maritalStatus,
      dependents,
    } = req.body;

    if (!targetCountry || !visaType) {
      return sendError(res, 'validation_error', 'Required fields: targetCountry, visaType', 400);
    }

    const userId = req.user?.userId;
    const result = await checkEligibility({
      targetCountry,
      visaType,
      age,
      education,
      workExperience,
      languageTest,
      languageScore,
      funds,
      // Family-specific fields
      relationship,
      sponsorStatus,
      sponsorIncome,
      // Work-specific fields
      jobOffer,
      employer,
      salary,
      // Study-specific fields
      institution,
      program,
      tuition,
      // General fields
      nationality,
      maritalStatus,
      dependents,
    }, userId);

    return sendSuccess(res, {
      eligible: result.eligible,
      score: result.score,
      analysis: result.analysis,
      recommendations: result.recommendations,
      tokensUsed: result.tokensUsed,
    }, 'Eligibility check completed');
  } catch (error: any) {
    logger.error('Eligibility check endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to check eligibility', 500);
  }
};

// Generate Email Template Endpoint
export const createEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { emailType, recipientName, recipientTitle, embassy, country, applicationRef, submissionDate, specificQuery, senderName, senderEmail } = req.body;

    if (!emailType || !senderName) {
      return sendError(res, 'validation_error', 'Required fields: emailType, senderName', 400);
    }

    const result = await generateEmailTemplate({
      emailType,
      recipientName,
      recipientTitle,
      embassy,
      country,
      applicationRef,
      submissionDate,
      specificQuery,
      senderName,
      senderEmail,
    });

    return sendSuccess(res, {
      email: result.email,
      tokensUsed: result.tokensUsed,
    }, 'Email template generated');
  } catch (error: any) {
    logger.error('Email generation endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to generate email', 500);
  }
};

// Generate Support Letter Endpoint
export const createSupportLetter = async (req: Request, res: Response) => {
  try {
    const { letterType, visitorName } = req.body;

    if (!letterType || !visitorName) {
      return sendError(res, 'validation_error', 'Required fields: letterType, visitorName', 400);
    }

    const result = await generateSupportLetter(req.body);

    return sendSuccess(res, {
      letter: result.letter,
      tokensUsed: result.tokensUsed,
    }, 'Support letter generated');
  } catch (error: any) {
    logger.error('Support letter endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to generate support letter', 500);
  }
};

// Format Travel History Endpoint
export const createTravelHistory = async (req: Request, res: Response) => {
  try {
    const { travelHistory, format } = req.body;

    if (!travelHistory) {
      return sendError(res, 'validation_error', 'Required field: travelHistory', 400);
    }

    const result = await formatTravelHistory({ travelHistory, format });

    return sendSuccess(res, {
      formatted: result.formatted,
      tokensUsed: result.tokensUsed,
    }, 'Travel history formatted');
  } catch (error: any) {
    logger.error('Travel history endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to format travel history', 500);
  }
};

// Generate Financial Letter Endpoint
export const createFinancialLetter = async (req: Request, res: Response) => {
  try {
    const { applicantName, targetCountry, visaType, availableFunds, sourceOfFunds } = req.body;

    if (!applicantName || !targetCountry || !visaType || !availableFunds || !sourceOfFunds) {
      return sendError(res, 'validation_error', 'Required fields: applicantName, targetCountry, visaType, availableFunds, sourceOfFunds', 400);
    }

    const result = await generateFinancialLetter(req.body);

    return sendSuccess(res, {
      letter: result.letter,
      tokensUsed: result.tokensUsed,
    }, 'Financial letter generated');
  } catch (error: any) {
    logger.error('Financial letter endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to generate financial letter', 500);
  }
};

// Generate Purpose of Visit Endpoint
export const createPurposeOfVisit = async (req: Request, res: Response) => {
  try {
    const { applicantName, targetCountry, visaType, visitPurpose, duration } = req.body;

    if (!applicantName || !targetCountry || !visaType || !visitPurpose || !duration) {
      return sendError(res, 'validation_error', 'Required fields: applicantName, targetCountry, visaType, visitPurpose, duration', 400);
    }

    const result = await generatePurposeOfVisit(req.body);

    return sendSuccess(res, {
      explanation: result.explanation,
      tokensUsed: result.tokensUsed,
    }, 'Purpose of visit generated');
  } catch (error: any) {
    logger.error('Purpose of visit endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to generate purpose of visit', 500);
  }
};

// Generate Ties to Home Country Endpoint
export const createTiesToHomeCountry = async (req: Request, res: Response) => {
  try {
    const { applicantName, targetCountry, visaType, homeCountry } = req.body;

    if (!applicantName || !targetCountry || !homeCountry) {
      return sendError(res, 'validation_error', 'Required fields: applicantName, targetCountry, homeCountry', 400);
    }

    const result = await generateTiesToHomeCountry(req.body);

    return sendSuccess(res, {
      assessment: result.assessment,
      tokensUsed: result.tokensUsed,
    }, 'Ties to home country assessment generated');
  } catch (error: any) {
    logger.error('Ties to home country endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to generate ties to home country document', 500);
  }
};

// Generate Travel Itinerary Endpoint
export const createTravelItinerary = async (req: Request, res: Response) => {
  try {
    const { applicantName, targetCountry, visaType, travelDates, cities, purpose } = req.body;

    if (!applicantName || !targetCountry || !visaType || !travelDates || !cities || !purpose) {
      return sendError(res, 'validation_error', 'Required fields: applicantName, targetCountry, visaType, travelDates, cities, purpose', 400);
    }

    const result = await generateTravelItinerary(req.body);

    return sendSuccess(res, {
      itinerary: result.itinerary,
      tokensUsed: result.tokensUsed,
    }, 'Travel itinerary generated');
  } catch (error: any) {
    logger.error('Travel itinerary endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to generate travel itinerary', 500);
  }
};

// Calculate Financial Capacity Endpoint
export const calculateFinancialCapacityController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'auth_error', 'Authentication required', 401);
    }

    // Check feature access
    const accessCheck = await canAccessFeature(userId, 'financial_calculator');
    if (!accessCheck.allowed) {
      return sendError(res, 'access_denied', accessCheck.reason || 'Access denied', 403);
    }

    const {
      applicantName,
      targetCountry,
      visaType,
      availableFunds,
      monthlyIncome,
      annualIncome,
      sourceOfFunds,
      durationOfStay,
      homeCountry,
      tuitionFees,
      livingCosts,
      accommodationCosts,
      otherExpenses,
      sponsorName,
      sponsorRelationship,
      sponsorIncome,
      dependents
    } = req.body;

    if (!applicantName || !targetCountry || !visaType) {
      return sendError(res, 'validation_error', 'Required fields: applicantName, targetCountry, visaType', 400);
    }

    const result = await calculateFinancialCapacity({
      applicantName,
      targetCountry,
      visaType,
      availableFunds,
      monthlyIncome,
      annualIncome,
      sourceOfFunds,
      durationOfStay,
      homeCountry,
      tuitionFees,
      livingCosts,
      accommodationCosts,
      otherExpenses,
      sponsorName,
      sponsorRelationship,
      sponsorIncome,
      dependents
    });

    return sendSuccess(res, {
      calculation: result.calculation,
      tokensUsed: result.tokensUsed,
    }, 'Financial capacity calculated');
  } catch (error: any) {
    logger.error('Financial capacity calculation endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to calculate financial capacity', 500);
  }
};

// Analyze Bank Statement Endpoint
export const analyzeBankStatementController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'auth_error', 'Authentication required', 401);
    }

    // Check feature access
    const accessCheck = await canAccessFeature(userId, 'bank_analyzer');
    if (!accessCheck.allowed) {
      return sendError(res, 'access_denied', accessCheck.reason || 'Access denied', 403);
    }

    const {
      applicantName,
      targetCountry,
      visaType,
      statementText,
      accountBalance,
      averageBalance,
      minimumBalance,
      accountType,
      currency,
      statementPeriod,
      monthlyIncome,
      monthlyExpenses,
      largeDeposits,
      sourceOfFunds,
      homeCountry
    } = req.body;

    if (!applicantName || !targetCountry || !visaType) {
      return sendError(res, 'validation_error', 'Required fields: applicantName, targetCountry, visaType', 400);
    }

    const result = await analyzeBankStatement({
      applicantName,
      targetCountry,
      visaType,
      statementText,
      accountBalance,
      averageBalance,
      minimumBalance,
      accountType,
      currency,
      statementPeriod,
      monthlyIncome,
      monthlyExpenses,
      largeDeposits,
      sourceOfFunds,
      homeCountry
    });

    return sendSuccess(res, {
      analysis: result.analysis,
      tokensUsed: result.tokensUsed,
    }, 'Bank statement analyzed');
  } catch (error: any) {
    logger.error('Bank statement analysis endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to analyze bank statement', 500);
  }
};

// Document Authenticity Checklist Endpoint
export const analyzeDocumentAuthenticityController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'auth_error', 'Authentication required', 401);
    }

    const accessCheck = await canAccessFeature(userId, 'document_authenticity');
    if (!accessCheck.allowed) {
      return sendError(res, 'access_denied', accessCheck.reason || 'Access denied', 403);
    }

    const { applicantName, targetCountry, visaType, documents, riskConcerns, notes } = req.body;

    if (!applicantName || !targetCountry || !visaType) {
      return sendError(res, 'validation_error', 'Required fields: applicantName, targetCountry, visaType', 400);
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return sendError(res, 'validation_error', 'Please provide at least one document to analyze', 400);
    }

    const result = await analyzeDocumentAuthenticity({
      applicantName,
      targetCountry,
      visaType,
      documents,
      riskConcerns,
      notes,
    });

    return sendSuccess(res, {
      report: result.report,
      tokensUsed: result.tokensUsed,
    }, 'Document authenticity checklist generated');
  } catch (error: any) {
    logger.error('Document authenticity endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to generate document authenticity checklist', 500);
  }
};

// Application Form Pre-Checker Endpoint
export const analyzeApplicationFormController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'auth_error', 'Authentication required', 401);
    }

    const accessCheck = await canAccessFeature(userId, 'application_form_checker');
    if (!accessCheck.allowed) {
      return sendError(res, 'access_denied', accessCheck.reason || 'Access denied', 403);
    }

    const { applicantName, targetCountry, visaType, submissionType, formVersion, sections, attachments, concerns } = req.body;

    if (!applicantName || !targetCountry || !visaType) {
      return sendError(res, 'validation_error', 'Required fields: applicantName, targetCountry, visaType', 400);
    }

    if (!Array.isArray(sections) || sections.length === 0) {
      return sendError(res, 'validation_error', 'Please provide at least one form section with fields', 400);
    }

    const result = await analyzeApplicationForm({
      applicantName,
      targetCountry,
      visaType,
      submissionType,
      formVersion,
      sections,
      attachments,
      concerns,
    });

    return sendSuccess(res, {
      report: result.report,
      tokensUsed: result.tokensUsed,
    }, 'Application form checklist generated');
  } catch (error: any) {
    logger.error('Application form checker endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to analyze application form', 500);
  }
};

// Visa Rejection Analyzer Endpoint
export const analyzeVisaRejectionController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'auth_error', 'Authentication required', 401);
    }

    const accessCheck = await canAccessFeature(userId, 'visa_rejection_analyzer');
    if (!accessCheck.allowed) {
      return sendError(res, 'access_denied', accessCheck.reason || 'Access denied', 403);
    }

    const { applicantName, targetCountry, visaType, rejectionDate, rejectionReason, rejectionLetter, previousAttempts, documentsSubmitted, concerns } = req.body;

    if (!applicantName || !targetCountry || !visaType) {
      return sendError(res, 'validation_error', 'Required fields: applicantName, targetCountry, visaType', 400);
    }

    if (!rejectionLetter && !rejectionReason) {
      return sendError(res, 'validation_error', 'Please include either the rejection letter text or the stated reason.', 400);
    }

    const result = await analyzeVisaRejection({
      applicantName,
      targetCountry,
      visaType,
      rejectionDate,
      rejectionReason,
      rejectionLetter,
      previousAttempts,
      documentsSubmitted,
      concerns,
    });

    return sendSuccess(res, {
      report: result.report,
      tokensUsed: result.tokensUsed,
    }, 'Visa rejection analysis generated');
  } catch (error: any) {
    logger.error('Visa rejection analyzer endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to analyze visa rejection', 500);
  }
};

// Reapplication Strategy Builder Endpoint
export const buildReapplicationStrategyController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'auth_error', 'Authentication required', 401);
    }

    const accessCheck = await canAccessFeature(userId, 'reapplication_strategy');
    if (!accessCheck.allowed) {
      return sendError(res, 'access_denied', accessCheck.reason || 'Access denied', 403);
    }

    const {
      applicantName,
      targetCountry,
      visaType,
      desiredSubmissionDate,
      priorityLevel,
      correctedConcerns,
      improvementsSinceRefusal,
      strategyFocus,
      previousReport,
    } = req.body;

    if (!applicantName || !targetCountry || !visaType) {
      return sendError(res, 'validation_error', 'Required fields: applicantName, targetCountry, visaType', 400);
    }

    const result = await buildReapplicationStrategy({
      applicantName,
      targetCountry,
      visaType,
      desiredSubmissionDate,
      priorityLevel,
      correctedConcerns,
      improvementsSinceRefusal,
      strategyFocus,
      previousReport,
    });

    return sendSuccess(res, {
      report: result.report,
      tokensUsed: result.tokensUsed,
    }, 'Reapplication strategy generated');
  } catch (error: any) {
    logger.error('Reapplication strategy endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to build reapplication strategy', 500);
  }
};

// Check Document Consistency Endpoint
export const checkDocumentConsistencyController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'auth_error', 'Authentication required', 401);
    }

    const accessCheck = await canAccessFeature(userId, 'document_consistency_checker');
    if (!accessCheck.allowed) {
      return sendError(res, 'access_denied', accessCheck.reason || 'Access denied', 403);
    }

    const { applicantName, targetCountry, visaType, documents, keyFields } = req.body;

    if (!applicantName || !targetCountry || !visaType) {
      return sendError(res, 'validation_error', 'Required fields: applicantName, targetCountry, visaType', 400);
    }

    if (!Array.isArray(documents) || documents.length < 2) {
      return sendError(res, 'validation_error', 'Please provide at least 2 documents to compare', 400);
    }

    const result = await checkDocumentConsistency({
      applicantName,
      targetCountry,
      visaType,
      documents,
      keyFields,
    });

    return sendSuccess(res, {
      report: result.report,
      tokensUsed: result.tokensUsed,
    }, 'Document consistency checked');
  } catch (error: any) {
    logger.error('Document consistency endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to check document consistency', 500);
  }
};

// Generate Student Visa Package Endpoint
export const generateStudentVisaPackageController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'auth_error', 'Authentication required', 401);
    }

    const accessCheck = await canAccessFeature(userId, 'student_visa_package');
    if (!accessCheck.allowed) {
      return sendError(res, 'access_denied', accessCheck.reason || 'Access denied', 403);
    }

    const {
      applicantName,
      homeCountry,
      targetCountry,
      currentEducation,
      institution,
      program,
      programDuration,
      tuitionFees,
      startDate,
      availableFunds,
      sourceOfFunds,
      sponsorDetails,
      previousDegrees,
      academicAchievements,
      englishTest,
      testScores,
      careerGoals,
      whyThisProgram
    } = req.body;

    if (!applicantName || !homeCountry || !targetCountry) {
      return sendError(res, 'validation_error', 'Required fields: applicantName, homeCountry, targetCountry', 400);
    }

    const result = await generateStudentVisaPackage({
      applicantName,
      homeCountry,
      targetCountry,
      currentEducation,
      institution,
      program,
      programDuration,
      tuitionFees,
      startDate,
      availableFunds,
      sourceOfFunds,
      sponsorDetails,
      previousDegrees,
      academicAchievements,
      englishTest,
      testScores,
      careerGoals,
      whyThisProgram
    });

    return sendSuccess(res, {
      package: result.package,
      tokensUsed: result.tokensUsed,
    }, 'Student visa package generated');
  } catch (error: any) {
    logger.error('Student visa package endpoint error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to generate student visa package', 500);
  }
};

// ============================================
// AI CHECKLIST GENERATION
// ============================================

export const generateAIChecklist = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const organizationRole = (req as any).organizationRole;

    // Only professional and org_admin can use AI checklist generation
    if (organizationRole !== 'org_admin' && organizationRole !== 'professional') {
      return sendError(res, 'access_denied', 'Only professionals and administrators can generate AI checklists', 403);
    }

    const { visaType, originCountry, destinationCountry, caseId, additionalContext } = req.body;

    if (!visaType || !originCountry || !destinationCountry) {
      return sendError(res, 'validation_error', 'visaType, originCountry, and destinationCountry are required', 400);
    }

    const items = await generateChecklistItems({
      visaType,
      originCountry,
      destinationCountry,
      additionalContext,
    });

    // If caseId provided, create checklist and save items
    if (caseId) {
      const prisma = (await import('../config/prisma')).default;
      const organizationId = (req as any).organizationId;
      const { getCaseById } = await import('../helpers/prismaScopes');

      // Validate case belongs to organization
      const caseData = await getCaseById(organizationId, caseId);
      if (!caseData) {
        return sendError(res, 'not_found', 'Case not found or access denied', 404);
      }

      // Create checklist
      const checklist = await prisma.documentChecklist.create({
        data: {
          caseId,
          organizationId,
          name: `${visaType} - ${destinationCountry}`,
          visaType,
          originCountry,
          destinationCountry,
        },
      });

      // Create checklist items
      await Promise.all(
        items.map((item) =>
          prisma.checklistItem.create({
            data: {
              checklistId: checklist.id,
              name: item.name,
              description: item.description
                ? `Category: ${item.category}\n${item.description}${item.notes ? `\n\nNotes: ${item.notes}` : ''}`
                : `Category: ${item.category}${item.notes ? `\n\nNotes: ${item.notes}` : ''}`,
              isRequired: item.isRequired,
            },
          })
        )
      );

      // Log to audit
      await prisma.auditLog.create({
        data: {
          organizationId,
          userId: user?.id || '',
          action: 'ai_checklist_generated',
          resourceType: 'document_checklist',
          resourceId: checklist.id,
          metadata: {
            caseId,
            itemCount: items.length,
            visaType,
            originCountry,
            destinationCountry,
          },
        },
      });
    }

    return sendSuccess(res, { items }, 'Checklist items generated successfully');
  } catch (error: any) {
    logger.error('AI checklist generation error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to generate checklist', 500);
  }
};

// ============================================
// DOCUMENT IMPROVEMENT
// ============================================

export const improveDocumentController = async (req: AuthRequest, res: Response) => {
  try {
    const { documentType, currentContent, visaType, destinationCountry, originCountry } = req.body;

    if (!documentType || !currentContent || !visaType || !destinationCountry || !originCountry) {
      return sendError(res, 'validation_error', 'All fields are required', 400);
    }

    const result = await improveDocument({
      documentType,
      currentContent,
      visaType,
      destinationCountry,
      originCountry,
    });

    return sendSuccess(res, result, 'Document improvement generated');
  } catch (error: any) {
    logger.error('Document improvement error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to improve document', 500);
  }
};

// ============================================
// FINANCIAL DOCUMENTATION ASSISTANT
// ============================================

export const analyzeFinancialDocs = async (req: AuthRequest, res: Response) => {
  try {
    const {
      monthlyIncome,
      incomeType,
      bankStatementMonths,
      destinationCountry,
      visaType,
      currency,
      sponsorRelationship,
    } = req.body;

    if (!monthlyIncome || !incomeType || !destinationCountry || !visaType || !currency) {
      return sendError(res, 'validation_error', 'Required fields missing', 400);
    }

    // Currency conversion rates (simplified - in production, use a real API)
    const conversionRates: Record<string, Record<string, number>> = {
      NGN: { USD: 0.0012, GBP: 0.00095, CAD: 0.0016, EUR: 0.0011 },
      GHS: { USD: 0.08, GBP: 0.063, CAD: 0.11, EUR: 0.074 },
      KES: { USD: 0.007, GBP: 0.0055, CAD: 0.0095, EUR: 0.0065 },
      ZAR: { USD: 0.054, GBP: 0.043, CAD: 0.074, EUR: 0.05 },
      USD: { USD: 1, GBP: 0.79, CAD: 1.36, EUR: 0.92 },
      GBP: { USD: 1.27, GBP: 1, CAD: 1.72, EUR: 1.17 },
      EUR: { USD: 1.09, GBP: 0.85, CAD: 1.48, EUR: 1 },
      CAD: { USD: 0.74, GBP: 0.58, CAD: 1, EUR: 0.68 },
    };

    // Minimum requirements by destination and visa type (simplified)
    const minimumRequirements: Record<string, Record<string, number>> = {
      'United Kingdom': {
        student: 12000,
        skilled_worker: 1270,
        visitor: 2000,
      },
      'Canada': {
        student: 10000,
        skilled_worker: 0, // Points-based
        visitor: 5000,
      },
      'United States': {
        student: 25000,
        skilled_worker: 0, // Employer-sponsored
        visitor: 5000,
      },
    };

    const minRequired = minimumRequirements[destinationCountry]?.[visaType] || 5000;
    const rate = conversionRates[currency]?.['USD'] || 1;
    const currentAmountUSD = monthlyIncome * rate * (bankStatementMonths || 1);

    // Generate AI analysis
    const prompt = `You are an expert immigration financial consultant. Analyze this financial profile for a visa application:

Monthly Income: ${monthlyIncome} ${currency}
Income Type: ${incomeType}
Bank Statement Months Available: ${bankStatementMonths}
Destination Country: ${destinationCountry}
Visa Type: ${visaType}
Sponsor Relationship: ${sponsorRelationship || 'N/A'}

Estimated USD Equivalent: $${currentAmountUSD.toFixed(2)}
Minimum Required: $${minRequired}

Provide a JSON response with:
{
  "meetsRequirements": boolean,
  "minimumRequired": ${minRequired},
  "currentAmount": ${currentAmountUSD.toFixed(2)},
  "gaps": ["gap1", "gap2"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "warningFlags": ["flag1", "flag2"],
  "coverLetterTemplate": "template text here"
}

Focus on:
- African applicant financial documentation standards
- Cash-heavy economy considerations
- Bank statement requirements
- Sponsor letter requirements if applicable
- Common red flags for ${destinationCountry} visas`;

    // Use OpenAI from environment
    const OpenAI = (await import('openai')).default;
    const openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert immigration financial consultant. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const responseText = response.choices[0]?.message?.content || '';
    let result: any;

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(responseText);
      }
    } catch (error) {
      // Fallback response
      result = {
        meetsRequirements: currentAmountUSD >= minRequired,
        minimumRequired: minRequired,
        currentAmount: currentAmountUSD,
        gaps: currentAmountUSD < minRequired ? [`Shortfall of $${(minRequired - currentAmountUSD).toFixed(2)}`] : [],
        recommendations: [
          'Ensure bank statements cover required period',
          'Provide clear source of funds documentation',
          'Include sponsor letter if applicable',
        ],
        warningFlags: [],
        coverLetterTemplate: 'Financial support letter template...',
      };
    }

    return sendSuccess(res, result, 'Financial analysis completed');
  } catch (error: any) {
    logger.error('Financial analysis error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to analyze financial documents', 500);
  }
};

// ============================================
// PRE-DOC INTELLIGENCE
// ============================================

export const getPreDocRequirements = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = (req as any).organizationId;
    const { caseId, visaType, originCountry, destinationCountry, additionalContext } = req.body;

    let resolvedVisa = visaType;
    let resolvedOrigin = originCountry;
    let resolvedDestination = destinationCountry;
    let applicantName = 'the applicant';
    let existingDocNames: string[] = [];

    if (caseId) {
      const prisma = (await import('../config/prisma')).default;
      const { getCaseById } = await import('../helpers/prismaScopes');

      const caseData = await getCaseById(organizationId, caseId);
      if (!caseData) {
        return sendError(res, 'not_found', 'Case not found or access denied', 404);
      }

      resolvedVisa = caseData.visaType || visaType || '';
      resolvedOrigin = caseData.originCountry || originCountry || '';
      resolvedDestination = caseData.destinationCountry || destinationCountry || '';

      // Get applicant name
      const applicant = await prisma.user.findUnique({
        where: { id: caseData.applicantId },
        select: { fullName: true },
      });
      applicantName = applicant?.fullName || 'the applicant';

      // Get already-uploaded document names for cross-reference
      const docs = await prisma.caseDocument.findMany({
        where: { caseId },
        select: { name: true, category: true, status: true },
      });
      existingDocNames = docs.map((d: { name: string; category: string; status: string }) => `${d.name} (${d.status})`);
    }

    if (!resolvedVisa || !resolvedOrigin || !resolvedDestination) {
      return sendError(
        res,
        'validation_error',
        'visaType, originCountry, and destinationCountry are required',
        400
      );
    }

    const contextWithDocs = [
      additionalContext || '',
      existingDocNames.length
        ? `Documents already uploaded for this case: ${existingDocNames.join(', ')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const intelligence = await generatePreDocIntelligence({
      visaType: resolvedVisa,
      originCountry: resolvedOrigin,
      destinationCountry: resolvedDestination,
      applicantName,
      additionalContext: contextWithDocs || undefined,
    });

    return sendSuccess(res, intelligence, 'Pre-document intelligence generated');
  } catch (error: any) {
    logger.error('Pre-doc requirements error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to generate requirements', 500);
  }
};

export const generateSponsorLetter = async (req: AuthRequest, res: Response) => {
  try {
    const {
      sponsorName,
      sponsorRelationship,
      sponsorOccupation,
      sponsorCountry,
      applicantName,
      visaType,
      destinationCountry,
      travelPurpose,
      travelDuration,
    } = req.body;

    if (!sponsorName || !applicantName || !destinationCountry || !visaType) {
      return sendError(res, 'validation_error', 'Required fields missing', 400);
    }

    const prompt = `Generate a professional sponsor/financial support letter for a visa application:

Sponsor Name: ${sponsorName}
Sponsor Relationship: ${sponsorRelationship}
Sponsor Occupation: ${sponsorOccupation}
Sponsor Country: ${sponsorCountry}
Applicant Name: ${applicantName}
Visa Type: ${visaType}
Destination Country: ${destinationCountry}
Travel Purpose: ${travelPurpose}
Travel Duration: ${travelDuration}

Generate a formal, professional sponsor letter tailored to ${destinationCountry}'s expected format. Include:
- Clear statement of financial support
- Relationship to applicant
- Sponsor's financial capacity
- Purpose of visit
- Duration of support
- Contact information

Return only the letter text, no JSON, no explanations.`;

    const OpenAI = (await import('openai')).default;
    const openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert immigration document writer. Generate professional sponsor letters.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1000,
    });

    const letter = response.choices[0]?.message?.content || '';

    return sendSuccess(res, { letter }, 'Sponsor letter generated');
  } catch (error: any) {
    logger.error('Sponsor letter generation error', { error: error.message });
    return sendError(res, 'ai_error', error.message || 'Failed to generate sponsor letter', 500);
  }
};


