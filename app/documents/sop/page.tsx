'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
// import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Sparkles, Copy, Download, Brain, Loader, Crown, Lock, Zap } from 'lucide-react';
import FeedbackWidget from '@/components/FeedbackWidget';
import SuccessTracker from '@/components/SuccessTracker';
import PDFDownload from '@/components/PDFDownload';
import { SubscriptionGuard, UsageIndicator } from '@/components/SubscriptionGuard';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function SOPGeneratorPage() {
  const router = useRouter();
  const { user } = useAuth();
  // Get user's subscription plan from auth context
  const plan = user?.subscriptionPlan || 'starter';
  const [usage, setUsage] = useState({ current: 0, limit: -1, remaining: -1 }); // Start with unlimited for enterprise
  const [loadingUsage, setLoadingUsage] = useState(true);

  // Load user usage data
  React.useEffect(() => {
    if (user) {
      loadUsage();
    }
  }, [user]);

  const loadUsage = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/billing/usage`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const { currentUsage, limits } = data.data;
          setUsage({
            current: currentUsage.documents,
            limit: limits.documents === -1 ? -1 : limits.documents, // -1 means unlimited
            remaining: limits.documents === -1 ? -1 : Math.max(0, limits.documents - currentUsage.documents) // -1 means unlimited
          });
        }
      }
    } catch (error) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  const hasReachedLimit = () => usage.remaining === 0; // Only block if exactly 0, not if -1 (unlimited)
  const getRemainingGenerations = () => usage.remaining;
  const canUseFeature = (feature: string) => {
    // Basic feature access based on plan
    if (feature === 'basic_sop') return true; // All plans can generate SOPs
    if (feature === 'advanced_sop') return ['professional', 'enterprise'].includes(plan);
    if (feature === 'cover_letter') return ['entry', 'professional', 'enterprise'].includes(plan);
    if (feature === 'sop_reviewer') return ['entry', 'professional', 'enterprise'].includes(plan);
    return false;
  };
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSOP, setGeneratedSOP] = useState('');
  const [sopScore, setSOPScore] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    currentCountry: '',
    targetCountry: '',
    purpose: 'study',
    institution: '',
    program: '',
    background: '',
    motivation: '',
    careerGoals: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateSOP = async () => {
    if (!formData.fullName || !formData.targetCountry || !formData.institution) {
      alert('Please fill in required fields: Full Name, Target Country, and Institution');
      return;
    }

    // Check subscription limits (only for limited plans)
    if (hasReachedLimit() && usage.limit !== -1) {
      alert(`You have reached your monthly generation limit (${usage.limit} documents). Please upgrade your plan to continue.`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-sop`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedSOP(data.data.sop);
        // Refresh usage after successful generation
        await loadUsage();
      } else {
        if (data.error === 'PLAN_REQUIRED' || data.error === 'Limit exceeded') {
          alert(`This feature requires a higher plan. Current plan: ${plan}. Please upgrade to continue.`);
        } else {
          alert(data.message || 'Failed to generate SOP');
        }
      }
    } catch (error) {
      console.error('Error generating SOP:', error);
      alert('Failed to generate SOP. Please check your OpenAI API key in backend .env');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeSOP = async () => {
    if (!generatedSOP) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-sop`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ text: generatedSOP }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSOPScore(data.data.analysis.score);
      }
    } catch (error) {
      console.error('Error analyzing SOP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSOP);
    alert('Copied to clipboard!');
  };

  const downloadSOP = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedSOP], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'statement-of-purpose.txt';
    element.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <span>AI SOP Generator</span>
          </h1>
          <p className="text-gray-600">Create a compelling Statement of Purpose tailored to your profile</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Country</label>
                  <Input
                    name="currentCountry"
                    value={formData.currentCountry}
                    onChange={handleInputChange}
                    placeholder="India"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Country *</label>
                  <select
                    name="targetCountry"
                    value={formData.targetCountry}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="select_country">Select...</option>
                    <option value="USA">USA</option>
                    <option value="Canada">Canada</option>
                    <option value="UK">UK</option>
                    <option value="Germany">Germany</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="study">Study</option>
                    <option value="work">Work</option>
                    <option value="immigration">Immigration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.purpose === 'work' ? 'Company Name *' : formData.purpose === 'immigration' ? 'Company/Institution *' : 'Institution/University *'}
                </label>
                <Input
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  placeholder={
                    formData.purpose === 'work' 
                      ? 'Google Inc.' 
                      : formData.purpose === 'immigration'
                      ? 'ABC Corporation or University Name'
                      : 'Massachusetts Institute of Technology'
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.purpose === 'work' ? 'Job Title/Position' : formData.purpose === 'immigration' ? 'Position/Role' : 'Program/Degree'}
                </label>
                <Input
                  name="program"
                  value={formData.program}
                  onChange={handleInputChange}
                  placeholder={
                    formData.purpose === 'work' 
                      ? 'Software Engineer'
                      : formData.purpose === 'immigration'
                      ? 'Product Manager'
                      : 'Masters Degree in Computer Science'
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.purpose === 'work' ? 'Professional Background' : formData.purpose === 'immigration' ? 'Personal & Professional Background' : 'Academic Background'}
                </label>
                <Textarea
                  name="background"
                  value={formData.background}
                  onChange={handleInputChange}
                  placeholder={
                    formData.purpose === 'work' 
                      ? 'Describe your education, work experience, technical skills, achievements...'
                      : formData.purpose === 'immigration'
                      ? 'Describe your personal journey, education, work experience, skills, and achievements...'
                      : 'Describe your education, academic achievements, research experience...'
                  }
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.purpose === 'work' ? 'Why This Role' : formData.purpose === 'immigration' ? 'Immigration Motivation' : 'Why This Program'}
                </label>
                <Textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  placeholder={
                    formData.purpose === 'work' 
                      ? 'Why this company? What attracts you to this role?'
                      : formData.purpose === 'immigration'
                      ? 'Why are you immigrating? What motivates this move?'
                      : 'Why this program? What attracts you?'
                  }
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.purpose === 'work' ? 'Future Plans' : formData.purpose === 'immigration' ? 'Future Goals' : 'Career Goals'}
                </label>
                <Textarea
                  name="careerGoals"
                  value={formData.careerGoals}
                  onChange={handleInputChange}
                  placeholder={
                    formData.purpose === 'work' 
                      ? 'How this role aligns with your career aspirations and future plans'
                      : formData.purpose === 'immigration'
                      ? 'What are your goals after immigration? How will this move help you achieve them?'
                      : 'Short-term and long-term objectives'
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                {/* Usage Indicator */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-900">Monthly Usage</h4>
                    <span className="text-sm text-blue-600 capitalize">{plan} Plan</span>
                  </div>
                  
                  {loadingUsage ? (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                      <span>Loading usage...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-700">Documents Generated</span>
                        <span className="font-medium text-blue-900">
                          {usage.current}/{usage.limit === -1 ? 'Unlimited' : usage.limit}
                        </span>
                      </div>
                      
                      {usage.limit !== -1 && (
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              usage.remaining <= 1 ? 'bg-red-500' : 
                              usage.remaining <= 2 ? 'bg-yellow-500' : 
                              'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min((usage.current / usage.limit) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                      
                      {usage.remaining <= 2 && usage.limit !== -1 && (
                        <div className="flex items-center space-x-1 text-xs text-amber-600">
                          <Zap className="w-3 h-3" />
                          <span>
                            {usage.remaining === 0 ? 'Limit reached' : `${usage.remaining} remaining`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Generate Button */}
                <Button
                  onClick={handleGenerateSOP}
                  disabled={isLoading || (hasReachedLimit() && usage.limit !== -1)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      AI is writing your SOP...
                    </>
                  ) : hasReachedLimit() ? (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Monthly Limit Reached
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate SOP with AI
                      {usage.limit !== -1 && (
                        <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                          {getRemainingGenerations()} left
                        </span>
                      )}
                    </>
                  )}
                </Button>

                {/* Upgrade Prompt for Starter Plan */}
                {plan === 'starter' && usage.remaining <= 1 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-amber-800">
                        Upgrade to Entry plan (R299/month) for 5 documents/month
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generated SOP */}
          <Card className="lg:sticky lg:top-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated SOP</CardTitle>
                {generatedSOP && (
                  <div className="flex space-x-2">
                    <button onClick={copyToClipboard} className="p-2 hover:bg-gray-100 rounded-lg" title="Copy">
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={downloadSOP} className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={handleAnalyzeSOP} className="p-2 hover:bg-gray-100 rounded-lg" title="Analyze">
                      <Brain className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {sopScore && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-green-900">AI Quality Score</span>
                    <span className="text-2xl font-bold text-green-600">{sopScore.overall}/100</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Clarity</span>
                      <span className="font-medium">{sopScore.clarity}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Structure</span>
                      <span className="font-medium">{sopScore.structure}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Persuasiveness</span>
                      <span className="font-medium">{sopScore.persuasiveness}/100</span>
                    </div>
                  </div>
                </div>
              )}

              {generatedSOP ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6 max-h-[600px] overflow-y-auto border border-gray-200">
                    <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{generatedSOP}</p>
                  </div>
                  
                  {/* Download Options */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <PDFDownload
                      content={generatedSOP}
                      filename={`SOP_${formData.targetCountry || 'general'}_${formData.purpose || 'study'}_${new Date().toISOString().split('T')[0]}.pdf`}
                      title="Statement of Purpose"
                      className="flex-1"
                    />
                    <Button
                      onClick={downloadSOP}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download TXT
                    </Button>
                  </div>
                  
                  {/* Feedback Widget */}
                  <FeedbackWidget
                    documentId={`sop_${Date.now()}`}
                    documentType="sop"
                    country={formData.targetCountry}
                    visaType={formData.purpose}
                  />
                  
                  {/* Success Tracker */}
                  <SuccessTracker
                    documentId={`sop_${Date.now()}`}
                    country={formData.targetCountry}
                    visaType={formData.purpose}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No SOP Generated Yet</h4>
                  <p className="text-gray-600 text-sm">Fill the form and click "Generate SOP with AI"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


