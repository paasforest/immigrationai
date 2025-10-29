import { apiClient, ApiResponse } from './client';

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface UsageResponse {
  currentUsage: {
    documents: number;
    tokensUsed: number;
  };
  limits: {
    documents: number;
    tokensPerMonth: number;
  };
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
    stripeSubscriptionId: string | null;
  };
}

export const billingApi = {
  // Create Stripe checkout session
  async createCheckoutSession(
    plan: 'pro' | 'enterprise'
  ): Promise<ApiResponse<CheckoutSessionResponse>> {
    return apiClient.post<CheckoutSessionResponse>('/api/billing/checkout', { plan });
  },

  // Get customer portal URL
  async getPortalUrl(): Promise<ApiResponse<{ url: string }>> {
    return apiClient.get<{ url: string }>('/api/billing/portal');
  },

  // Get current usage
  async getUsage(): Promise<ApiResponse<UsageResponse>> {
    return apiClient.get<UsageResponse>('/api/billing/usage');
  },
};


