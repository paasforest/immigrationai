'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  priceAnnual: number;
  currency: string;
  popular?: boolean;
  features: string[];
}

interface PricingPlansProps {
  plans: Plan[];
  currentPlan?: string;
  onSelectPlan: (planId: string, billingCycle: 'monthly' | 'annual') => void;
}

export default function PricingPlans({ plans, currentPlan, onSelectPlan }: PricingPlansProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const getButtonText = (planId: string) => {
    if (currentPlan === planId) {
      return 'Current Plan';
    }
    const planIndex = plans.findIndex((p) => p.id === planId);
    const currentIndex = plans.findIndex((p) => p.id === currentPlan);
    if (planIndex > currentIndex) {
      return `Upgrade to ${plans[planIndex].name}`;
    }
    return `Switch to ${plans[planIndex].name}`;
  };

  const getButtonVariant = (planId: string) => {
    if (currentPlan === planId) {
      return 'outline' as const;
    }
    const planIndex = plans.findIndex((p) => p.id === planId);
    const currentIndex = plans.findIndex((p) => p.id === currentPlan);
    if (planIndex > currentIndex) {
      return 'default' as const;
    }
    return 'outline' as const;
  };

  return (
    <div className="space-y-6">
      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm ${billingCycle === 'monthly' ? 'font-semibold' : 'text-gray-500'}`}>
          Monthly
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F2557] focus:ring-offset-2"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm ${billingCycle === 'annual' ? 'font-semibold' : 'text-gray-500'}`}>
          Annual
          <span className="ml-1 text-xs text-green-600">(Save 20%)</span>
        </span>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = billingCycle === 'annual' ? plan.priceAnnual : plan.price;
          const isCurrent = currentPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? 'border-2 border-amber-400 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">R{price.toLocaleString()}</span>
                  <span className="text-gray-600 ml-2">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => onSelectPlan(plan.id, billingCycle)}
                  variant={getButtonVariant(plan.id)}
                  className={`w-full ${
                    getButtonVariant(plan.id) === 'default'
                      ? 'bg-[#0F2557] hover:bg-[#0a1d42]'
                      : ''
                  }`}
                  disabled={isCurrent}
                >
                  {getButtonText(plan.id)}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
