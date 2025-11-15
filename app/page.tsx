'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FileText, CheckCircle, FileCheck, List, ArrowRight, Sparkles, Globe, Shield, Zap, Menu, X, Compass, Target, AlertTriangle } from 'lucide-react';
import { getTrackingDataForConversion, trackEvent } from '@/lib/utm-tracker';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const countryOptions = [
  { value: 'uk', label: 'United Kingdom' },
  { value: 'usa', label: 'United States' },
  { value: 'canada', label: 'Canada' },
  { value: 'germany', label: 'Germany' },
  { value: 'ireland', label: 'Ireland' },
  { value: 'eu_schengen', label: 'Schengen (France, Netherlands, Italy)' },
  { value: 'uae', label: 'United Arab Emirates' },
];

const visaOptionsByCountry: Record<string, { value: string; label: string }[]> = {
  uk: [
    { value: 'uk_skilled_worker', label: 'Skilled Worker / Health & Care Worker' },
    { value: 'uk_student', label: 'Student / Graduate Route' },
    { value: 'uk_partner', label: 'Partner / Spouse / Fiancé(e)' },
    { value: 'uk_family_reunion', label: 'Family Reunion / Dependant' },
    { value: 'uk_business_visit', label: 'Business / Standard Visitor' },
    { value: 'uk_startup_innovator', label: 'Start-up / Innovator / Global Talent' },
    { value: 'uk_other', label: 'Other UK visa (specify in notes)' },
  ],
  usa: [
    { value: 'usa_b1b2', label: 'B1/B2 Visitor' },
    { value: 'usa_f1', label: 'F-1 Student' },
    { value: 'usa_h1b', label: 'H-1B Specialty Occupation' },
    { value: 'usa_k1', label: 'K-1/K3 Fiancé(e) / Spousal' },
    { value: 'usa_family_reunification', label: 'Family-Sponsored Green Card' },
    { value: 'usa_employment_based', label: 'Employment-Based Immigrant (EB) Visas' },
    { value: 'usa_other', label: 'Other US visa (specify in notes)' },
  ],
  canada: [
    { value: 'canada_study', label: 'Study Permit' },
    { value: 'canada_express_entry', label: 'Express Entry / PR' },
    { value: 'canada_work_permit', label: 'Employer-Specific Work Permit' },
    { value: 'canada_spousal_sponsorship', label: 'Spousal / Common-law Sponsorship' },
    { value: 'canada_visitor', label: 'Visitor / TRV' },
    { value: 'canada_other', label: 'Other Canadian visa (specify in notes)' },
  ],
  germany: [
    { value: 'germany_blue_card', label: 'EU Blue Card' },
    { value: 'germany_job_seeker', label: 'Job Seeker' },
    { value: 'germany_student', label: 'Student' },
    { value: 'germany_family_reunion', label: 'Family Reunion / Spousal' },
    { value: 'germany_business_visit', label: 'Business / Schengen C' },
    { value: 'germany_other', label: 'Other German visa (specify in notes)' },
  ],
  ireland: [
    { value: 'ireland_critical_skills', label: 'Critical Skills Employment Permit' },
    { value: 'ireland_general_employment', label: 'General Employment Permit' },
    { value: 'ireland_student', label: 'Student / Graduate' },
    { value: 'ireland_spouse_family', label: 'Spouse, Partner, or Family Reunification' },
    { value: 'ireland_business', label: 'Business / Start-up / Investor' },
    { value: 'ireland_visit', label: 'Visit / Short Stay C' },
    { value: 'ireland_other', label: 'Other Irish visa (specify in notes)' },
  ],
  eu_schengen: [
    { value: 'schengen_short_stay', label: 'Tourist / Short Stay (C)' },
    { value: 'schengen_business', label: 'Business Short Stay (C)' },
    { value: 'schengen_family', label: 'Family Reunification (D)' },
    { value: 'schengen_student', label: 'Student / Research' },
    { value: 'schengen_other', label: 'Other Schengen visa (specify in notes)' },
  ],
  uae: [
    { value: 'uae_employment', label: 'Employment Residence' },
    { value: 'uae_family', label: 'Family / Dependant Residence' },
    { value: 'uae_investor', label: 'Investor / Golden Visa' },
    { value: 'uae_visit', label: 'Visit / Tourist' },
    { value: 'uae_other', label: 'Other UAE visa (specify in notes)' },
  ],
};

