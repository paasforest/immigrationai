import { Request, Response } from 'express';
import { 
  submitFeedback, 
  updateApplicationOutcome, 
  getFeedbackAnalytics,
  getSuccessRateAnalytics,
  getUserApplicationHistory,
  getKnowledgeBase,
  updateKnowledgeBase
} from '../services/feedbackService';
import { sendSuccess, sendError } from '../utils/helpers';
import { logger } from '../utils/logger';

// Submit document feedback
export const submitDocumentFeedback = async (req: Request, res: Response) => {
  try {
    const { documentId, rating, comment, documentType, country, visaType } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendError(res, 'auth_error', 'Authentication required', 401);
    }

    if (!documentId || !rating || !documentType) {
      return sendError(res, 'validation_error', 'Required fields: documentId, rating, documentType', 400);
    }

    if (rating < 1 || rating > 5) {
      return sendError(res, 'validation_error', 'Rating must be between 1 and 5', 400);
    }

    const feedback = await submitFeedback({
      documentId,
      userId,
      rating,
      comment,
      documentType,
      country,
      visaType,
    });

    return sendSuccess(res, feedback, 'Feedback submitted successfully');
  } catch (error: any) {
    logger.error('Feedback submission error', { error: error.message });
    return sendError(res, 'feedback_error', error.message || 'Failed to submit feedback', 500);
  }
};

// Update application outcome
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { documentId, status, country, visaType, outcome, outcomeDate, processingTimeDays, notes } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendError(res, 'auth_error', 'Authentication required', 401);
    }

    if (!status || !country || !visaType) {
      return sendError(res, 'validation_error', 'Required fields: status, country, visaType', 400);
    }

    const validStatuses = ['preparing', 'submitted', 'interview', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 'validation_error', 'Invalid status', 400);
    }

    const applicationOutcome = await updateApplicationOutcome({
      documentId,
      userId,
      status: status as any,
      country,
      visaType,
      outcome: outcome as any,
      outcomeDate: outcomeDate ? new Date(outcomeDate) : undefined,
      processingTimeDays,
      notes,
    });

    return sendSuccess(res, applicationOutcome, 'Application status updated successfully');
  } catch (error: any) {
    logger.error('Application status update error', { error: error.message });
    return sendError(res, 'application_error', error.message || 'Failed to update application status', 500);
  }
};

// Get feedback analytics (admin)
export const getFeedbackStats = async (req: Request, res: Response) => {
  try {
    const { documentType, country } = req.query;

    const analytics = await getFeedbackAnalytics(
      documentType as string,
      country as string
    );

    return sendSuccess(res, analytics, 'Feedback analytics retrieved');
  } catch (error: any) {
    logger.error('Feedback analytics error', { error: error.message });
    return sendError(res, 'analytics_error', error.message || 'Failed to get feedback analytics', 500);
  }
};

// Get success rate analytics
export const getSuccessStats = async (req: Request, res: Response) => {
  try {
    const { country, visaType } = req.query;

    const analytics = await getSuccessRateAnalytics(
      country as string,
      visaType as string
    );

    return sendSuccess(res, analytics, 'Success rate analytics retrieved');
  } catch (error: any) {
    logger.error('Success rate analytics error', { error: error.message });
    return sendError(res, 'analytics_error', error.message || 'Failed to get success rate analytics', 500);
  }
};

// Get user's application history
export const getUserApplications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendError(res, 'auth_error', 'Authentication required', 401);
    }

    const applications = await getUserApplicationHistory(userId);

    return sendSuccess(res, applications, 'Application history retrieved');
  } catch (error: any) {
    logger.error('User application history error', { error: error.message });
    return sendError(res, 'application_error', error.message || 'Failed to get application history', 500);
  }
};

// Get knowledge base
export const getKnowledge = async (req: Request, res: Response) => {
  try {
    const { topic } = req.query;

    const knowledge = await getKnowledgeBase(topic as string);

    return sendSuccess(res, knowledge, 'Knowledge base retrieved');
  } catch (error: any) {
    logger.error('Knowledge base error', { error: error.message });
    return sendError(res, 'knowledge_error', error.message || 'Failed to get knowledge base', 500);
  }
};

// Update knowledge base (admin)
export const updateKnowledge = async (req: Request, res: Response) => {
  try {
    const { topic, content, source, confidence } = req.body;

    if (!topic || !content || !source) {
      return sendError(res, 'validation_error', 'Required fields: topic, content, source', 400);
    }

    const entry = await updateKnowledgeBase(topic, content, source, confidence || 0.9);

    return sendSuccess(res, entry, 'Knowledge base updated successfully');
  } catch (error: any) {
    logger.error('Knowledge base update error', { error: error.message });
    return sendError(res, 'knowledge_error', error.message || 'Failed to update knowledge base', 500);
  }
};
