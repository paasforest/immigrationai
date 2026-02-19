import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Define tier limits based on your landing page promises
export interface TierLimits {
  visaChecksPerMonth: number;
  documentGenerationsPerMonth: number;
  documentTypesAllowed: string[];
  interviewSessionsPerMonth: number;
  englishTestSessionsPerMonth: number;
  featuresAllowed: string[];
}

export const TIER_LIMITS: Record<string, TierLimits> = {
  // Marketing Test Plan - Limited features for 1-month testing period
  marketing_test: {
    visaChecksPerMonth: -1, // unlimited for testing
    documentGenerationsPerMonth: -1, // unlimited for testing
    documentTypesAllowed: ['sop', 'review', 'checklist'],
    interviewSessionsPerMonth: 0,
    englishTestSessionsPerMonth: 0,
    featuresAllowed: ['sop_generation', 'sop_reviewer', 'visa_eligibility_check', 'ai_chat', 'checklist', 'pdf_export'],
  },
  starter: {
    visaChecksPerMonth: 3,
    documentGenerationsPerMonth: 3,
    documentTypesAllowed: ['sop', 'cover_letter'],
    interviewSessionsPerMonth: 0,
    englishTestSessionsPerMonth: 0,
    featuresAllowed: ['sop_generation', 'cover_letter', 'pdf_export'],
  },
  entry: {
    visaChecksPerMonth: 10,
    documentGenerationsPerMonth: 5,
    documentTypesAllowed: ['sop', 'cover_letter', 'review', 'checklist'],
    interviewSessionsPerMonth: 5,
    englishTestSessionsPerMonth: 5,
    featuresAllowed: ['sop_generation', 'cover_letter', 'sop_reviewer', 'application_form_checker', 'ielts_practice', 'interview_practice', 'pdf_export'],
  },
  professional: {
    visaChecksPerMonth: -1, // unlimited
    documentGenerationsPerMonth: -1, // unlimited
    documentTypesAllowed: ['sop', 'cover_letter', 'review', 'checklist', 'email', 'support_letter', 'travel_history', 'financial_letter', 'purpose_of_visit'],
    interviewSessionsPerMonth: -1, // unlimited
    englishTestSessionsPerMonth: -1, // unlimited
    featuresAllowed: ['sop_generation', 'cover_letter', 'sop_reviewer', 'checklist', 'email_template', 'support_letter', 'travel_history', 'financial_letter', 'purpose_of_visit', 'financial_calculator', 'bank_analyzer', 'document_authenticity', 'application_form_checker', 'visa_rejection_analyzer', 'reapplication_strategy', 'document_consistency_checker', 'student_visa_package', 'interview_practice', 'all_english_tests', 'pdf_export', 'document_history', 'custom_templates', 'ai_analysis', 'mock_interviews', 'analytics'],
  },
  enterprise: {
    visaChecksPerMonth: -1, // unlimited
    documentGenerationsPerMonth: -1, // unlimited
    documentTypesAllowed: ['sop', 'cover_letter', 'review', 'checklist', 'email', 'support_letter', 'travel_history', 'financial_letter', 'purpose_of_visit', 'custom'],
    interviewSessionsPerMonth: -1, // unlimited
    englishTestSessionsPerMonth: -1, // unlimited
    featuresAllowed: ['all'], // everything
  },
};

// Usage tracking interface
export interface UserUsage {
  visaChecks: number;
  documentGenerations: number;
  interviewSessions: number;
  englishTestSessions: number;
}

// Get current month usage for a user
export async function getUserMonthlyUsage(userId: string): Promise<UserUsage> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  try {
    // Get visa checks this month
    const visaChecksResult = await query(
      `SELECT COUNT(*) as count FROM api_usage 
       WHERE user_id = $1 AND timestamp >= $2 AND feature = 'visa_eligibility_check'`,
      [userId, monthStart]
    );
    
    // Get document generations this month
    const docGenResult = await query(
      `SELECT COUNT(*) as count FROM api_usage 
       WHERE user_id = $1 AND timestamp >= $2 
       AND feature IN ('sop_generation', 'cover_letter_generation', 'review_sop', 'document_generation')`,
      [userId, monthStart]
    );
    
    // Get interview sessions this month
    const interviewResult = await query(
      `SELECT COUNT(*) as count FROM api_usage 
       WHERE user_id = $1 AND timestamp >= $2 AND feature = 'interview_practice'`,
      [userId, monthStart]
    );
    
    // Get English test sessions this month
    const englishTestResult = await query(
      `SELECT COUNT(*) as count FROM api_usage 
       WHERE user_id = $1 AND timestamp >= $2 AND feature = 'english_test_practice'`,
      [userId, monthStart]
    );
    
    return {
      visaChecks: parseInt(visaChecksResult.rows[0]?.count || '0'),
      documentGenerations: parseInt(docGenResult.rows[0]?.count || '0'),
      interviewSessions: parseInt(interviewResult.rows[0]?.count || '0'),
      englishTestSessions: parseInt(englishTestResult.rows[0]?.count || '0'),
    };
  } catch (error) {
    logger.error('Failed to get user monthly usage:', error);
    return {
      visaChecks: 0,
      documentGenerations: 0,
      interviewSessions: 0,
      englishTestSessions: 0,
    };
  }
}

