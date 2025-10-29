// Subscription Management System - South African Plans
export type SubscriptionPlan = 'starter' | 'entry' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';

export interface SubscriptionLimits {
  monthlyGenerations: number;
  documentTypes: string[];
  features: string[];
  supportLevel: 'standard' | 'priority' | 'dedicated';
  apiAccess: boolean;
  customTemplates: boolean;
  documentHistory: boolean;
  teamCollaboration: boolean;
}

export interface UsageStats {
  currentMonth: number;
  limit: number;
  remaining: number;
  resetDate: string;
}

// Subscription plan configurations - South African Plans
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionLimits> = {
  starter: {
    monthlyGenerations: 3,
    documentTypes: ['sop'],
    features: ['basic_sop', 'pdf_export', 'standard_support'],
    supportLevel: 'standard',
    apiAccess: false,
    customTemplates: false,
    documentHistory: false,
    teamCollaboration: false,
  },
  entry: {
    monthlyGenerations: 5,
    documentTypes: ['sop', 'cover_letter', 'review'],
    features: [
      'basic_sop',
      'cover_letter',
      'sop_reviewer',
      'pdf_export',
      'ielts_practice',
      'priority_support'
    ],
    supportLevel: 'priority',
    apiAccess: false,
    customTemplates: false,
    documentHistory: true,
    teamCollaboration: false,
  },
  professional: {
    monthlyGenerations: -1, // Unlimited
    documentTypes: ['sop', 'cover_letter', 'review', 'checklist'],
    features: [
      'basic_sop',
      'advanced_sop',
      'cover_letter',
      'sop_reviewer',
      'checklist_generator',
      'pdf_export',
      'document_history',
      'custom_templates',
      'priority_support',
      'ai_analysis',
      'mock_interviews',
      'analytics'
    ],
    supportLevel: 'priority',
    apiAccess: false,
    customTemplates: true,
    documentHistory: true,
    teamCollaboration: false,
  },
  enterprise: {
    monthlyGenerations: -1, // Unlimited
    documentTypes: ['sop', 'cover_letter', 'review', 'checklist', 'custom'],
    features: [
      'basic_sop',
      'advanced_sop',
      'cover_letter',
      'sop_reviewer',
      'checklist_generator',
      'pdf_export',
      'document_history',
      'custom_templates',
      'dedicated_support',
      'ai_analysis',
      'api_access',
      'team_collaboration',
      'bulk_processing',
      'advanced_analytics',
      'custom_integrations',
      'sla_guarantee'
    ],
    supportLevel: 'dedicated',
    apiAccess: true,
    customTemplates: true,
    documentHistory: true,
    teamCollaboration: true,
  },
};

// Feature access helpers
export const hasFeature = (userPlan: SubscriptionPlan, feature: string): boolean => {
  return SUBSCRIPTION_PLANS[userPlan].features.includes(feature);
};

export const canGenerateDocument = (userPlan: SubscriptionPlan, documentType: string): boolean => {
  return SUBSCRIPTION_PLANS[userPlan].documentTypes.includes(documentType);
};

export const getMonthlyLimit = (userPlan: SubscriptionPlan): number => {
  return SUBSCRIPTION_PLANS[userPlan].monthlyGenerations;
};

export const isUnlimited = (userPlan: SubscriptionPlan): boolean => {
  return SUBSCRIPTION_PLANS[userPlan].monthlyGenerations === -1;
};

// Usage tracking helpers
export const calculateUsageStats = (
  currentUsage: number,
  plan: SubscriptionPlan
): UsageStats => {
  const limit = getMonthlyLimit(plan);
  const remaining = isUnlimited(plan) ? -1 : Math.max(0, limit - currentUsage);
  
  // Calculate reset date (first day of next month)
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
  return {
    currentMonth: currentUsage,
    limit: limit,
    remaining: remaining,
    resetDate: nextMonth.toISOString().split('T')[0],
  };
};

// Plan upgrade/downgrade helpers
export const getUpgradeOptions = (currentPlan: SubscriptionPlan): SubscriptionPlan[] => {
  const planOrder: SubscriptionPlan[] = ['starter', 'entry', 'professional', 'enterprise'];
  const currentIndex = planOrder.indexOf(currentPlan);
  return planOrder.slice(currentIndex + 1);
};

export const getDowngradeOptions = (currentPlan: SubscriptionPlan): SubscriptionPlan[] => {
  const planOrder: SubscriptionPlan[] = ['starter', 'entry', 'professional', 'enterprise'];
  const currentIndex = planOrder.indexOf(currentPlan);
  return planOrder.slice(0, currentIndex);
};

// Pricing information - South African Rands
export const PLAN_PRICING = {
  starter: { price: 149, period: 'month', currency: 'ZAR' },
  entry: { price: 299, period: 'month', currency: 'ZAR' },
  professional: { price: 699, period: 'month', currency: 'ZAR' },
  enterprise: { price: 1499, period: 'month', currency: 'ZAR' },
};

// Feature descriptions for UI
export const FEATURE_DESCRIPTIONS = {
  basic_sop: 'Basic SOP generation with standard templates',
  advanced_sop: 'Advanced SOP generation with AI analysis and scoring',
  cover_letter: 'Embassy cover letter generation',
  sop_reviewer: 'AI-powered SOP review and feedback',
  checklist_generator: 'Country-specific visa document checklists',
  pdf_export: 'Export documents to PDF format',
  document_history: 'Save and access previously generated documents',
  custom_templates: 'Create and use custom document templates',
  priority_support: 'Priority email and chat support',
  dedicated_support: 'Dedicated account manager and phone support',
  ai_analysis: 'Advanced AI analysis and scoring of documents',
  api_access: 'REST API access for integrations',
  team_collaboration: 'Team workspaces and collaboration features',
  custom_integrations: 'Custom integrations with your existing systems',
  sla_guarantee: '99.9% uptime SLA guarantee',
};
