'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import {
  Briefcase, Users, FileCheck, MessageSquare, Bell,
  TrendingUp, Globe, ArrowRight,
  Menu, X, CheckCircle, Building, Target,
  BarChart3, Brain, Sparkles,
  FolderOpen, Bot, ShieldCheck,
  MapPin, Award,
  CheckSquare, ChevronDown, ChevronUp,
  Phone, Star, Search, AlertTriangle, Zap,
} from 'lucide-react';

// ─── JSON-LD Structured Data ──────────────────────────────────────────────
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ImmigrationAI',
  url: 'https://www.immigrationai.co.za',
  logo: 'https://www.immigrationai.co.za/logo.png',
  description:
    'AI-powered immigration case management platform for agencies, consultants, and lawyers worldwide. Handle immigration cases to any country with AI tools, client portals, and live regulation monitoring.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['English'],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ImmigrationAI',
  url: 'https://www.immigrationai.co.za',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.immigrationai.co.za/find-a-specialist?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'My visa was rejected — what can I do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A visa rejection is not the end. Most rejections result from fixable documentation issues or eligibility gaps. The first step is to understand the exact rejection reason stated in the letter. A verified immigration professional can review your case, identify the problem, and advise whether to appeal or reapply with corrected documentation. ImmigrationAI connects you with verified professionals who specialise in visa appeals and reapplications.',
      },
    },
    {
      '@type': 'Question',
      name: 'What immigration destinations does ImmigrationAI support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ImmigrationAI supports immigration cases to any country in the world. Our AI tools, document checklists, and case management system work for all major immigration destinations including UK, Canada, USA, Australia, Germany, Netherlands, UAE, New Zealand, South Africa, and all SADC countries. The platform is used by immigration agencies and consultants who handle multi-country portfolios.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of immigration professionals use ImmigrationAI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ImmigrationAI is used by immigration agencies, solo immigration consultants, immigration lawyers, and registered immigration practitioners. Both large multi-country agencies and solo practitioners use the platform to manage cases, collaborate with clients, reduce paperwork errors, and stay ahead of regulation changes.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the AI help prevent visa rejections?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The platform\'s AI scans every case before submission: it generates a case-specific document checklist based on visa type, nationality, and application route; checks all submitted documents for inconsistencies (mismatched names, expired dates, conflicting data); scores the case for readiness; analyses prior rejection letters to identify exact failure points; and monitors official immigration sources for regulation changes that could affect pending cases.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I manage cases for multiple countries on one platform?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. ImmigrationAI is built for multi-country immigration practices. You can manage cases for UK, Canada, USA, Australia, South Africa, Germany, UAE, and any other destination from a single workspace. Each case tracks its own destination country, visa type, and specific requirements independently.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does ImmigrationAI have a client portal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Every case includes a secure client portal where your client can track their application status, upload documents, and message your team directly — without emails or WhatsApp. Client accounts are free and scoped only to their cases.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens when immigration regulations change?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our system continuously monitors official government and visa authority sources across all supported countries. When a change is detected on a monitored source, it identifies which active cases may be affected and alerts the responsible practitioner immediately — so you can adjust before the change causes a problem for your client.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I find a verified immigration consultant?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ImmigrationAI maintains a directory of verified immigration professionals. All listed practitioners have submitted their credentials for review. You can search by visa type specialty, destination country, city, and language. Visit immigrationai.co.za/find-a-specialist to find a verified professional.',
      },
    },
  ],
};

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Why practitioners choose us (outcome-focused) ────────────────────
  const benefits = [
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Stop Losing Cases to Preventable Errors',
      description:
        'The majority of visa rejections worldwide are caused by avoidable document mistakes. Our AI scans every case for errors, inconsistencies, and missing items before your client pays the price of a rejection.',
      stat: '73%',
      statLabel: 'of visa rejections involve fixable errors',
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: 'Case-Specific Checklists for Every Destination',
      description:
        'No more generic lists. Every case gets a tailored document checklist based on the specific visa category, destination country, nationality, employment history, and application route — generated automatically.',
      stat: '100+',
      statLabel: 'visa types and destinations supported',
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Never Miss a Regulation Change',
      description:
        'Immigration rules change without warning across every country. Our system monitors official government and visa authority sources and alerts you the moment something changes that could affect your active cases.',
      stat: '24h',
      statLabel: 'average time to alert on source changes',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Know a Case\'s Strength Before You File',
      description:
        'Get a readiness score for every case before submission. See exactly what\'s missing, what\'s weak, and what\'s strong — so you submit with confidence, not guesswork.',
      stat: '87%',
      statLabel: 'average readiness score for approved applications',
    },
  ];

  // ─── Platform tools ───────────────────────────────────────────────────
  const platformFeatures = [
    {
      icon: <FolderOpen className="w-6 h-6" />,
      title: 'Full Case Lifecycle Management',
      description:
        'Track every case from first inquiry to final decision. Documents, deadlines, team assignments, and status — all in one place with a complete audit trail.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Team Collaboration',
      description:
        'Assign cases, create tasks, comment, and message — all scoped to the case. Your whole team stays aligned without forwarding endless email chains.',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Client Portal & Secure Messaging',
      description:
        'Clients track progress, upload documents, and message your team in real-time through their own secure portal. No WhatsApp threads or lost emails.',
    },
    {
      icon: <CheckSquare className="w-6 h-6" />,
      title: 'Task Management & Deadline Tracking',
      description:
        'Create and assign tasks against each case. Automated reminders ensure nothing slips through as submission deadlines approach.',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'VAC Appointment Tracking',
      description:
        'Track visa application centre availability and estimated wait times across Africa, Asia, and Europe — directly inside your case workflow.',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Practice Analytics',
      description:
        'See your success rates, case durations, and workload by destination country. Understand where your practice excels and where to focus.',
    },
  ];

  // ─── Audience cards (outcome-focused, no internal details) ───────────
  const audiences = [
    {
      title: 'Immigration Agencies',
      icon: <Building className="w-8 h-8" />,
      color: 'from-[#0F2557] to-blue-700',
      points: [
        'Manage all your cases in one workspace',
        'Multi-country and multi-visa-type support',
        'AI catches errors before they cause rejections',
        'Your whole team collaborates on every case',
        'Clients get their own secure tracking portal',
        'Regulation alerts across all your destinations',
      ],
      cta: 'Start Free Trial',
      href: '/auth/signup',
    },
    {
      title: 'Solo Practitioners',
      icon: <Award className="w-8 h-8" />,
      color: 'from-amber-500 to-orange-500',
      points: [
        'Run your practice without the overhead of enterprise tools',
        'AI tools that make you work like a team of five',
        'Client portal for document uploads and case updates',
        'Rejection analysis to win difficult resubmissions',
        'Join our verified professionals directory',
        'Receive matched client enquiries',
      ],
      cta: 'Start Free Trial',
      href: '/auth/signup',
    },
    {
      title: 'For Applicants',
      icon: <Globe className="w-8 h-8" />,
      color: 'from-green-500 to-teal-600',
      points: [
        'Visa rejected? Get expert help today',
        'Find a verified immigration professional',
        'Filter by destination country, visa type, and language',
        'Track your application status in real-time',
        'Secure document sharing with your consultant',
        'Direct messaging — no lost emails',
      ],
      cta: 'Find a Specialist',
      href: '/find-a-specialist',
    },
  ];

  // ─── Supported destinations (ticker) ─────────────────────────────────
  const destinations = [
    '🇬🇧 United Kingdom', '🇨🇦 Canada', '🇺🇸 United States', '🇦🇺 Australia',
    '🇩🇪 Germany', '🇳🇱 Netherlands', '🇿🇦 South Africa', '🇦🇪 UAE',
    '🇳🇿 New Zealand', '🇮🇪 Ireland', '🇵🇹 Portugal', '🇿🇼 Zimbabwe',
    '🇿🇲 Zambia', '🇿🇼 Zimbabwe', '🇲🇿 Mozambique', '🇧🇼 Botswana',
    '🇸🇬 Singapore', '🇯🇵 Japan', '🇳🇱 Schengen Area', '🇫🇷 France',
  ];

  // ─── FAQ (high-search-volume queries) ────────────────────────────────
  const faqs = [
    {
      question: 'My visa was rejected — what can I do?',
      answer:
        'A rejection is not the end. Most rejections are the result of fixable documentation issues or eligibility gaps. The first step is to understand the exact rejection reason stated in the letter. A verified immigration professional can review your case, identify the specific problem, and advise whether to appeal or reapply. ImmigrationAI connects you with verified professionals who specialise in visa appeals.',
    },
    {
      question: 'What immigration destinations does the platform support?',
      answer:
        'ImmigrationAI supports cases to any country in the world. Our AI tools, document checklists, and case logic work for all major destinations — UK, Canada, USA, Australia, Germany, Netherlands, South Africa, UAE, New Zealand, and more. Professionals handling multi-country portfolios can manage all their cases in one workspace.',
    },
    {
      question: 'What types of immigration professionals use ImmigrationAI?',
      answer:
        'The platform is used by immigration agencies, solo immigration consultants, immigration lawyers, and registered immigration practitioners. Whether you\'re handling 5 cases or 500, the tools scale with your practice.',
    },
    {
      question: 'How does the AI help prevent visa rejections?',
      answer:
        'The AI generates a case-specific document checklist, checks all uploaded documents for inconsistencies (mismatched names, expired dates, conflicting data), scores the case for readiness before submission, and analyses prior rejection letters to identify exact failure points. It also monitors official sources across all supported countries for regulation changes that could affect your active cases.',
    },
    {
      question: 'Can I manage cases for multiple countries on one platform?',
      answer:
        'Yes. ImmigrationAI is built for multi-country practices. You can manage UK, Canada, South Africa, UAE, and any other destination cases from a single workspace. Each case tracks its own destination, visa type, and specific requirements independently.',
    },
    {
      question: 'Does my client need an account?',
      answer:
        'Yes, but client accounts are free. You invite them by email. They create a portal account and can then upload documents, track their application status, and message your team — all scoped only to their case. No access to other cases or sensitive practice data.',
    },
    {
      question: 'What happens when immigration regulations change?',
      answer:
        'Our system continuously monitors official government and visa authority sources across all supported countries. When a change is detected, it identifies which active cases may be affected and alerts the responsible practitioner — so you can adjust before the change causes a rejection for your client.',
    },
    {
      question: 'How do I get started?',
      answer:
        'Sign up for a 14-day free trial — no credit card required. You\'ll be guided through creating your practice workspace, inviting your team, and setting up your first case. We also offer live demo sessions for larger agencies. Payment is by EFT/bank transfer only.',
    },
  ];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script id="org-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <Script id="web-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="min-h-screen bg-white">

        {/* ─── NAV ────────────────────────────────────────────────────────── */}
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100' : 'bg-transparent'
        }`}>
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-[#0F2557] rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-xl font-bold text-[#0F2557]">ImmigrationAI</span>
              </div>

              <div className="hidden md:flex items-center space-x-7">
                <a href="#how-we-help" className="text-sm text-gray-600 hover:text-[#0F2557] font-medium transition-colors">How We Help</a>
                <a href="#who-its-for" className="text-sm text-gray-600 hover:text-[#0F2557] font-medium transition-colors">Who It's For</a>
                <a href="#faq" className="text-sm text-gray-600 hover:text-[#0F2557] font-medium transition-colors">FAQ</a>
                <Link href="/find-a-specialist" className="text-sm text-gray-600 hover:text-[#0F2557] font-medium transition-colors">Find a Specialist</Link>
                <Link href="/auth/login" className="text-sm text-gray-600 hover:text-[#0F2557] font-medium transition-colors">Log In</Link>
                <Link
                  href="/auth/signup"
                  className="bg-[#0F2557] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#1a3570] transition-colors"
                >
                  Start Free Trial
                </Link>
              </div>

              <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden bg-white border rounded-xl shadow-xl mt-2 py-3">
                {[
                  { href: '#how-we-help', label: 'How We Help' },
                  { href: '#who-its-for', label: 'Who It\'s For' },
                  { href: '#faq', label: 'FAQ' },
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

        {/* ─── HERO ───────────────────────────────────────────────────────── */}
        <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0F2557] via-[#1a3570] to-[#0d1e45]">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 px-4 py-2 rounded-full mb-6 text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  For Immigration Agencies &amp; Professionals Worldwide
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  The AI Platform
                  <span className="text-amber-400"> Immigration </span>
                  Professionals Trust
                </h1>

                <p className="text-lg text-blue-100 mb-4 leading-relaxed max-w-xl">
                  Manage immigration cases to <strong className="text-white">any country</strong> from one workspace. AI tools that prevent rejections, a full case management suite, client portals, and live regulation monitoring — built for agencies and consultants who handle real-world immigration every day.
                </p>

                <p className="text-sm text-blue-300 mb-8 max-w-xl">
                  UK · Canada · USA · Australia · Germany · South Africa · UAE · New Zealand · Schengen and beyond.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link
                    href="/auth/signup"
                    className="bg-amber-400 text-[#0F2557] px-8 py-4 rounded-xl text-base font-bold hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
                  >
                    Start Free Trial <ArrowRight className="w-5 h-5" />
                  </Link>
                  <a
                    href="mailto:hello@immigrationai.co.za"
                    className="border border-white/30 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" /> Book a Demo
                  </a>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-200">
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> All immigration destinations</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> 14-day free trial</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> No card needed</span>
                </div>
              </div>

              {/* Case readiness preview */}
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">Case Readiness Check</span>
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
                      { label: 'Documents submitted', count: '11 / 13', ok: true },
                      { label: 'Document consistency', count: 'All matched', ok: true },
                      { label: 'Passport validity', count: '⚠ Expires in 6 months', ok: false },
                      { label: 'Bank statements', count: '3 months required', ok: false },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <span className="text-blue-100">{item.label}</span>
                        <span className={item.ok ? 'text-green-300' : 'text-amber-300'}>{item.count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-blue-200">Skilled Worker Visa — 🇬🇧 United Kingdom</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── DESTINATION TICKER ─────────────────────────────────────────── */}
        <section className="bg-[#0a1d42] py-4 overflow-hidden">
          <div className="relative flex gap-8 whitespace-nowrap">
            <div className="flex gap-8 items-center animate-[marquee_35s_linear_infinite]">
              {[...destinations, ...destinations].map((d, i) => (
                <React.Fragment key={`${d}-${i}`}>
                  <span className="text-blue-300 text-sm font-medium">{d}</span>
                  <span className="text-amber-400 text-xs">·</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TRUST BAR ──────────────────────────────────────────────────── */}
        <section className="py-10 px-4 bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { stat: '100+', label: 'Visa Types & Routes Supported' },
              { stat: 'Any', label: 'Destination Country' },
              { stat: 'AI', label: 'Powered Error Detection' },
              { stat: '24h', label: 'Regulation Change Alerts' },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-3xl font-bold text-[#0F2557] mb-1">{item.stat}</div>
                <div className="text-sm text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── APPLICANT CAPTURE SECTION ──────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-amber-50 border-b border-amber-100">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full mb-6 text-sm font-semibold">
              <Search className="w-4 h-4" />
              For Visa Applicants
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Visa Rejected? Application Delayed?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Immigration law is complex and changes constantly. A verified professional who knows your destination country and visa category can mean the difference between another rejection and a successful application.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/find-a-specialist"
                className="bg-[#0F2557] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#1a3570] transition-colors flex items-center justify-center gap-2 text-base"
              >
                Find a Verified Specialist <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── BENEFITS (HOW WE HELP) ──────────────────────────────────────── */}
        <section id="how-we-help" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4 text-sm font-semibold">
                <Bot className="w-4 h-4" /> For Immigration Professionals
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Built to Prevent Rejections,<br />Not Just Track Cases
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Every case benefits from AI that knows immigration rules across all major countries, works automatically in the background, and alerts you before problems become rejections.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#0F2557] rounded-xl flex items-center justify-center text-amber-400 flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600 leading-relaxed mb-4">{benefit.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-[#0F2557]">{benefit.stat}</span>
                        <span className="text-sm text-gray-500">{benefit.statLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PLATFORM TOOLS ─────────────────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full mb-4 text-sm font-semibold">
                <Briefcase className="w-4 h-4" /> Practice Management
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything to Run a Professional Practice
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Not just a case tracker — a complete operating system for immigration professionals. From first inquiry to approval letter, across every destination country.
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

        {/* ─── THREE AUDIENCES ─────────────────────────────────────────────── */}
        <section id="who-its-for" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Who Uses ImmigrationAI?</h2>
              <p className="text-xl text-gray-600">Whether you manage cases or you're going through one — we've got you.</p>
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

        {/* ─── PROFESSIONAL CTA ────────────────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0F2557]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-4 py-2 rounded-full mb-6 text-sm font-semibold">
              <Star className="w-4 h-4" /> For Immigration Professionals
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Run a Smarter Practice?
            </h2>
            <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
              Join immigration professionals using AI to handle more cases, prevent rejections, and deliver better outcomes — across every destination country.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-amber-400 text-[#0F2557] px-8 py-4 rounded-xl font-bold hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 text-base"
              >
                Start Your Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="mailto:hello@immigrationai.co.za"
                className="border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-base"
              >
                <Phone className="w-5 h-5" /> Book a Demo
              </a>
            </div>
            <p className="text-sm text-blue-300 mt-6">
              14-day free trial · No credit card · EFT payment · Cancel anytime
            </p>
          </div>
        </section>

        {/* ─── FAQ ─────────────────────────────────────────────────────────── */}
        <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Common Questions
              </h2>
              <p className="text-xl text-gray-600">
                What immigration professionals and applicants ask most.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-2xl overflow-hidden hover:border-[#0F2557]/30 transition-colors"
                >
                  <button
                    className="w-full flex items-center justify-between p-6 text-left"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    aria-expanded={openFaq === idx}
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    {openFaq === idx
                      ? <ChevronUp className="w-5 h-5 text-[#0F2557] flex-shrink-0" />
                      : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    }
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">Looking for help with a specific visa or country?</p>
              <Link
                href="/find-a-specialist"
                className="inline-flex items-center gap-2 bg-[#0F2557] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1a3570] transition-colors"
              >
                Find a Verified Specialist <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
        <footer className="bg-gray-900 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-9 h-9 bg-[#0F2557] rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-xl font-bold text-white">ImmigrationAI</span>
                </div>
                <p className="text-sm leading-relaxed max-w-xs">
                  The AI-powered immigration case management platform for agencies and professionals worldwide. Handle cases to any country from one workspace.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm">For Applicants</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/find-a-specialist" className="hover:text-white transition-colors">Find a Specialist</Link></li>
                  <li><Link href="/find-a-specialist" className="hover:text-white transition-colors">Visa Rejection Help</Link></li>
                  <li><Link href="/find-a-specialist" className="hover:text-white transition-colors">Immigration Consultant</Link></li>
                  <li><Link href="/find-a-specialist" className="hover:text-white transition-colors">Immigration Lawyer</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm">For Professionals</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/auth/signup" className="hover:text-white transition-colors">Start Free Trial</Link></li>
                  <li><Link href="/auth/login" className="hover:text-white transition-colors">Log In</Link></li>
                  <li><a href="mailto:hello@immigrationai.co.za" className="hover:text-white transition-colors">Book a Demo</a></li>
                  <li><a href="mailto:hello@immigrationai.co.za" className="hover:text-white transition-colors">Contact Us</a></li>
                </ul>
              </div>
            </div>

            {/* SEO keyword links */}
            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-6 text-xs text-gray-600">
                {[
                  'Immigration Case Management Software', 'Visa Rejection Help',
                  'Immigration Consultant', 'Immigration Lawyer',
                  'UK Visa Application', 'Canada Immigration',
                  'Australia Visa', 'South Africa Immigration',
                  'Germany Immigration', 'UAE Visa',
                  'Work Permit Application', 'Skilled Worker Visa',
                  'Spousal Visa Application', 'Study Visa',
                  'Immigration Agency Software', 'Visa Application Management',
                ].map((kw) => (
                  <span key={kw}>{kw}</span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                <span>© {new Date().getFullYear()} ImmigrationAI. All rights reserved.</span>
                <div className="flex gap-4">
                  <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