const ageRanges = [
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55+',
];

const relationshipStatuses = [
  'Single',
  'Married',
  'Engaged / Long-term partner',
  'Separated / Divorced',
];

const educationLevels = [
  'High school diploma',
  'Diploma / Certificate',
  'Bachelor degree',
  'Postgraduate / Masters',
  'Doctorate',
];

const workExperienceOptions = [
  '0-1 years',
  '2-4 years',
  '5-7 years',
  '8-10 years',
  '10+ years',
];

const englishExamOptions = [
  'IELTS 7.5+',
  'IELTS 6.0 - 7.0',
  'TOEFL 95+',
  'CELPIP (Canada)',
  'No test yet',
];

const proofOfFundsOptions = [
  'Above required minimum',
  'Slightly below minimum',
  'Sponsor will cover everything',
  'Not yet available',
];

const homeTiesOptions = [
  'Full-time employment',
  'Business ownership',
  'Family / dependents',
  'Property ownership',
  'Limited ties',
];

const yesNoOptions = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
];

type EligibilityResult = {
  verdict: 'likely' | 'needs_more_info' | 'unlikely';
  summary: string;
  confidence: number;
  riskFactors: string[];
  recommendedSteps: string[];
  recommendedDocuments: string[];
  countryLabel: string;
  visaTypeLabel: string;
};

