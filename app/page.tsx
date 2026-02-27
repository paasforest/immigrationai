'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import {
  Briefcase, Users, FileCheck, MessageSquare, Bell,
  TrendingUp, Shield, Zap, Globe, ArrowRight,
  Menu, X, CheckCircle, Building, Target,
  Clock, BarChart3, Brain, Sparkles,
  FolderOpen, Bot, ShieldCheck, FileText,
  MapPin, Award, BookOpen, AlertTriangle,
  CheckSquare, Inbox, ChevronDown, ChevronUp,
  Phone, Star, Search,
} from 'lucide-react';

// ─── JSON-LD Structured Data ────────────────────────────────────────────────
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ImmigrationAI',
  url: 'https://www.immigrationai.co.za',
  logo: 'https://www.immigrationai.co.za/logo.png',
  description:
    'South Africa\'s AI-powered immigration case management platform. Connecting applicants with verified immigration consultants and helping professionals manage cases with AI tools.',
  areaServed: {
    '@type': 'Country',
    name: 'South Africa',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    areaServed: 'ZA',
    availableLanguage: ['English', 'Afrikaans'],
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
      name: 'My South African visa was rejected — what can I do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A visa rejection in South Africa is not the end. In most cases you can reapply or lodge an appeal. The first step is to understand the exact reason for rejection — this is stated in the rejection letter. Common reasons include insufficient funds, incomplete documentation, or ineligibility for the visa type applied for. A verified immigration professional can review your case and advise on the best path forward, whether that\'s an appeal, a fresh application, or applying for a different visa category.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I appeal a visa rejection in South Africa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'To appeal a South African visa or permit rejection, you must submit a formal review application to the Department of Home Affairs (DHA) within 10 days of receiving the rejection notice. The appeal must address each reason for rejection with supporting documentation. Appeals are complex and the success rate is significantly higher when handled by a registered immigration practitioner. ImmigrationAI connects you with verified professionals who specialise in visa appeals.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the requirements for a Critical Skills Visa in South Africa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Critical Skills Visa requires a South African qualification or foreign equivalent assessed by SAQA, proof that your occupation appears on the Critical Skills List published by the DHA, a valid job offer or proof of self-employment, a certificate of evaluation from the relevant professional body (e.g., ECSA for engineers, HPCSA for health professionals), a valid passport, medical certificate, radiological report, police clearance, and biometric data. Requirements change periodically — a verified immigration consultant can confirm the current list for your specific occupation.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does a South African work permit take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Processing times vary by permit type and volume at Home Affairs. A General Work Permit or Critical Skills Visa typically takes between 8 and 12 weeks from submission, but can take longer during high-demand periods. Corporate Permits for large employers may take up to 6 months. Intra-Company Transfer Permits are generally faster at 6–8 weeks. A qualified immigration consultant can help ensure your application is error-free, which significantly reduces delays caused by requests for additional information (ROI letters).',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I reapply for a South African visa immediately after rejection?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — unlike some countries, South Africa does not impose a mandatory waiting period before reapplication after a rejection. However, reapplying with the same incomplete documentation will result in another rejection. You must address every reason cited in the rejection letter before reapplying. Working with a professional to identify and fix the gaps is strongly recommended before submitting a new application.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I find a verified immigration consultant or lawyer in South Africa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All immigration practitioners in South Africa must be registered with the Immigration Practitioners Association of South Africa (IPASA) or hold a valid attorney\'s certificate. ImmigrationAI\'s directory lists only practitioners who have submitted their credentials for verification. You can search by visa type, city (Johannesburg, Cape Town, Pretoria, Durban), and language. Visit immigrationai.co.za/find-a-specialist to find a verified professional near you.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between a spousal visa and a life partner visa in South Africa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Spousal Visa is for foreign nationals legally married to a South African citizen or permanent resident. A Life Partner Visa is for those in a permanent same-sex or heterosexual relationship without legal marriage. Both allow the holder to live and work in South Africa, but the documentation required differs. The Life Partner Visa requires proof of a permanent partnership (cohabitation, financial co-dependency, etc.) rather than a marriage certificate. Both visas are initially valid for 2 years and are renewable.',
      },
    },
    {
      '@type': 'Question',
      name: 'What documents do I need for a South African study visa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For a South African Study Visa you need: an unconditional letter of acceptance from a registered South African educational institution, proof of payment of fees or a financial guarantee, a medical certificate and radiological report, police clearance from your country of origin, a valid passport (valid for at least 30 days beyond your intended departure), proof of medical cover, and completed BI-1739 application form. If you are under 18, parental consent (BI-829) and a birth certificate are also required.',
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

  // ─── Benefits (outcome-focused, no internal mechanism names) ──────────────
  const benefits = [
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Stop Losing Cases to Paperwork Errors',
      description:
        'The majority of South African visa rejections are caused by avoidable document mistakes. Our AI scans every case for errors, expired dates, and missing items before your client pays the price.',
      stat: '73%',
      statLabel: 'of SA visa rejections involve fixable errors',
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: 'Know Exactly What\'s Needed — Per Case',
      description:
        'No more generic checklists. Every case gets a tailored document list based on the specific visa type, nationality, employment history, and application route — automatically.',
      stat: '40%',
      statLabel: 'faster case preparation reported by practitioners',
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Never Be Caught Off-Guard by Regulation Changes',
      description:
        'South African immigration rules change without warning. Our system monitors all official government and VFS sources and alerts you the moment something changes that affects your active cases.',
      stat: '24h',
      statLabel: 'average time to alert on official source changes',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Know a Case\'s Chances Before You File',
      description:
        'Get a readiness score for every case before submission. Identify weak spots, missing documentation, and risk factors — so you submit with confidence, not hope.',
      stat: '87%',
      statLabel: 'average readiness score for approved applications',
    },
  ];

  // ─── Platform tools (outcome-focused) ────────────────────────────────────
  const platformFeatures = [
    {
      icon: <FolderOpen className="w-6 h-6" />,
      title: 'Full Case Lifecycle Management',
      description:
        'Track every case from the first inquiry to final approval. Deadlines, documents, status, team assignments — all in one place, with a complete audit trail.',
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
        'Clients track progress, upload documents, and message your team in real-time through their own secure portal — no WhatsApp or email needed.',
    },
    {
      icon: <CheckSquare className="w-6 h-6" />,
      title: 'Task Management & Deadlines',
      description:
        'Create and assign tasks against each case. Automated reminders ensure nothing slips through the cracks as submission deadlines approach.',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'VAC Appointment Tracking',
      description:
        'Track visa application centre availability and estimated wait times across Southern and Eastern Africa — right inside your case workflow.',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Practice Analytics',
      description:
        'See your success rates, average case duration, and workload distribution. Understand which visa types you\'re winning and where to focus.',
    },
  ];

  // ─── Audience cards (no internal details, no pricing) ─────────────────────
  const audiences = [
    {
      title: 'Immigration Agencies',
      icon: <Building className="w-8 h-8" />,
      color: 'from-[#0F2557] to-blue-700',
      points: [
        'Manage all your cases in one workspace',
        'AI catches errors before they cause rejections',
        'Your whole team collaborates on cases',
        'Clients get their own secure tracking portal',
        'Regulation change alerts keep you ahead',
        'Full practice analytics and reporting',
      ],
      cta: 'Start Free Trial',
      href: '/auth/signup',
    },
    {
      title: 'Solo Practitioners',
      icon: <Award className="w-8 h-8" />,
      color: 'from-amber-500 to-orange-500',
      points: [
        'Run your practice without the overhead',
        'AI tools that make you look like a team of five',
        'Client portal for document uploads and updates',
        'Rejection analysis to win resubmissions',
        'Join our verified professionals directory',
        'Receive matched client enquiries',
      ],
      cta: 'Start Free Trial',
      href: '/auth/signup',
    },
    {
      title: 'Visa Applicants',
      icon: <Globe className="w-8 h-8" />,
      color: 'from-green-500 to-teal-600',
      points: [
        'Visa rejected? Get expert help today',
        'Find a verified SA immigration specialist',
        'Filter by visa type, city, and language',
        'Track your application in real-time',
        'Secure document sharing with your consultant',
        'Direct messaging — no lost emails',
      ],
      cta: 'Find a Specialist',
      href: '/find-a-specialist',
    },
  ];

  // ─── Visa types (SEO keyword rich) ───────────────────────────────────────
  const visaTypes = [
    'Critical Skills Visa', 'General Work Permit', 'Business Visa',
    'Study Visa', 'Spousal / Life Partner Visa', 'Retired Person Visa',
    'Corporate Permit', 'Asylum / Refugee Status', 'Zimbabwe Exemption Permit',
    'Lesotho & eSwatini Exemption', 'SADC Permits', 'Intra-Company Transfer',
    'Visitor\'s Visa Extension', 'Permanent Residence', 'Appeals & Reviews',
  ];

  // ─── FAQ (targets high-volume search queries) ────────────────────────────
  const faqs = [
    {
      question: 'My South African visa was rejected — what can I do?',
      answer:
        'A rejection is not the end. Most rejections are the result of fixable documentation issues or eligibility gaps — not permanent bars. The first step is to understand the exact rejection reason stated in the letter. A verified immigration professional can review your case, identify the specific problem, and advise whether to appeal or reapply with corrected documentation.',
    },
    {
      question: 'How do I appeal a South African visa or permit rejection?',
      answer:
        'You have 10 days from the date of rejection to lodge a formal review with the Department of Home Affairs. The review must directly address each stated reason for rejection with supporting evidence. Appeals handled by a registered practitioner have a significantly higher success rate. Our directory can connect you with specialists who focus on visa appeals.',
    },
    {
      question: 'What documents are required for a Critical Skills Visa in South Africa?',
      answer:
        'Requirements include: proof your occupation is on the current Critical Skills List, a SAQA evaluation of your qualifications, a certificate from the relevant professional body (e.g. ECSA, HPCSA, SACAP), valid job offer or proof of self-employment, medical and radiological certificates, police clearance, and a valid passport. The list changes — always confirm current requirements with a qualified practitioner before applying.',
    },
    {
      question: 'How long does a South African work permit take to process?',
      answer:
        'A General Work Permit or Critical Skills Visa typically takes 8–12 weeks. Intra-Company Transfers are usually faster at 6–8 weeks. Corporate Permits for qualifying companies can take up to 6 months. Incomplete applications trigger a Request for Information letter which significantly extends the timeline — which is why error-checking before submission matters so much.',
    },
    {
      question: 'Can I reapply immediately after a South African visa rejection?',
      answer:
        'Yes. South Africa does not impose a waiting period between rejection and reapplication. However, reapplying with the same documentation will result in another rejection. Every reason stated in your rejection letter must be addressed with new supporting evidence before you resubmit.',
    },
    {
      question: 'How do I find a verified immigration consultant or lawyer in South Africa?',
      answer:
        'All practising immigration consultants must be registered with IPASA (Immigration Practitioners Association of South Africa) or hold a valid legal practising certificate. Our directory lists only professionals who have submitted credentials for verification. You can filter by visa type specialty, city (Johannesburg, Cape Town, Pretoria, Durban), and language.',
    },
    {
      question: 'Is this platform only for South African immigration?',
      answer:
        'The platform is built primarily for South African and SADC-region immigration. All AI tools, visa rules, and case logic are calibrated for South African DHA and VFS Global Africa requirements. We cover every South African visa category and all major SADC permit types.',
    },
    {
      question: 'What if immigration regulations change after I submit?',
      answer:
        'Our system continuously monitors all official government and VFS sources. When a change is detected, it immediately identifies which active cases may be affected and alerts the responsible practitioner — so you can adjust before the change causes a problem for your client.',
    },
  ];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-white">

        {/* ─── NAV ──────────────────────────────────────────────────────────── */}
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
                <a href="#visa-types" className="text-sm text-gray-600 hover:text-[#0F2557] font-medium transition-colors">Visa Types</a>
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
                  { href: '#visa-types', label: 'Visa Types' },
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

        {/* ─── HERO ─────────────────────────────────────────────────────────── */}
        <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0F2557] via-[#1a3570] to-[#0d1e45]">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 px-4 py-2 rounded-full mb-6 text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  Built for South Africa's Immigration Professionals
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Visa Rejected?
                  <span className="text-amber-400"> Application</span>
                  <br />Stalled?
                </h1>

                <p className="text-lg text-blue-100 mb-4 leading-relaxed max-w-xl">
                  Connect with a <strong className="text-white">verified South African immigration professional</strong> — or if you're a practitioner, run your entire practice with AI tools that prevent rejections before they happen.
                </p>

                <p className="text-sm text-blue-300 mb-8 max-w-xl">
                  Critical Skills Visa · Work Permits · Spousal Visas · Study Visas · Corporate Permits · Appeals & Rejections — all covered.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link
                    href="/find-a-specialist"
                    className="bg-amber-400 text-[#0F2557] px-8 py-4 rounded-xl text-base font-bold hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
                  >
                    Find a Specialist <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="border border-white/30 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    I'm a Professional
                  </Link>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-200">
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Verified professionals only</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> All SA visa categories</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Johannesburg · Cape Town · Durban · Pretoria</span>
                </div>
              </div>

              {/* Case readiness preview card */}
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
                    <p className="text-xs text-blue-200">Critical Skills Visa — ZA Application</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── VISA TYPE TICKER ─────────────────────────────────────────────── */}
        <section id="visa-types" className="bg-[#0a1d42] py-4 overflow-hidden">
          <div className="relative flex gap-8 whitespace-nowrap">
            <div className="flex gap-8 items-center animate-[marquee_30s_linear_infinite]">
              {[...visaTypes, ...visaTypes].map((v, i) => (
                <React.Fragment key={`${v}-${i}`}>
                  <span className="text-blue-300 text-sm font-medium">{v}</span>
                  <span className="text-amber-400 text-xs">·</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TRUST BAR ────────────────────────────────────────────────────── */}
        <section className="py-10 px-4 bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { stat: '15+', label: 'SA Visa Types Supported' },
              { stat: '100%', label: 'Verified Professionals' },
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

        {/* ─── FIND A SPECIALIST CTA (applicant capture) ────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-amber-50 border-b border-amber-100">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full mb-6 text-sm font-semibold">
              <Search className="w-4 h-4" />
              For Visa Applicants
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Visa Rejected? Don't Navigate This Alone.
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              South African immigration law is complex and changes frequently. A verified professional who knows your visa category can mean the difference between another rejection and a successful application.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/find-a-specialist"
                className="bg-[#0F2557] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#1a3570] transition-colors flex items-center justify-center gap-2 text-base"
              >
                Find a Verified Specialist <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/find-a-specialist"
                className="border-2 border-[#0F2557] text-[#0F2557] px-8 py-4 rounded-xl font-semibold hover:bg-[#0F2557]/5 transition-colors flex items-center justify-center gap-2 text-base"
              >
                <MapPin className="w-5 h-5" /> Search by City
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Available in Johannesburg · Cape Town · Pretoria · Durban · and across South Africa
            </p>
          </div>
        </section>

        {/* ─── HOW WE HELP (benefits / outcomes) ───────────────────────────── */}
        <section id="how-we-help" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4 text-sm font-semibold">
                <Bot className="w-4 h-4" /> For Immigration Professionals
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Built to Prevent Rejections,<br />Not Just Manage Cases
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Every case on ImmigrationAI benefits from AI that knows South African immigration law, works automatically in the background, and alerts you before problems become rejections.
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

        {/* ─── PLATFORM TOOLS ───────────────────────────────────────────────── */}
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
                Not just a case tracker — a complete operating system for immigration practitioners. From first inquiry to approval letter.
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

        {/* ─── THREE AUDIENCES ──────────────────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Who Uses ImmigrationAI?</h2>
              <p className="text-xl text-gray-600">Whether you're handling cases or going through one — we've got you.</p>
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

        {/* ─── PROFESSIONAL CTA (dark) ───────────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0F2557]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-4 py-2 rounded-full mb-6 text-sm font-semibold">
              <Star className="w-4 h-4" />
              For Immigration Professionals
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Run a Smarter Practice?
            </h2>
            <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
              Join South Africa's growing network of immigration professionals using AI to handle more cases, prevent rejections, and deliver better client outcomes.
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
              14-day free trial · No credit card · EFT payment only · Cancel anytime
            </p>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
        <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Common Questions About South African Visas
              </h2>
              <p className="text-xl text-gray-600">
                Answers to what immigration applicants and professionals ask most.
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
              <p className="text-gray-600 mb-4">Have a specific question about your situation?</p>
              <Link
                href="/find-a-specialist"
                className="inline-flex items-center gap-2 bg-[#0F2557] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1a3570] transition-colors"
              >
                Talk to a Verified Specialist <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
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
                  South Africa's AI-powered immigration platform. Connecting applicants with verified professionals and helping practitioners deliver better outcomes.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm">For Applicants</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/find-a-specialist" className="hover:text-white transition-colors">Find a Specialist</Link></li>
                  <li><Link href="/find-a-specialist" className="hover:text-white transition-colors">Visa Rejection Help</Link></li>
                  <li><Link href="/find-a-specialist" className="hover:text-white transition-colors">Critical Skills Visa</Link></li>
                  <li><Link href="/find-a-specialist" className="hover:text-white transition-colors">Work Permit Help</Link></li>
                  <li><Link href="/find-a-specialist" className="hover:text-white transition-colors">Spousal Visa Help</Link></li>
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

            {/* SEO footer keywords */}
            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-6 text-xs text-gray-600">
                {[
                  'Critical Skills Visa South Africa',
                  'Work Permit South Africa',
                  'Spousal Visa South Africa',
                  'Visa Rejection South Africa',
                  'Immigration Consultant Johannesburg',
                  'Immigration Consultant Cape Town',
                  'Immigration Consultant Pretoria',
                  'Business Visa South Africa',
                  'Study Visa South Africa',
                  'SADC Permits',
                  'Corporate Permit South Africa',
                  'Permanent Residence South Africa',
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
