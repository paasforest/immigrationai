import prisma from '../config/prisma';
import { logger } from '../utils/logger';

export interface FeedbackData {
  documentId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  documentType: string;
  country?: string;
  visaType?: string;
}

export interface ApplicationOutcomeData {
  documentId?: string;
  userId: string;
  status: 'preparing' | 'submitted' | 'interview' | 'approved' | 'rejected';
  country: string;
  visaType: string;
  outcome?: 'approved' | 'rejected' | 'pending';
  outcomeDate?: Date;
  processingTimeDays?: number;
  notes?: string;
}

// Submit document feedback
export const submitFeedback = async (data: FeedbackData) => {
  try {
    logger.info('Submitting feedback', { 
      documentType: data.documentType, 
      rating: data.rating,
      userId: data.userId 
    });

    const feedback = await prisma.documentFeedback.create({
      data: {
        documentId: data.documentId,
        userId: data.userId,
        rating: data.rating,
        comment: data.comment,
        documentType: data.documentType,
        country: data.country,
        visaType: data.visaType,
      },
    });

    logger.info('Feedback submitted successfully', { feedbackId: feedback.id });
    return feedback;
  } catch (error: any) {
    logger.error('Error submitting feedback', { error: error.message });
    throw new Error('Failed to submit feedback');
  }
};

// Update application outcome
export const updateApplicationOutcome = async (data: ApplicationOutcomeData) => {
  try {
    logger.info('Updating application outcome', { 
      status: data.status,
      country: data.country,
      visaType: data.visaType,
      userId: data.userId 
    });

    // Find existing outcome by userId, country, and visaType
    const existing = await prisma.applicationOutcome.findFirst({
      where: {
        userId: data.userId,
        country: data.country,
        visaType: data.visaType,
      },
    });

    const outcome = existing
      ? await prisma.applicationOutcome.update({
          where: { id: existing.id },
          data: {
            status: data.status,
            outcome: data.outcome,
            outcomeDate: data.outcomeDate,
            processingTimeDays: data.processingTimeDays,
            notes: data.notes,
            documentId: data.documentId,
          },
        })
      : await prisma.applicationOutcome.create({
          data: {
            userId: data.userId,
            status: data.status,
            country: data.country,
            visaType: data.visaType,
            outcome: data.outcome,
            outcomeDate: data.outcomeDate,
            processingTimeDays: data.processingTimeDays,
            notes: data.notes,
            documentId: data.documentId,
          },
        });

    logger.info('Application outcome updated successfully', { outcomeId: outcome.id });
    return outcome;
  } catch (error: any) {
    logger.error('Error updating application outcome', { error: error.message });
    throw new Error('Failed to update application outcome');
  }
};

// Get feedback analytics
export const getFeedbackAnalytics = async (documentType?: string, country?: string) => {
  try {
    const whereClause: any = {};
    if (documentType) whereClause.documentType = documentType;
    if (country) whereClause.country = country;

    const [totalFeedback, avgRating, ratingDistribution, recentFeedback] = await Promise.all([
      prisma.documentFeedback.count({ where: whereClause }),
      prisma.documentFeedback.aggregate({
        where: whereClause,
        _avg: { rating: true },
      }),
      prisma.documentFeedback.groupBy({
        by: ['rating'],
        where: whereClause,
        _count: { rating: true },
      }),
      prisma.documentFeedback.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { id: true, email: true } } },
      }),
    ]);

    return {
      totalFeedback,
      averageRating: avgRating._avg.rating || 0,
      ratingDistribution: ratingDistribution.map((r: any) => ({
        rating: r.rating,
        count: r._count.rating,
      })),
      recentFeedback,
    };
  } catch (error: any) {
    logger.error('Error getting feedback analytics', { error: error.message });
    throw new Error('Failed to get feedback analytics');
  }
};

// Get success rate analytics
export const getSuccessRateAnalytics = async (country?: string, visaType?: string) => {
  try {
    const whereClause: any = {};
    if (country) whereClause.country = country;
    if (visaType) whereClause.visaType = visaType;

    const [totalApplications, approvedCount, rejectedCount, pendingCount] = await Promise.all([
      prisma.applicationOutcome.count({ where: whereClause }),
      prisma.applicationOutcome.count({ 
        where: { ...whereClause, outcome: 'approved' } 
      }),
      prisma.applicationOutcome.count({ 
        where: { ...whereClause, outcome: 'rejected' } 
      }),
      prisma.applicationOutcome.count({ 
        where: { ...whereClause, outcome: 'pending' } 
      }),
    ]);

    const successRate = totalApplications > 0 ? (approvedCount / totalApplications) * 100 : 0;

    return {
      totalApplications,
      approvedCount,
      rejectedCount,
      pendingCount,
      successRate: Math.round(successRate * 100) / 100,
    };
  } catch (error: any) {
    logger.error('Error getting success rate analytics', { error: error.message });
    throw new Error('Failed to get success rate analytics');
  }
};

// Get user's application history
export const getUserApplicationHistory = async (userId: string) => {
  try {
    const applications = await prisma.applicationOutcome.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return applications;
  } catch (error: any) {
    logger.error('Error getting user application history', { error: error.message });
    throw new Error('Failed to get application history');
  }
};

// Get knowledge base entries
export const getKnowledgeBase = async (topic?: string) => {
  try {
    const whereClause: any = { isActive: true };
    if (topic) whereClause.topic = topic;

    const entries = await prisma.knowledgeBase.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
    });

    return entries;
  } catch (error: any) {
    logger.error('Error getting knowledge base', { error: error.message });
    throw new Error('Failed to get knowledge base');
  }
};

// Update knowledge base entry
export const updateKnowledgeBase = async (topic: string, content: string, source: string, confidence: number = 0.9) => {
  try {
    // Find existing entry by topic
    const existing = await prisma.knowledgeBase.findFirst({
      where: { topic },
    });

    const entry = existing
      ? await prisma.knowledgeBase.update({
          where: { id: existing.id },
          data: {
            content,
            source,
            confidence,
            lastVerified: new Date(),
          },
        })
      : await prisma.knowledgeBase.create({
          data: {
            topic,
            content,
            source,
            confidence,
            lastVerified: new Date(),
          },
        });

    logger.info('Knowledge base updated', { topic, source });
    return entry;
  } catch (error: any) {
    logger.error('Error updating knowledge base', { error: error.message });
    throw new Error('Failed to update knowledge base');
  }
};
