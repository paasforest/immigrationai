'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase, Users, FileCheck, MessageSquare, Bell,
  TrendingUp, Shield, Zap, Globe, ArrowRight,
  Menu, X, CheckCircle, Building, Target,
  Clock, BarChart3, Brain, Sparkles,
  FolderOpen, Bot, ShieldCheck, FileText,
  MapPin, Award, BookOpen, AlertTriangle,
  CheckSquare, Inbox, CreditCard,
} from 'lucide-react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const aiFeatures = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Visa Intelligence DB',
      description: 'Live-monitored database of South African and African immigration rules. When regulations change, the system alerts you automatically — before it affects your clients.',
      badge: 'AI-Powered',
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: 'Smart Pre-Doc Checklists',
      description: 'AI generates a case-specific document checklist tailored to visa type, nationality, employment status, and history — not a generic list.',
      badge: 'AI-Powered',
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'Document Cross-Validation',
      description: 'Catches inconsistencies across submitted documents before submission — mismatched names, expired dates, conflicting data.',
      badge: 'AI-Powered',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Application Readiness Score',
      description: 'Real-time readiness score showing exactly how complete and strong a case is before it goes out. No more guessing.',
      badge: 'AI-Powered',
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Rejection Analysis',
      description: 'AI analyses rejection letters and prior case history to identify the exact failure points and recommend corrective actions.',
      badge: 'AI-Powered',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Silent Eligibility Scoring',
      description: 'Every incoming lead is scored against visa rules in the background — before you even open the case. Know if a client qualifies before you commit.',
      badge: 'AI-Powered',
    },
  ];

  const platformFeatures = [
    {
      icon: <FolderOpen className="w-6 h-6" />,
      title: 'Case Management',
      description: 'Track every case from intake to approval. Deadlines, team assignments, status updates, and full audit trail — all in one place.',
    },
    {
      icon: <Inbox className="w-6 h-6" />,
      title: 'Automated Lead Routing',
      description: 'Incoming client inquiries matched to the right professional based on visa type, language, and availability.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Team Collaboration',
      description: 'Assign cases, set tasks, comment, message — all scoped to the case. Your whole team stays aligned without endless emails.',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Client Portal & Messaging',
      description: 'Clients can track progress, upload documents, and message your team in real-time through their own secure portal.',
    },
    {
      icon: <CheckSquare className="w-6 h-6" />,
      title: 'Task Management',
      description: 'Create, assign, and track tasks against each case. Automated deadline reminders fire 24 hours before due dates.',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'VAC Appointment Tracker',
      description: 'Track visa application centre availability and estimated wait times across Southern and Eastern Africa.',
    },
  ];

  const audiences = [
    {
      title: 'For Immigration Agencies',
      icon: <Building className="w-8 h-8" />,
      color: 'from-[#0F2557] to-blue-700',
      points: [
        'Manage unlimited client cases',
        'Automated document checklists per visa type',
        'AI readiness score before submission',
        'Team collaboration + task assignment',
        'Lead routing from the applicant marketplace',
        'Monthly analytics: success rates, turnaround times',
      ],
      cta: 'Start Agency Trial',
      href: '/auth/signup',
    },
    {
      title: 'For Individual Practitioners',
      icon: <Award className="w-8 h-8" />,
      color: 'from-amber-500 to-orange-500',
      points: [
        'Solo practitioner plan from R499/month',
        'AI-assisted document review',
        'Rejection analysis and resubmission guidance',
        'Client portal for document uploads',
        'Get verified — appear in our public directory',
        'Receive matched leads from our marketplace',
      ],
      cta: 'Start Solo Trial',
      href: '/auth/signup',
    },
    {
      title: 'For Individual Applicants',
      icon: <Globe className="w-8 h-8" />,
      color: 'from-green-500 to-teal-600',
      points: [
        'Find a verified South African immigration professional',
        'Filter by visa type, language, and location',
        'Track your application status in real-time',
        'Upload and share documents securely',
        'Message your consultant directly',
        'Know exactly what documents you need',
      ],
      cta: 'Find a Specialist',
      href: '/find-a-specialist',
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Create Your Account',
      description: 'Sign up as an agency, solo practitioner, or individual applicant. 14-day free trial, no card required.',
      icon: <Building className="w-8 h-8" />,
    },
    {
      step: 2,
      title: 'Get Verified',
      description: 'Upload your practicing certificate. Once verified by our team, your profile appears in the public directory.',
      icon: <ShieldCheck className="w-8 h-8" />,
    },
    {
      step: 3,
      title: 'Accept Leads & Create Cases',
      description: 'Receive matched client inquiries, or create cases manually for your existing clients.',
      icon: <Target className="w-8 h-8" />,
    },
    {
      step: 4,
      title: 'AI Does the Heavy Lifting',
      description: 'Smart checklists, readiness scores, cross-validation, and rejection analysis — all automated per case.',
      icon: <Bot className="w-8 h-8" />,
    },
  ];

  const visaTypes = [
    'Critical Skills Visa', 'General Work Permit', 'Business Visa',
    'Study Visa', 'Spousal/Life Partner', 'Retired Person Visa',
    'Corporate Permit', 'Asylum / Refugee', 'Zimbabwe Exemption',
    'Lesotho/eSwatini Exemption', 'SADC Permits', 'Intra-Company Transfer',
  ];

  const faqs = [
    {
      question: 'Is this platform only for South Africa?',
      answer: 'The platform is built with South African immigration law as the primary focus, but supports any African immigration route. The Visa Intelligence DB currently tracks South African DHA, VFS Global Africa, and SADC-region official sources.',
    },
    {
      question: 'How does the AI readiness score work?',
      answer: 'The system checks every required document against the checklist for the specific visa type, verifies cross-consistency (names, dates, employers), and scores the case out of 100. Cases below 80 flag the specific missing items before you submit.',
    },
    {
      question: 'Can I use this as a solo practitioner, not an agency?',
      answer: 'Yes. The Starter plan is designed for solo consultants. You get the same AI tools, client portal, and lead marketplace access as larger agencies — just for one user.',
    },
    {
      question: 'How does payment work?',
      answer: 'We accept EFT/bank transfer for all plans. Once you select your plan, you\'ll receive banking details with your unique account reference. After payment, simply upload your proof of payment and your account is activated within 24 hours.',
    },
    {
      question: 'Do clients need their own account?',
      answer: 'Yes, but it\'s free for clients. You invite them by email, they create a portal account, and can then upload documents, track status, and message your team — all scoped to their case only.',
    },
    {
      question: 'What happens if visa regulations change?',
      answer: 'The Visa Rules Monitor checks all official government and VFS sources weekly. If it detects a content change on a monitored page, it asks the AI to summarise what changed and immediately notifies you so you can adjust pending cases.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ─── NAV ─────────────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100' : 'bg-transparent'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-[#0F2557] rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-xl font-bold text-[#0F2557]">
                ImmigrationAI
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-7">
              <a href="#features" className="text-sm text-gray-600 hover:text-[#0F2557] font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-[#0F2557] font-medium transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-[#0F2557] font-medium transition-colors">Pricing</a>
              <Link href="/find-a-specialist" className="text-sm text-gray-600 hover:text-[#0F2557] font-medium transition-colors">Find a Specialist</Link>
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-[#0F2557] font-medium transition-colors">Log In</Link>
              <Link
                href="/auth/signup"
                className="bg-[#0F2557] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#1a3570] transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden bg-white border rounded-xl shadow-xl mt-2 py-3">
              {[
                { href: '#features', label: 'Features' },
                { href: '#how-it-works', label: 'How It Works' },
                { href: '#pricing', label: 'Pricing' },
                { href: '/find-a-specialist', label: 'Find a Specialist' },
                { href: '/auth/login', label: 'Log In' },
              ].map((item) => (
                <a key={item.href} href={item.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                  {item.label}
                </a>
              ))}
              <div className="px-4 pt-2">
                <Link href="/auth/signup" className="block text-center bg-[#0F2557] text-white py-2 rounded-lg text-sm font-semibold">
                  Start Free Trial
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0F2557] via-[#1a3570] to-[#0d1e45]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 px-4 py-2 rounded-full mb-6 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Built for Africa's Immigration Professionals
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Smarter Immigration
                <span className="text-amber-400"> Case Management</span>
                <br />with AI
              </h1>

              <p className="text-lg text-blue-100 mb-8 leading-relaxed max-w-xl">
                ImmigrationAI is the end-to-end platform for South African immigration agencies and consultants.
                AI-powered checklists, live visa rule monitoring, readiness scoring, and a full case management suite — in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/auth/signup"
                  className="bg-amber-400 text-[#0F2557] px-8 py-4 rounded-xl text-base font-bold hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
                >
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/find-a-specialist"
                  className="border border-white/30 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  Find a Specialist
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-200">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> 14-day free trial</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> EFT payment — no card needed</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Cancel anytime</span>
              </div>
            </div>

            {/* Dashboard preview card */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">Case Readiness Score</span>
                  <span className="bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded-full">STRONG</span>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-bold text-white">87</span>
                  <span className="text-blue-200 text-sm pb-2">/ 100</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: '87%' }} />
                </div>
                <div className="space-y-2 pt-2">
                  {[
                    { label: 'Documents uploaded', count: '11 / 13', ok: true },
                    { label: 'Cross-validation', count: 'Passed', ok: true },
                    { label: 'Passport expiry', count: '⚠ Expires in 6 months', ok: false },
                    { label: 'Bank statements', count: '3 months required', ok: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-blue-100">{item.label}</span>
                      <span className={item.ok ? 'text-green-300' : 'text-amber-300'}>{item.count}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-blue-200">Critical Skills Visa — General Work Permit → ZA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VISA TYPE TICKER ────────────────────────────────────────────────── */}
      <section className="bg-[#0a1d42] py-4 overflow-hidden">
        <div className="flex gap-8 animate-none whitespace-nowrap px-4">
          <div className="flex gap-8 items-center">
            {visaTypes.map((v, i) => (
              <React.Fragment key={v}>
                <span className="text-blue-300 text-sm font-medium">{v}</span>
                {i < visaTypes.length - 1 && <span className="text-amber-400 text-xs">·</span>}
              </React.Fragment>
            ))}
            {visaTypes.map((v, i) => (
              <React.Fragment key={`${v}-dup`}>
                <span className="text-blue-300 text-sm font-medium">{v}</span>
                {i < visaTypes.length - 1 && <span className="text-amber-400 text-xs">·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4 text-sm font-semibold">
              <Bot className="w-4 h-4" /> AI Features
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The AI Layer Other Platforms Don't Have
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every case benefits from AI that knows South African immigration law, monitors official sources, and works invisibly in the background.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiFeatures.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#0F2557] rounded-xl flex items-center justify-center text-amber-400">
                    {feature.icon}
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full uppercase tracking-wide">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORM FEATURES ───────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full mb-4 text-sm font-semibold">
              <Briefcase className="w-4 h-4" /> Platform Tools
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything to Run Your Practice
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A complete operating system for immigration professionals — not just a file storage tool.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feature, idx) => (
              <div key={idx} className="flex gap-4 p-6 rounded-2xl border border-gray-100 hover:border-[#0F2557]/20 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#0F2557] flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THREE AUDIENCES ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Who Is It For?</h2>
            <p className="text-xl text-gray-600">Built for every role in the immigration process</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {audiences.map((audience, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`bg-gradient-to-br ${audience.color} p-6 text-white`}>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    {audience.icon}
                  </div>
                  <h3 className="text-xl font-bold">{audience.title}</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {audience.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={audience.href}
                    className="block text-center bg-[#0F2557] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#1a3570] transition-colors"
                  >
                    {audience.cta} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0F2557]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              From signup to verified professional in under 48 hours
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((item, idx) => (
              <div key={item.step} className="relative">
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-px bg-white/20" />
                )}
                <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center relative z-10">
                  <div className="w-14 h-14 bg-amber-400 text-[#0F2557] rounded-xl flex items-center justify-center mx-auto mb-4">
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-amber-400 mb-2 uppercase tracking-widest">Step {item.step}</div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-blue-200">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
            <p className="text-xl text-gray-600 mb-2">
              All plans include a 14-day free trial. Pay by EFT — no card required.
            </p>
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-full text-sm mt-2">
              <CreditCard className="w-4 h-4" />
              EFT / Bank Transfer only — instant reference number on signup
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter',
                price: 'R499',
                period: '/month',
                desc: 'Solo practitioners and small consultancies',
                features: [
                  '1 user',
                  'Up to 20 active cases',
                  'AI checklist + readiness score',
                  'Client portal',
                  'Lead marketplace access',
                  'Email support',
                ],
                popular: false,
                color: 'border-gray-200',
              },
              {
                name: 'Professional',
                price: 'R1,299',
                period: '/month',
                desc: 'Growing agencies with a dedicated team',
                features: [
                  'Up to 5 users',
                  'Unlimited active cases',
                  'All AI tools incl. rejection analysis',
                  'Document cross-validation',
                  'VAC tracker',
                  'Priority support',
                ],
                popular: true,
                color: 'border-[#0F2557]',
              },
              {
                name: 'Agency',
                price: 'R2,999',
                period: '/month',
                desc: 'Large agencies with multiple practitioners',
                features: [
                  'Unlimited users',
                  'Unlimited cases',
                  'All AI tools',
                  'Visa rules monitor alerts',
                  'Custom branding',
                  'Dedicated account manager',
                ],
                popular: false,
                color: 'border-gray-200',
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border-2 p-8 relative ${plan.color} ${plan.popular ? 'shadow-xl scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0F2557] text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-[#0F2557]">{plan.price}</span>
                    <span className="text-gray-500 pb-1">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-[#0F2557] text-white hover:bg-[#1a3570]'
                      : 'border-2 border-[#0F2557] text-[#0F2557] hover:bg-blue-50'
                  }`}
                >
                  Start {plan.name} Trial
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            All prices exclude VAT. Cancel anytime during trial — no charges.
          </p>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="font-semibold text-gray-900 text-sm">{faq.question}</span>
                  <span className="text-[#0F2557] ml-3 flex-shrink-0 text-lg">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0F2557]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Brain className="w-8 h-8 text-[#0F2557]" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Modernise Your Practice?
          </h2>
          <p className="text-xl text-blue-200 mb-8">
            Join South Africa's leading immigration agencies on ImmigrationAI. 14-day free trial, pay by EFT.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-amber-400 text-[#0F2557] px-10 py-4 rounded-xl text-lg font-bold hover:bg-amber-300 transition-colors inline-flex items-center gap-2"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/find-a-specialist"
              className="border border-white/30 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Find a Specialist
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0a1d42] text-gray-400 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#0F2557] rounded-lg flex items-center justify-center border border-amber-400/30">
                  <Brain className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-white font-bold text-lg">ImmigrationAI</span>
              </div>
              <p className="text-sm leading-relaxed">
                South Africa's AI-powered immigration case management platform. Built for agencies, practitioners, and applicants.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">AI Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/find-a-specialist" className="hover:text-white transition-colors">Find a Specialist</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Start Free Trial</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Log In</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Agency Sign Up</Link></li>
                <li><Link href="/onboarding" className="hover:text-white transition-colors">Onboarding</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@immigrationai.co.za" className="hover:text-white transition-colors">support@immigrationai.co.za</a></li>
                <li><span>Cape Town, South Africa</span></li>
                <li><span className="text-green-400 font-medium">● System operational</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} ImmigrationAI. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
