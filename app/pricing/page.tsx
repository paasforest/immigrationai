'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, ArrowRight, Star, Calendar, DollarSign, Building, CreditCard, Shield, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function PricingPage() {
  const { user, loading } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Check if it's a crawler (for SEO - allow Googlebot to index)
  const [isCrawler, setIsCrawler] = React.useState(false);
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      const crawlerPatterns = [
        'Googlebot', 'bingbot', 'Slurp', 'DuckDuckBot', 
        'facebookexternalhit', 'Twitterbot', 'LinkedInBot',
        'WhatsApp', 'Applebot', 'Baiduspider', 'YandexBot'
      ];
      setIsCrawler(crawlerPatterns.some(pattern => ua.includes(pattern)));
    }
  }, []);

  // Redirect to login if user is not authenticated (but allow crawlers for SEO)
  React.useEffect(() => {
    if (!isCrawler && !loading && !user) {
      window.location.href = '/auth/login';
    }
  }, [user, loading, isCrawler]);

  // Read plan parameter from URL and pre-select plan
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const planParam = urlParams.get('plan');
      
      if (planParam) {
        const validPlans = ['starter', 'entry', 'professional', 'enterprise'];
        if (validPlans.includes(planParam.toLowerCase())) {
          setSelectedPlan(planParam.toLowerCase());
          console.log('📋 Pre-selected plan from URL:', planParam);
          
          // Scroll to the plan after a short delay
          setTimeout(() => {
            const planElement = document.getElementById(`plan-${planParam.toLowerCase()}`);
            if (planElement) {
              planElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 500);
        }
      }
    }
  }, []);

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
          firstName: user.fullName?.split(' ')[0] || 'User',
          lastName: user.fullName?.split(' ').slice(1).join(' ') || 'Name',
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
      monthlyPrice: 499,
      annualPrice: 4990,
      description: 'Perfect for solo practitioners',
      features: [
        'Up to 10 active cases',
        'Basic case management',
        'Client portal access',
        'Document uploads',
        'Task management',
        'Email support'
      ],
      popular: false,
    },
    {
      name: 'Professional',
      id: 'professional',
      monthlyPrice: 999,
      annualPrice: 9990,
      description: 'For small to medium agencies',
      features: [
        'Unlimited cases',
        'Team collaboration (up to 5 members)',
        'Automated lead routing',
        'Client messaging system',
        'Analytics dashboard',
        'Document checklists',
        'Deadline tracking',
        'Priority support'
      ],
      popular: true,
    },
    {
      name: 'Agency',
      id: 'agency',
      monthlyPrice: 1999,
      annualPrice: 19990,
      description: 'For growing agencies',
      features: [
        'Everything in Professional',
        'Unlimited team members',
        'Advanced analytics & reporting',
        'Custom branding',
        'API access',
        'Bulk case operations',
        'White-label client portal',
        'Dedicated support'
      ],
      popular: false,
    },
    {
      name: 'Enterprise',
      id: 'enterprise',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'For large organizations',
      features: [
        'Everything in Agency',
        'Custom integrations',
        'SLA guarantee (99.9% uptime)',
        'Dedicated account manager',
        'On-premise deployment options',
        'Custom training & onboarding'
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
    const planOrder = ['starter', 'professional', 'agency', 'enterprise'];
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

  // Show pricing page to crawlers even without auth, otherwise redirect logged-out users
  if (!isCrawler && !user && !loading) {
    // Will redirect via useEffect above
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // For crawlers or authenticated users, show the pricing page
  const canViewPricing = isCrawler || user;

  // For crawlers, show the pricing page content even without auth
  const showContent = isCrawler || user;

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
          
          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-8 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 flex items-center justify-center space-x-1">
                <Users className="w-6 h-6" />
                <span>1,250+</span>
              </div>
              <div className="text-xs text-gray-600">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 flex items-center justify-center space-x-1">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <span>4.8/5</span>
              </div>
              <div className="text-xs text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 flex items-center justify-center space-x-1">
                <TrendingUp className="w-6 h-6" />
                <span>5,000+</span>
              </div>
              <div className="text-xs text-gray-600">Documents Generated</div>
            </div>
          </div>

          {/* Value Comparison */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              💰 Save Thousands vs Hiring a Consultant
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-xl font-bold text-red-600 mb-1">R5,000 - R20,000</div>
                <div className="text-xs text-gray-600">Immigration Consultant</div>
                <div className="text-xs text-gray-500 mt-1">Per application</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border-2 border-blue-500">
                <div className="text-xl font-bold text-green-600 mb-1">R299 - R1,499</div>
                <div className="text-xs text-gray-600">Immigration AI</div>
                <div className="text-xs text-gray-500 mt-1">Per month (unlimited)</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-xl font-bold text-blue-600 mb-1">Save 90%+</div>
                <div className="text-xs text-gray-600">With our platform</div>
                <div className="text-xs text-gray-500 mt-1">Plus 24/7 access</div>
              </div>
            </div>
          </div>
          
          {/* Money-Back Guarantee Badge */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full px-6 py-2 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-semibold">100% Money-Back Guarantee</span>
              <span className="text-green-600 text-sm">• Not satisfied? Full refund within 7 days</span>
            </div>
          </div>

          {/* Annual Savings Banner */}
          {billingCycle === 'annual' && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">🎉</span>
                <div>
                  <div className="font-bold text-lg">Save up to 17% with Annual Plan!</div>
                  <div className="text-sm text-green-100">Get 2 months free + priority support</div>
                </div>
              </div>
            </div>
          )}

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
              id={`plan-${plan.id}`}
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200'
              } ${isCurrentPlan(plan.id) ? 'ring-2 ring-green-500' : ''} ${
                selectedPlan === plan.id ? 'ring-4 ring-purple-500 ring-offset-2' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 animate-pulse">
                    <Star className="w-3 h-3 mr-1 fill-yellow-300" />
                    Most Popular
                  </Badge>
                </div>
              )}
              {isCurrentPlan(plan.id) && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    <Check className="w-3 h-3 mr-1" />
                    Your Plan
                  </Badge>
                </div>
              )}
              
              {selectedPlan === plan.id && !isCurrentPlan(plan.id) && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1">
                    🎯 Recommended
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
                    {plan.id === 'enterprise' ? 'Custom' : `R${getCurrentPrice(plan).toLocaleString()}`}
                  </span>
                  {plan.id !== 'enterprise' && (
                    <span className="text-gray-600 ml-2">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  )}
                </div>
                
                {billingCycle === 'annual' && plan.id !== 'enterprise' && getSavings(plan) > 0 && (
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
                  ) : !user ? (
                    <div className="space-y-2">
                      <Button
                        onClick={() => window.location.href = '/auth/signup'}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Sign Up to Get Started
                      </Button>
                      <div className="text-center text-xs text-gray-500">
                        Create account to access plans
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

        {/* Pay-Per-Use Option Section */}
        <div className="max-w-2xl mx-auto mt-16 mb-16">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-center text-xl">
                💳 Need Just One Document? Try Pay-Per-Use
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">R99</div>
                <div className="text-sm text-gray-600">Per document (one-time payment)</div>
              </div>
              <p className="text-sm text-gray-700">
                Perfect if you only need one SOP or cover letter. No subscription required!
              </p>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => {
                  alert('Pay-per-use option coming soon! For now, choose a monthly plan.');
                }}
              >
                Choose Pay-Per-Use
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 text-yellow-500 mb-3">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-4 italic">
                  "Saved me R8,000 compared to hiring a consultant. Got my UK visa approved on first try!"
                </p>
                <div className="text-xs text-gray-600">
                  - Sarah M., UK Student Visa
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 text-yellow-500 mb-3">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-4 italic">
                  "The SOP generator is amazing! Created a professional document in 10 minutes. Best investment for my visa journey."
                </p>
                <div className="text-xs text-gray-600">
                  - John D., Canada Express Entry
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 text-yellow-500 mb-3">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-4 italic">
                  "Interview practice helped me so much! The AI feedback was spot-on. Highly recommend!"
                </p>
                <div className="text-xs text-gray-600">
                  - Maria K., USA H1B Visa
                </div>
              </CardContent>
            </Card>
          </div>
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
                  Yes! We offer a <strong>100% money-back guarantee within 7 days</strong> if you're not completely satisfied. 
                  No questions asked. Simply contact support for a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}