export default function ImmigrationAILanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [eligibilityForm, setEligibilityForm] = useState({
    country: 'uk',
    visaType: 'uk_skilled_worker',
    ageRange: '25-34',
    relationshipStatus: 'Single',
    educationLevel: 'Bachelor degree',
    workExperienceYears: '5-7 years',
    englishExam: 'IELTS 6.0 - 7.0',
    proofOfFunds: 'Slightly below minimum',
    homeTies: 'Full-time employment',
    previousRefusals: 'no',
    travelHistory: 'Limited travel',
    sponsorIncome: '',
    notes: '',
    email: '',
  });
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityError, setEligibilityError] = useState('');

  const currentVisaOptions = useMemo(() => {
    return visaOptionsByCountry[eligibilityForm.country] || [];
  }, [eligibilityForm.country]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!currentVisaOptions.find((option) => option.value === eligibilityForm.visaType)) {
      setEligibilityForm((prev) => ({
        ...prev,
        visaType: currentVisaOptions[0]?.value || '',
      }));
    }
  }, [currentVisaOptions, eligibilityForm.visaType]);

  const verdictMeta = {
    likely: {
      label: 'Strong Match',
      badge: 'bg-emerald-100 text-emerald-800',
      pill: 'text-emerald-600 bg-emerald-50',
    },
    needs_more_info: {
      label: 'Needs More Evidence',
      badge: 'bg-amber-100 text-amber-800',
      pill: 'text-amber-600 bg-amber-50',
    },
    unlikely: {
      label: 'High Risk',
      badge: 'bg-rose-100 text-rose-800',
      pill: 'text-rose-600 bg-rose-50',
    },
  };

  const handleEligibilityChange = (field: string, value: string) => {
    setEligibilityForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEligibilitySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEligibilityLoading(true);
    setEligibilityError('');

    try {
      const tracking = getTrackingDataForConversion();
      const response = await fetch(`${API_BASE_URL}/api/eligibility/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eligibilityForm,
          tracking,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setEligibilityError(data?.message || 'Unable to generate assessment right now.');
        return;
      }

      setEligibilityResult(data.data);
      trackEvent('eligibility_check_success', {
        country: eligibilityForm.country,
        visaType: eligibilityForm.visaType,
        verdict: data.data?.verdict,
      });
    } catch (error) {
      console.error('Eligibility check failed', error);
      setEligibilityError('Network error. Please try again.');
    } finally {
      setEligibilityLoading(false);
    }
  };

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "SOP Generator",
      description: "Create compelling Statements of Purpose tailored to your destination and purpose with AI assistance."
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Cover Letter Writer",
      description: "Generate professional embassy cover letters that highlight your qualifications effectively."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "SOP Reviewer",
      description: "Get instant feedback and improvement suggestions on your existing documents."
    },
    {
      icon: <List className="w-6 h-6" />,
      title: "Document Checklist",
      description: "Never miss a requirement with country-specific visa document checklists."
    }
  ];

  const stats = [
    { value: "10K+", label: "Documents Generated" },
    { value: "95%", label: "Success Rate" },
    { value: "150+", label: "Countries Supported" },
    { value: "24/7", label: "AI Availability" }
  ];

  const pricingTiers = [
    {
      name: "Starter Plan",
      monthlyPrice: 149,
      yearlyPrice: 1500,
      features: [
        "3 Visa Eligibility Checks per month",
        "2 Document Types (SOP, Cover Letter)",
        "PDF Downloads",
        "Basic Support",
        "Email support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Entry Plan",
      monthlyPrice: 299,
      yearlyPrice: 3000,
      features: [
        "10 Visa Eligibility Checks per month",
        "5 Document Types",
        "Basic Interview Practice (5 sessions/month)",
        "English Test Practice (IELTS only)",
        "Priority email support",
        "PDF Downloads"
      ],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Professional Plan",
      monthlyPrice: 699,
      yearlyPrice: 6500,
      features: [
        "Unlimited Visa Eligibility Checks",
        "All Document Types (8+ types)",
        "Relationship Proof Kit",
        "AI Photo Analysis",
        "Unlimited Interview Practice",
        "Full English Test Practice",
        "Interview Questions Database",
        "Agent Dashboard"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Enterprise Plan",
      monthlyPrice: 1499,
      yearlyPrice: 15000,
      features: [
        "Everything in Professional",
        "Unlimited Team Members",
        "Advanced Analytics Dashboard",
        "Bulk Document Processing",
        "Priority Phone Support",
        "Dedicated Account Manager",
        "SLA Guarantee (99.9% uptime)"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const getPrice = (tier: any) => {
    return billingCycle === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice;
  };

  const getPeriod = () => {
    return billingCycle === 'yearly' ? '/year' : '/month';
  };

  const getSavings = (tier: any) => {
    if (billingCycle === 'yearly') {
      const monthlyTotal = tier.monthlyPrice * 12;
      const savings = monthlyTotal - tier.yearlyPrice;
      const percentage = Math.round((savings / monthlyTotal) * 100);
      return percentage;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Immigration AI
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</a>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">About</Link>
              <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 transition-colors">Login</Link>
              <Link href="/auth/signup" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 bg-white rounded-lg shadow-lg mt-2">
              <a href="#features" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">Features</a>
              <a href="#pricing" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">Pricing</a>
              <Link href="/about" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">About</Link>
              <Link href="/auth/login" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">Login</Link>
              <Link href="/auth/signup" className="w-full block mt-2 mx-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg text-center">
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Immigration Journey,
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Simplified</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Generate professional SOPs, cover letters, and visa documents in minutes. 
              AI-powered tools trusted by thousands of successful applicants worldwide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex flex-col items-center space-y-3 mt-6">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>No credit card required</span>
                <span>•</span>
                <span>3 starter documents</span>
                <span>•</span>
                <span>Cancel anytime</span>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full px-4 py-2 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-green-800 font-semibold text-sm">100% Money-Back Guarantee - 7 Days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Check Section */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-2">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-wider text-blue-600 font-semibold">
                  Africa-focused screening
                </p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  Check your visa eligibility
                </h3>
                <p className="text-slate-600 mt-1">
                  Real embassy-style questions for UK, USA, Canada, Germany, Ireland, Schengen & UAE routes.
                </p>
              </div>
              <Compass className="w-10 h-10 text-blue-500 hidden md:block" />
            </div>

            {eligibilityError && (
              <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {eligibilityError}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleEligibilitySubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Destination</label>
                  <select
                    className="mt-1 w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    value={eligibilityForm.country}
                    onChange={(e) => handleEligibilityChange('country', e.target.value)}
                  >
                    {countryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Visa route</label>
                  <select
                    className="mt-1 w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    value={eligibilityForm.visaType}
                    onChange={(e) => handleEligibilityChange('visaType', e.target.value)}
                  >
                    {currentVisaOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Age band</label>
                  <select
                    className="mt-1 w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    value={eligibilityForm.ageRange}
                    onChange={(e) => handleEligibilityChange('ageRange', e.target.value)}
                  >
                    {ageRanges.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Relationship status</label>
                  <select
                    className="mt-1 w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    value={eligibilityForm.relationshipStatus}
                    onChange={(e) => handleEligibilityChange('relationshipStatus', e.target.value)}
                  >
                    {relationshipStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Highest qualification</label>
                  <select
                    className="mt-1 w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    value={eligibilityForm.educationLevel}
                    onChange={(e) => handleEligibilityChange('educationLevel', e.target.value)}
                  >
                    {educationLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Relevant experience</label>
                  <select
                    className="mt-1 w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    value={eligibilityForm.workExperienceYears}
                    onChange={(e) => handleEligibilityChange('workExperienceYears', e.target.value)}
                  >
                    {workExperienceOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">English / language proof</label>
                  <select
                    className="mt-1 w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    value={eligibilityForm.englishExam}
                    onChange={(e) => handleEligibilityChange('englishExam', e.target.value)}
                  >
                    {englishExamOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Proof of funds</label>
                  <select
                    className="mt-1 w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    value={eligibilityForm.proofOfFunds}
                    onChange={(e) => handleEligibilityChange('proofOfFunds', e.target.value)}
                  >
                    {proofOfFundsOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Strongest home tie</label>
                  <select
                    className="mt-1 w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    value={eligibilityForm.homeTies}
                    onChange={(e) => handleEligibilityChange('homeTies', e.target.value)}
                  >
                    {homeTiesOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Previous refusals?</label>
                  <select
                    className="mt-1 w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    value={eligibilityForm.previousRefusals}
                    onChange={(e) => handleEligibilityChange('previousRefusals', e.target.value)}
                  >
                    {yesNoOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Provide extra context (sponsor income, travel history, relationship proof)
                </label>
                <textarea
                  className="mt-1 w-full rounded-2xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={eligibilityForm.notes}
                  placeholder="Example: Sponsor earns £28,000/year, we have shared lease since 2021, previous UK visit in 2022..."
                  onChange={(e) => handleEligibilityChange('notes', e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Contact email (optional)</label>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    value={eligibilityForm.email}
                    placeholder="We'll send a checklist here"
                    onChange={(e) => handleEligibilityChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Sponsor income (if applicable)</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    value={eligibilityForm.sponsorIncome}
                    placeholder="e.g., £20,000 / R350,000 / $45,000"
                    onChange={(e) => handleEligibilityChange('sponsorIncome', e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={eligibilityLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl text-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                {eligibilityLoading ? (
                  <span>Evaluating...</span>
                ) : (
                  <>
                    <span>Check eligibility now</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="text-xs text-slate-500 text-center">
                We reference actual embassy criteria and never share your data.
              </p>
            </form>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-200 via-transparent to-transparent" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm uppercase tracking-widest text-blue-200">Instant verdict</p>
                  <h3 className="text-3xl font-bold">Embassy-style feedback</h3>
                  <p className="text-blue-100 mt-2">Tailored for African applicants targeting high-demand countries.</p>
                </div>
                <Target className="w-10 h-10 text-blue-300 hidden md:block" />
              </div>

              {eligibilityResult ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-4 py-1 rounded-full text-sm font-semibold ${verdictMeta[eligibilityResult.verdict].badge}`}>
                      {verdictMeta[eligibilityResult.verdict].label}
                    </span>
                    <span className="text-sm text-blue-200">
                      {eligibilityResult.countryLabel} • {eligibilityResult.visaTypeLabel}
                    </span>
                    <span className="text-sm px-3 py-1 rounded-full bg-white/10 text-blue-100">
                      Confidence {Math.round((eligibilityResult.confidence || 0) * 100)}%
                    </span>
                  </div>
                  <p className="text-lg leading-relaxed text-blue-50">{eligibilityResult.summary}</p>

                  {eligibilityResult.riskFactors.length > 0 && (
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center space-x-2 text-amber-200 font-semibold mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span>What the officer will probe</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-sm text-blue-100">
                        {eligibilityResult.riskFactors.map((risk, idx) => (
                          <li key={idx}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {eligibilityResult.recommendedSteps.length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-2">Next actions</h4>
                      <ul className="space-y-2">
                        {eligibilityResult.recommendedSteps.slice(0, 3).map((step, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400 mt-1" />
                            <span className="text-blue-100 text-sm">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {eligibilityResult.recommendedDocuments.length > 0 && (
                    <div className="bg-white rounded-2xl p-4 text-slate-900">
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                        Document checklist preview
                      </p>
                      <ul className="space-y-1">
                        {eligibilityResult.recommendedDocuments.slice(0, 4).map((doc, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-sm text-slate-700">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/auth/signup"
                        className="mt-4 inline-flex items-center text-blue-600 font-semibold"
                      >
                        Unlock full checklist &amp; templates
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                  <p className="text-xl font-semibold text-white mb-3">We check what embassies check.</p>
                  <ul className="space-y-3 text-sm text-blue-100">
                    <li>• Financial maintenance thresholds (UK £18,600+, Canada settlement funds)</li>
                    <li>• Relationship evidence strength (marriage vs. engaged vs. dating)</li>
                    <li>• Ties to home country & refusal history (214b, Schengen prior records)</li>
                    <li>• Sponsor income, employer compliance, medical insurance, travel history</li>
                  </ul>
                  <p className="mt-4 text-sm text-blue-200">
                    Submit the form to receive an instant verdict and see what to fix before you apply.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive AI-powered tools designed specifically for immigration document preparation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Immigration AI?</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Built by immigration experts and powered by cutting-edge AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
              <p className="text-blue-100">Your data is encrypted and never shared. GDPR compliant.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-blue-100">Generate professional documents in under 2 minutes.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Global Coverage</h3>
              <p className="text-blue-100">Support for 150+ countries and all major visa types.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
            
            {/* Money-Back Guarantee */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full px-6 py-2 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-semibold">100% Money-Back Guarantee</span>
                <span className="text-green-600 text-sm">• Full refund within 7 days</span>
              </div>
            </div>
            
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
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  Save up to 17%
                </span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingTiers.map((tier, idx) => (
              <div 
                key={idx}
                className={`bg-white rounded-2xl p-8 shadow-lg border-2 transition-all transform hover:scale-105 ${
                  tier.popular 
                    ? 'border-blue-600 relative' 
                    : 'border-gray-100'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">R{getPrice(tier).toLocaleString()}</span>
                    <span className="text-gray-600 ml-2">{getPeriod()}</span>
                  </div>
                  {billingCycle === 'yearly' && getSavings(tier) > 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-green-600 font-medium">
                        Save {getSavings(tier)}% vs monthly
                      </span>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  href={tier.name === 'Enterprise Plan' ? '#contact' : '/auth/signup'}
                  className={`w-full py-3 rounded-lg font-semibold transition-all inline-block text-center ${
                    tier.popular
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of successful applicants who trust Immigration AI
          </p>
          <Link href="/auth/signup" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center space-x-2">
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Immigration AI</span>
              </div>
              <p className="text-sm text-gray-400">
                AI-powered immigration document assistance for your success.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2024 Immigration AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
