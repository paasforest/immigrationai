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
  generatePurposeOfVisit
} from '../services/aiService';
import { sendSuccess, sendError } from '../utils/helpers';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types/request';

// AI Chat Endpoint
export const chat = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return sendError(res, 'validation_error', 'Message is required', 400);
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
export const reviewSOP = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return sendError(res, 'validation_error', 'SOP text is required', 400);
    }

    if (text.length < 100) {
      return sendError(res, 'validation_error', 'SOP text too short. Minimum 100 characters required', 400);
    }

    const analysis = await analyzeSOP(text);

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
export const checkVisaEligibility = async (req: Request, res: Response) => {
  try {
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
    });

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


