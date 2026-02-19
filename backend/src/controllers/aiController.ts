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
  generateStudentVisaPackage
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


