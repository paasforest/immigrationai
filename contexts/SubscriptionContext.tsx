'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  SubscriptionPlan, 
  SubscriptionStatus, 
  UsageStats, 
  calculateUsageStats,
  hasFeature,
  canGenerateDocument,
  isUnlimited,
  SUBSCRIPTION_PLANS 
} from '@/lib/subscription';

interface SubscriptionContextType {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  usage: UsageStats | null;
  loading: boolean;
  refreshUsage: () => Promise<void>;
  canUseFeature: (feature: string) => boolean;
  canGenerateDocType: (docType: string) => boolean;
  hasReachedLimit: () => boolean;
  getRemainingGenerations: () => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<SubscriptionPlan>('free');
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Load subscription data when user changes
  useEffect(() => {
    if (user) {
      setPlan(user.subscription_plan as SubscriptionPlan);
      setStatus(user.subscription_status as SubscriptionStatus);
      loadUsage();
    } else {
      setPlan('free');
      setStatus('active');
      setUsage(null);
      setLoading(false);
    }
  }, [user]);

  const loadUsage = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/billing/usage', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsage(calculateUsageStats(data.data.currentMonth, plan));
        }
      }
    } catch (error) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUsage = async () => {
    await loadUsage();
  };

  const canUseFeature = (feature: string): boolean => {
    return hasFeature(plan, feature);
  };

  const canGenerateDocType = (docType: string): boolean => {
    return canGenerateDocument(plan, docType);
  };

  const hasReachedLimit = (): boolean => {
    if (isUnlimited(plan)) return false;
    if (!usage) return false;
    return usage.remaining <= 0;
  };

  const getRemainingGenerations = (): number => {
    if (isUnlimited(plan)) return -1;
    if (!usage) return SUBSCRIPTION_PLANS[plan].monthlyGenerations;
    return usage.remaining;
  };

  const value: SubscriptionContextType = {
    plan,
    status,
    usage,
    loading,
    refreshUsage,
    canUseFeature,
    canGenerateDocType,
    hasReachedLimit,
    getRemainingGenerations,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

