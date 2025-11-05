'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Loader2, Check, Star, Zap, Crown } from 'lucide-react';
import { getTrackingDataForConversion } from '@/lib/utm-tracker';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    subscriptionPlan: 'starter', // Default plan
  });
  const [currentStep, setCurrentStep] = useState(1); // 1: Plan selection, 2: Account details

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'R149',
      period: '/month',
      description: 'Perfect for individuals getting started',
      features: ['3 document checks/month', 'Basic SOP generator', 'Email support'],
      icon: <Check className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
      popular: false
    },
    {
      id: 'entry',
      name: 'Entry',
      price: 'R299',
      period: '/month',
      description: 'For serious applicants',
      features: ['5 document types', 'IELTS practice', 'Priority support'],
      icon: <Star className="w-5 h-5" />,
      color: 'from-green-500 to-green-600',
      popular: true
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 'R699',
      period: '/month',
      description: 'For agents and consultants',
      features: ['Unlimited documents', 'All features', 'Mock interviews', 'Analytics'],
      icon: <Zap className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600',
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'R1,499',
      period: '/month',
      description: 'For large agencies',
      features: ['Team management', 'Bulk processing', 'Advanced analytics', 'Dedicated support'],
      icon: <Crown className="w-5 h-5" />,
      color: 'from-amber-500 to-orange-600',
      popular: false
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setFormData({ ...formData, subscriptionPlan: planId });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    // Capture UTM tracking data for attribution
    const trackingData = getTrackingDataForConversion();

    const result = await signup({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName || undefined,
      subscriptionPlan: formData.subscriptionPlan,
      // Include tracking data
      tracking: trackingData,
    });

    if (result.success) {
      // Log successful signup with UTM attribution
      if (trackingData.utm_source) {
        console.log('📊 Signup attributed to:', trackingData.utm_source);
      }
      router.push('/dashboard');
    } else {
      setError(result.error || 'Signup failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Immigration AI
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentStep === 1 ? 'Choose Your Plan' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 
                ? 'Select the plan that best fits your needs' 
                : 'Complete your account setup'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 ? (
              // Plan Selection Step
              <div className="space-y-4">
                <div className="grid gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.subscriptionPlan === plan.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${plan.popular ? 'ring-2 ring-green-500' : ''}`}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 bg-gradient-to-r ${plan.color} rounded-lg flex items-center justify-center text-white`}>
                            {plan.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{plan.name}</h3>
                            <p className="text-sm text-gray-600">{plan.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{plan.price}</div>
                          <div className="text-sm text-gray-500">{plan.period}</div>
                        </div>
                      </div>
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Continue to Account Setup
                </Button>
              </div>
            ) : (
              // Account Details Step
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Selected Plan:</strong> {plans.find(p => p.id === formData.subscriptionPlan)?.name} - {plans.find(p => p.id === formData.subscriptionPlan)?.price}/month
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Must be at least 8 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </form>
            )}

            <div className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>

            <p className="text-xs text-gray-500 text-center mt-2">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}


