'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, Zap, Crown, Sparkles } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  limitations: string[];
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
  target: string;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    monthlyPrice: 149,
    yearlyPrice: 1500,
    description: 'Perfect for individuals starting their immigration journey',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-600',
    target: 'Individual applicants',
    features: [
      '3 Visa Eligibility Checks per month',
      '2 Document Types (SOP, Cover Letter)',
      'PDF Downloads',
      'Basic Support',
      'Email support'
    ],
    limitations: [
      'Limited document types',
      'No AI photo analysis',
      'No relationship proof kit',
      'No interview practice tools',
      'No English test practice'
    ]
  },
  {
    id: 'entry',
    name: 'Entry Plan',
    monthlyPrice: 299,
    yearlyPrice: 3000,
    description: 'For serious applicants who need more comprehensive tools',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
    popular: true,
    target: 'Serious applicants',
    features: [
      '10 Visa Eligibility Checks per month',
      '5 Document Types (SOP, Cover Letter, Support Letter, Travel History, Financial Letter)',
      'PDF Downloads',
      'Standard Support',
      'Priority email support',
      'Basic Interview Practice (5 sessions/month)',
      'English Test Practice (IELTS only)'
    ],
    limitations: [
      'No AI photo analysis',
      'No relationship proof kit',
      'No document quality check',
      'Limited interview practice',
      'Limited English test types'
    ]
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    monthlyPrice: 699,
    yearlyPrice: 6500,
    description: 'For agents and professionals who need comprehensive tools',
    icon: <Crown className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    target: 'Agents & Professionals',
    features: [
      'Unlimited Visa Eligibility Checks',
      'All Document Types (8+ types)',
      'Relationship Proof Kit',
      'AI Photo Analysis',
      'Document Quality Check',
      'Narrative Builder',
      'Submission Package Generator',
      'Unlimited Interview Practice',
      'Full English Test Practice (IELTS, TOEFL, CELPIP)',
      'Interview Questions Database (500+ questions)',
      'Interview Response Builder',
      'Priority Support',
      'Agent Dashboard',
      'Client Management Tools'
    ],
    limitations: []
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    monthlyPrice: 1499,
    yearlyPrice: 15000,
    description: 'For large agencies with high-volume needs',
    icon: <Star className="w-6 h-6" />,
    color: 'from-amber-500 to-orange-600',
    popular: false,
    target: 'Large Agencies & Organizations',
    features: [
      'Everything in Professional',
      'Unlimited Team Members',
      'Advanced Analytics Dashboard',
      'Bulk Document Processing',
      'Priority Phone Support',
      'Dedicated Account Manager',
      'Custom Country Requirements',
      'Advanced Client Management',
      'Usage Analytics & Reports',
      'Priority Feature Requests',
      'Custom Training Sessions',
      'SLA Guarantee (99.9% uptime)',
      'Advanced Workflow Automation',
      'Multi-location Support',
      'Custom Integrations (Future)'
    ],
    limitations: []
  }
];

interface SubscriptionPlansProps {
  onSelectPlan: (planId: string, billing: 'monthly' | 'yearly') => void;
  currentPlan?: string;
}

export default function SubscriptionPlans({ onSelectPlan, currentPlan }: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    onSelectPlan(planId, billingCycle);
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getMonthlyEquivalent = (plan: SubscriptionPlan) => {
    return billingCycle === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
  };

  const getSavings = (plan: SubscriptionPlan) => {
    if (billingCycle === 'yearly') {
      const monthlyTotal = plan.monthlyPrice * 12;
      const savings = monthlyTotal - plan.yearlyPrice;
      return Math.round((savings / monthlyTotal) * 100);
    }
    return 0;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Immigration AI Plan
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Start with our Starter Plan or upgrade for more comprehensive tools
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
          </span>
          {billingCycle === 'yearly' && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Save up to 17%
            </span>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-300 hover:shadow-xl ${
              plan.popular ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''
            } ${selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>Most Popular</span>
                </div>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center text-white`}>
                {plan.icon}
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {plan.name}
              </CardTitle>
              <div className="mt-4">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">R{getPrice(plan)}</span>
                  <span className="text-gray-600 ml-2">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className="mt-1">
                    <span className="text-sm text-gray-500">
                      R{getMonthlyEquivalent(plan)}/month
                    </span>
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Save {getSavings(plan)}%
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mt-2">{plan.description}</p>
              <p className="text-sm text-gray-500 mt-1">Target: {plan.target}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  What's Included:
                </h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-5 h-5 text-orange-500 mr-2">⚠️</span>
                    Limitations:
                  </h4>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0">•</span>
                        <span className="text-gray-600 text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-3 text-lg font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                    : plan.id === 'starter'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                }`}
                disabled={currentPlan === plan.id}
              >
                {currentPlan === plan.id ? 'Current Plan' : `Choose ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">
          All plans include access to our enhanced visa eligibility checker
        </p>
        <div className="flex justify-center space-x-8 text-sm text-gray-500">
          <span>✓ Cancel anytime</span>
          <span>✓ No setup fees</span>
          <span>✓ 24/7 support</span>
        </div>
      </div>
    </div>
  );
}
