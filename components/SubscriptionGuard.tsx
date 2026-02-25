'use client';

import React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Zap, ArrowUp } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionGuardProps {
  feature: string;
  docType?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export function SubscriptionGuard({ 
  feature, 
  docType, 
  children, 
  fallback,
  showUpgrade = true 
}: SubscriptionGuardProps) {
  const { 
    plan, 
    canUseFeature, 
    canGenerateDocType, 
    hasReachedLimit, 
    getRemainingGenerations 
  } = useSubscription();

  // Check if user can use the feature
  const canUse = canUseFeature(feature);
  const canGenerate = docType ? canGenerateDocType(docType) : true;
  const hasLimit = hasReachedLimit();
  const remaining = getRemainingGenerations();

  // If user can use the feature, render children
  if (canUse && canGenerate && !hasLimit) {
    return <>{children}</>;
  }

  // If fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Lock className="w-5 h-5 text-amber-600" />
          <CardTitle className="text-lg text-amber-800">
            {hasLimit ? 'Monthly Limit Reached' : 'Upgrade Required'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasLimit ? (
          <div className="space-y-2">
            <p className="text-amber-700">
              You&apos;ve used all {plan === 'starter' ? '3' : 'your'} monthly document generations.
            </p>
            <p className="text-sm text-amber-600">
              Upgrade to Pro for unlimited generations or wait until next month.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-amber-700">
              This feature is not available in your current plan.
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                {plan === 'starter' ? 'Starter Plan' : plan === 'professional' ? 'Professional Plan' : 'Enterprise Plan'}
              </Badge>
              <span className="text-sm text-amber-600">→</span>
              <Badge className="bg-blue-600 text-white">
                Pro Plan Required
              </Badge>
            </div>
          </div>
        )}

        {showUpgrade && (
          <div className="flex space-x-3">
            <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Link href="/pricing">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                View Dashboard
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Usage indicator component
export function UsageIndicator() {
  const { plan, usage, loading, refreshUsage } = useSubscription();

  if (loading || !usage) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        <span>Loading usage...</span>
      </div>
    );
  }

  const isUnlimited = usage.limit === -1;
  const percentage = isUnlimited ? 0 : (usage.currentMonth / usage.limit) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Monthly Usage</span>
        <span className="font-medium text-gray-900">
          {isUnlimited ? 'Unlimited' : `${usage.currentMonth}/${usage.limit}`}
        </span>
      </div>
      
      {!isUnlimited && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              percentage >= 90 ? 'bg-red-500' : 
              percentage >= 70 ? 'bg-yellow-500' : 
              'bg-blue-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
      
      {!isUnlimited && usage.remaining <= 2 && (
        <div className="flex items-center space-x-1 text-xs text-amber-600">
          <Zap className="w-3 h-3" />
          <span>
            {usage.remaining === 0 ? 'Limit reached' : `${usage.remaining} remaining`}
          </span>
        </div>
      )}
    </div>
  );
}

// Feature comparison component
export function FeatureComparison() {
  const { plan } = useSubscription();
  
  const features = [
    { name: 'SOP Generation', free: true, pro: true, enterprise: true },
    { name: 'Cover Letters', free: false, pro: true, enterprise: true },
    { name: 'Document Review', free: false, pro: true, enterprise: true },
    { name: 'Unlimited Generations', free: false, pro: true, enterprise: true },
    { name: 'Document History', free: false, pro: true, enterprise: true },
    { name: 'Custom Templates', free: false, pro: true, enterprise: true },
    { name: 'API Access', free: false, pro: false, enterprise: true },
    { name: 'Team Collaboration', free: false, pro: false, enterprise: true },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Feature Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Feature</th>
              <th className="text-center py-2">Free</th>
              <th className="text-center py-2">Pro</th>
              <th className="text-center py-2">Enterprise</th>
            </tr>
          </thead>
          <tbody className="space-y-2">
            {features.map((feature, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 font-medium">{feature.name}</td>
                <td className="text-center py-2">
                  {feature.free ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-gray-400">✗</span>
                  )}
                </td>
                <td className="text-center py-2">
                  {feature.pro ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-gray-400">✗</span>
                  )}
                </td>
                <td className="text-center py-2">
                  {feature.enterprise ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-gray-400">✗</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

