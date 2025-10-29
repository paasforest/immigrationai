'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, ArrowRight, Star, Calendar, DollarSign, Building, CreditCard } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function PricingPage() {
  const { user, loading } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

  // Redirect to login if user is not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth/login';
    }
  }, [user, loading]);

  const handleUpgrade = async (plan: string, paymentMethod: string) => {
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }

    setIsUpgrading(plan);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          plan,
          billingCycle,
          paymentMethod,
          firstName: user.full_name?.split(' ')[0] || 'User',
          lastName: user.full_name?.split(' ').slice(1).join(' ') || 'Name',
        }),
      });

      // Handle authentication errors
      if (response.status === 401) {
        // Token expired or invalid, clear tokens and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        alert('Your session has expired. Please log in again.');
        window.location.href = '/auth/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Redirect to payment instructions page with account number
        window.location.href = `/payment/instructions?account_number=${data.data.accountNumber}&plan=${plan}&billing=${billingCycle}`;
      } else {
        console.error('Payment creation failed:', data);
        alert(`Failed to create payment: ${data.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert(`Failed to upgrade: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsUpgrading(null);
    }
  };

  const plans = [
    {
      name: 'Starter',
      id: 'starter',
      monthlyPrice: 149,
      annualPrice: 1490,
      description: 'Perfect for individuals getting started',
      features: [
        '3 document generations/month',
        'Basic SOP templates',
        'PDF export',
        'Email support'
      ],
      popular: false,
    },
    {
      name: 'Entry',
      id: 'entry',
      monthlyPrice: 299,
      annualPrice: 2990,
      description: 'For serious applicants',
      features: [
        '5 document generations/month',
        'Cover letter generation',
        'SOP reviewer',
        'IELTS practice',
        'Priority support'
      ],
      popular: true,
    },
    {
      name: 'Professional',
      id: 'professional',
      monthlyPrice: 699,
      annualPrice: 6990,
      description: 'For agents and consultants',
      features: [
        'Unlimited document generations',
        'All document types',
        'Mock interviews',
        'Advanced analytics',
        'Custom templates',
        'Priority support'
      ],
      popular: false,
    },
    {
      name: 'Enterprise',
      id: 'enterprise',
      monthlyPrice: 1499,
      annualPrice: 14990,
      description: 'For large agencies',
      features: [
        'Everything in Professional',
        'Team management',
        'Bulk processing',
        'Advanced analytics',
        'API access',
        'Dedicated support'
      ],
      popular: false,
    }
  ];

  const getCurrentPrice = (plan: any) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const getSavings = (plan: any) => {
    if (billingCycle === 'monthly') return 0;
    const monthlyTotal = plan.monthlyPrice * 12;
    const annualPrice = plan.annualPrice;
    return monthlyTotal - annualPrice;
  };

  const getSavingsPercentage = (plan: any) => {
    if (billingCycle === 'monthly') return 0;
    const monthlyTotal = plan.monthlyPrice * 12;
    const annualPrice = plan.annualPrice;
    return Math.round(((monthlyTotal - annualPrice) / monthlyTotal) * 100);
  };

  const isCurrentPlan = (planId: string) => user?.subscriptionPlan === planId;
  const canUpgrade = (planId: string) => {
    const planOrder = ['starter', 'entry', 'professional', 'enterprise'];
    const currentIndex = planOrder.indexOf(user?.subscriptionPlan || 'starter');
    const targetIndex = planOrder.indexOf(planId);
    return targetIndex > currentIndex;
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600">
            <ArrowRight className="w-5 h-5 rotate-180" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Select the perfect plan for your immigration journey. Save up to 17% with annual billing.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
            </span>
            {billingCycle === 'annual' && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Save up to 17%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200'
              } ${isCurrentPlan(plan.id) ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {isCurrentPlan(plan.id) && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-green-500 text-white">
                    <Check className="w-3 h-3 mr-1" />
                    Current
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    R{getCurrentPrice(plan).toLocaleString()}
                  </span>
                  <span className="text-gray-600 ml-2">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                
                {billingCycle === 'annual' && getSavings(plan) > 0 && (
                  <div className="text-sm text-green-600 font-medium">
                    Save R{getSavings(plan).toLocaleString()} ({getSavingsPercentage(plan)}% off)
                  </div>
                )}
                
                <p className="text-gray-600 text-sm">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Features included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Payment Methods */}
                <div className="pt-4 space-y-3">
                  {isCurrentPlan(plan.id) ? (
                    <Button 
                      disabled 
                      className="w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : canUpgrade(plan.id) ? (
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleUpgrade(plan.id, 'bank_transfer')}
                        disabled={isUpgrading === plan.id}
                        className={`w-full ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:shadow-lg' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {isUpgrading === plan.id ? (
                          <>
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Building className="w-4 h-4 mr-2" />
                            Get Payment Details
                          </>
                        )}
                      </Button>
                      
                      <div className="text-center text-xs text-gray-500">
                        Direct bank transfer (Zero fees)
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = '/contact'}
                    >
                      Contact Sales
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  What's the difference between monthly and annual billing?
                </h3>
                <p className="text-gray-600">
                  Annual billing offers the same features as monthly billing but with up to 17% savings. 
                  You pay once per year instead of monthly, and your subscription automatically renews.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I switch between monthly and annual billing?
                </h3>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your billing cycle at any time through your account dashboard.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  What happens if I cancel my subscription?
                </h3>
                <p className="text-gray-600">
                  You can cancel anytime. Your subscription will remain active until the end of your current billing period.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Do you offer refunds?
                </h3>
                <p className="text-gray-600">
                  We offer a 30-day money-back guarantee for all new subscriptions. Contact support for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}