// Check if user can access a feature
export async function canAccessFeature(
  userId: string,
  featureName: string,
  documentType?: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    // Get user's plan and status
    const userResult = await query(
      'SELECT subscription_plan, subscription_status FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return { allowed: false, reason: 'User not found' };
    }
    
    const plan = userResult.rows[0].subscription_plan;
    const status = userResult.rows[0].subscription_status;
    
    // CRITICAL: Block access if subscription is not active
    if (status !== 'active') {
      return { 
        allowed: false, 
        reason: 'Please complete payment to activate your account. Upload your payment proof or contact support for assistance.' 
      };
    }
    
    const tierLimits = TIER_LIMITS[plan] || TIER_LIMITS.starter;
    
    // Check if feature is allowed in this tier
    if (tierLimits.featuresAllowed.includes('all')) {
      // Enterprise has all features
    } else if (!tierLimits.featuresAllowed.includes(featureName)) {
      return {
        allowed: false,
        reason: `Feature '${featureName}' not available in ${plan} plan. Please upgrade your plan.`,
      };
    }
    
    // Check document type access
    if (documentType && !tierLimits.documentTypesAllowed.includes('all')) {
      if (!tierLimits.documentTypesAllowed.includes(documentType)) {
        return {
          allowed: false,
          reason: `Document type '${documentType}' not available in ${plan} plan. Please upgrade your plan.`,
        };
      }
    }
    
    // Get current usage
    const usage = await getUserMonthlyUsage(userId);
    
    // Check visa checks limit
    if (featureName === 'visa_eligibility_check') {
      if (tierLimits.visaChecksPerMonth !== -1 && usage.visaChecks >= tierLimits.visaChecksPerMonth) {
        return {
          allowed: false,
          reason: `Monthly visa eligibility check limit (${tierLimits.visaChecksPerMonth}) exceeded. Please upgrade to access unlimited checks.`,
        };
      }
    }
    
    // Check document generations limit
    if (featureName === 'sop_generation' || featureName === 'cover_letter_generation' || 
        featureName === 'review_sop' || featureName === 'document_generation') {
      if (tierLimits.documentGenerationsPerMonth !== -1 && 
          usage.documentGenerations >= tierLimits.documentGenerationsPerMonth) {
        return {
          allowed: false,
          reason: `Monthly document generation limit (${tierLimits.documentGenerationsPerMonth}) exceeded. Please upgrade your plan.`,
        };
      }
    }
    
    // Check interview sessions limit
    if (featureName === 'interview_practice') {
      if (tierLimits.interviewSessionsPerMonth !== -1 && 
          usage.interviewSessions >= tierLimits.interviewSessionsPerMonth) {
        return {
          allowed: false,
          reason: `Monthly interview practice limit (${tierLimits.interviewSessionsPerMonth}) exceeded. Please upgrade to Professional for unlimited practice.`,
        };
      }
    }
    
    // Check English test sessions limit
    if (featureName === 'english_test_practice') {
      if (tierLimits.englishTestSessionsPerMonth !== -1 && 
          usage.englishTestSessions >= tierLimits.englishTestSessionsPerMonth) {
        return {
          allowed: false,
          reason: `Monthly English test practice limit (${tierLimits.englishTestSessionsPerMonth}) exceeded. Please upgrade to Professional for unlimited practice.`,
        };
      }
    }
    
    return { allowed: true };
  } catch (error: any) {
    logger.error('Failed to check feature access:', error);
    return { allowed: false, reason: 'Failed to verify feature access' };
  }
}

// Get user's remaining usage
export async function getRemainingUsage(userId: string): Promise<{
  visaChecks: { used: number; limit: number; remaining: number };
  documentGenerations: { used: number; limit: number; remaining: number };
  interviewSessions: { used: number; limit: number; remaining: number };
  englishTestSessions: { used: number; limit: number; remaining: number };
}> {
  try {
    const userResult = await query(
      'SELECT subscription_plan FROM users WHERE id = $1',
      [userId]
    );
    
    const plan = userResult.rows[0]?.subscription_plan || 'starter';
    const tierLimits = TIER_LIMITS[plan] || TIER_LIMITS.starter;
    const usage = await getUserMonthlyUsage(userId);
    
    return {
      visaChecks: {
        used: usage.visaChecks,
        limit: tierLimits.visaChecksPerMonth,
        remaining: tierLimits.visaChecksPerMonth === -1 ? -1 : Math.max(0, tierLimits.visaChecksPerMonth - usage.visaChecks),
      },
      documentGenerations: {
        used: usage.documentGenerations,
        limit: tierLimits.documentGenerationsPerMonth,
        remaining: tierLimits.documentGenerationsPerMonth === -1 ? -1 : Math.max(0, tierLimits.documentGenerationsPerMonth - usage.documentGenerations),
      },
      interviewSessions: {
        used: usage.interviewSessions,
        limit: tierLimits.interviewSessionsPerMonth,
        remaining: tierLimits.interviewSessionsPerMonth === -1 ? -1 : Math.max(0, tierLimits.interviewSessionsPerMonth - usage.interviewSessions),
      },
      englishTestSessions: {
        used: usage.englishTestSessions,
        limit: tierLimits.englishTestSessionsPerMonth,
        remaining: tierLimits.englishTestSessionsPerMonth === -1 ? -1 : Math.max(0, tierLimits.englishTestSessionsPerMonth - usage.englishTestSessions),
      },
    };
  } catch (error) {
    logger.error('Failed to get remaining usage:', error);
    throw error;
  }
}

