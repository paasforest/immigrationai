'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Brain, ArrowRight, CheckCircle, Loader2,
  User, Mail, Phone, Globe, MapPin, FileText, AlertCircle,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.immigrationai.co.za';

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Bulgaria', 'Burundi',
  'Cambodia', 'Cameroon', 'Canada', 'Chile', 'China', 'Colombia', 'Congo (DRC)',
  'Côte d\'Ivoire', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Eritrea',
  'Estonia', 'Eswatini', 'Ethiopia', 'Finland', 'France', 'Gambia', 'Georgia',
  'Germany', 'Ghana', 'Greece', 'Guatemala', 'Guinea', 'Haiti', 'Honduras',
  'Hungary', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kosovo',
  'Kyrgyzstan', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Lithuania',
  'Madagascar', 'Malawi', 'Malaysia', 'Mali', 'Malta', 'Mauritania', 'Mauritius',
  'Mexico', 'Moldova', 'Morocco', 'Mozambique', 'Myanmar (Burma)',
  'Namibia', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria',
  'North Macedonia', 'Norway', 'Pakistan', 'Palestine', 'Panama', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Romania', 'Russia', 'Rwanda',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Sierra Leone', 'Singapore', 'Slovakia',
  'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Sweden',
  'Switzerland', 'Syria', 'Tanzania', 'Thailand', 'Tunisia', 'Turkey', 'Turkmenistan',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];

interface Service {
  id: string;
  name: string;
  description: string;
}

// Fallback services shown if the API returns empty (DB not yet seeded)
const FALLBACK_SERVICES: Service[] = [
  { id: 'visa-application', name: 'Visa Application', description: 'Expert assistance with visa applications for UK, Canada, USA, Germany, UAE and more' },
  { id: 'visa-appeal', name: 'Visa Appeal / Refusal', description: 'Professional representation for visa refusals and appeals' },
  { id: 'work-permit', name: 'Work Permit', description: 'Work permit and employment visa assistance' },
  { id: 'study-permit', name: 'Study Permit / Student Visa', description: 'Student visa and study permit applications' },
  { id: 'family-reunification', name: 'Family Reunification', description: 'Bring your family together through immigration' },
  { id: 'eu-verification', name: 'EU Free Movement / EEA Rights', description: 'EU citizenship verification and EEA family permit services' },
  { id: 'criminal-inadmissibility', name: 'Criminal Inadmissibility', description: 'Overcome criminal record barriers to immigration' },
  { id: 'police-clearance', name: 'Police Clearance Certificate', description: 'Obtain police clearance certificates for immigration purposes' },
];

type Step = 1 | 2 | 3;

export default function GetHelpPage() {
  const [step, setStep] = useState<Step>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    applicantCountry: '',
    destinationCountry: '',
    serviceId: '',
    urgencyLevel: 'normal',
    description: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/intake/services`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setServices(data.data);
        } else {
          // API returned empty — use fallback so the form stays functional
          setServices(FALLBACK_SERVICES);
        }
      })
      .catch(() => {
        // Network error — use fallback
        setServices(FALLBACK_SERVICES);
      })
      .finally(() => setLoadingServices(false));
  }, []);

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.applicantName.trim() || form.applicantName.trim().length < 2) e.applicantName = 'Please enter your full name';
    if (!form.applicantEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.applicantEmail)) e.applicantEmail = 'Please enter a valid email';
    if (!form.applicantCountry) e.applicantCountry = 'Please select your current country';
    if (!form.destinationCountry) e.destinationCountry = 'Please select your destination country';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.serviceId) e.serviceId = 'Please select a service type';
    if (!form.description.trim() || form.description.trim().length < 20) e.description = 'Please describe your situation in at least 20 characters';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/intake/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: form.serviceId,
          applicantName: form.applicantName,
          applicantEmail: form.applicantEmail,
          applicantPhone: form.applicantPhone || undefined,
          applicantCountry: form.applicantCountry,
          destinationCountry: form.destinationCountry,
          urgencyLevel: form.urgencyLevel,
          description: form.description,
          additionalData: {},
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReferenceNumber(data.data?.referenceNumber || 'INQ-SUBMITTED');
        setStep(3);
      } else {
        setError(data.message || data.error || 'Submission failed. Please try again.');
        if (data.errors) {
          setFieldErrors(data.errors);
        }
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2557] via-[#1a3570] to-[#0d1e45]">
      {/* Nav */}
      <header className="px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-[#0F2557]" />
            </div>
            <span className="text-white font-bold text-lg">ImmigrationAI</span>
          </Link>
          <Link href="/find-a-specialist" className="text-blue-200 text-sm hover:text-white transition-colors">
            Browse specialists →
          </Link>
        </div>
      </header>

      <main className="px-4 py-10 pb-20">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Get Immigration Help
            </h1>
            <p className="text-blue-200 text-lg max-w-xl mx-auto">
              Tell us what you need. We'll match you with a verified specialist who handles exactly your case type and destination country.
            </p>
          </div>

          {/* Step indicator */}
          {step < 3 && (
            <div className="flex items-center justify-center gap-3 mb-8">
              {[1, 2].map((s) => (
                <React.Fragment key={s}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step >= s ? 'bg-amber-400 text-[#0F2557]' : 'bg-white/10 text-white/50'
                  }`}>
                    {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  {s < 2 && <div className={`h-0.5 w-16 transition-colors ${step > s ? 'bg-amber-400' : 'bg-white/20'}`} />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ── STEP 1: About You ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#0F2557]" /> About You
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={form.applicantName}
                      onChange={(e) => set('applicantName', e.target.value)}
                      placeholder="Your full name"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2557] ${fieldErrors.applicantName ? 'border-red-400' : 'border-gray-200'}`}
                    />
                  </div>
                  {fieldErrors.applicantName && <p className="text-red-500 text-xs mt-1">{fieldErrors.applicantName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={form.applicantEmail}
                      onChange={(e) => set('applicantEmail', e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2557] ${fieldErrors.applicantEmail ? 'border-red-400' : 'border-gray-200'}`}
                    />
                  </div>
                  {fieldErrors.applicantEmail && <p className="text-red-500 text-xs mt-1">{fieldErrors.applicantEmail}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number <span className="text-gray-400">(optional)</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={form.applicantPhone}
                      onChange={(e) => set('applicantPhone', e.target.value)}
                      placeholder="+27 71 234 5678"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2557]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <MapPin className="inline w-3.5 h-3.5 mr-1" />Current Country *
                    </label>
                    <select
                      value={form.applicantCountry}
                      onChange={(e) => set('applicantCountry', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2557] bg-white ${fieldErrors.applicantCountry ? 'border-red-400' : 'border-gray-200'}`}
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {fieldErrors.applicantCountry && <p className="text-red-500 text-xs mt-1">{fieldErrors.applicantCountry}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Globe className="inline w-3.5 h-3.5 mr-1" />Destination Country *
                    </label>
                    <select
                      value={form.destinationCountry}
                      onChange={(e) => set('destinationCountry', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2557] bg-white ${fieldErrors.destinationCountry ? 'border-red-400' : 'border-gray-200'}`}
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {fieldErrors.destinationCountry && <p className="text-red-500 text-xs mt-1">{fieldErrors.destinationCountry}</p>}
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full bg-[#0F2557] text-white py-3.5 rounded-xl font-semibold hover:bg-[#1a3570] transition-colors flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Your Case ─────────────────────────────────────────── */}
          {step === 2 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0F2557]" /> Your Immigration Case
              </h2>
              <div className="space-y-5">
                {/* Service type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What do you need help with? *</label>
                  {loadingServices ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm py-3">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading services…
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-2">
                      {services.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => set('serviceId', s.id)}
                          className={`text-left p-3 rounded-xl border-2 transition-all text-sm ${
                            form.serviceId === s.id
                              ? 'border-[#0F2557] bg-blue-50 text-[#0F2557] font-semibold'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <div className="font-medium">{s.name}</div>
                          {s.description && (
                            <div className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{s.description}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {fieldErrors.serviceId && <p className="text-red-500 text-xs mt-1">{fieldErrors.serviceId}</p>}
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How urgent is your situation?</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: 'low', label: 'Not urgent', color: 'green' },
                      { value: 'normal', label: 'Normal', color: 'blue' },
                      { value: 'high', label: 'Urgent', color: 'orange' },
                      { value: 'critical', label: 'Critical / Deadline', color: 'red' },
                    ].map((u) => (
                      <button
                        key={u.value}
                        onClick={() => set('urgencyLevel', u.value)}
                        className={`px-4 py-2 rounded-lg text-sm border-2 transition-all font-medium ${
                          form.urgencyLevel === u.value
                            ? 'border-[#0F2557] bg-[#0F2557] text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Describe your situation *
                    <span className="text-gray-400 font-normal ml-1">(min. 20 characters)</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    rows={5}
                    placeholder="E.g. I applied for a UK Skilled Worker visa and was rejected due to a documentation issue. My employer has an approved sponsor licence. I need help with the reapplication..."
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2557] resize-none leading-relaxed ${fieldErrors.description ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {fieldErrors.description
                      ? <p className="text-red-500 text-xs">{fieldErrors.description}</p>
                      : <span />}
                    <span className="text-xs text-gray-400">{form.description.length} chars</span>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-[2] bg-amber-400 text-[#0F2557] py-3.5 rounded-xl font-bold hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                    ) : (
                      <>Submit Request <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Success ───────────────────────────────────────────── */}
          {step === 3 && (
            <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
              <p className="text-gray-600 mb-6 leading-relaxed max-w-sm mx-auto">
                Your inquiry has been received. A verified specialist who handles your case type and destination will be notified and will reach out shortly.
              </p>

              {referenceNumber && (
                <div className="bg-slate-50 rounded-xl p-4 mb-6 inline-block">
                  <p className="text-xs text-gray-500 mb-1">Your reference number</p>
                  <p className="text-xl font-bold text-[#0F2557] tracking-wider">{referenceNumber}</p>
                  <p className="text-xs text-gray-400 mt-1">Save this — you'll need it to track your request</p>
                </div>
              )}

              <div className="space-y-3 text-left bg-blue-50 rounded-xl p-4 mb-6 max-w-sm mx-auto">
                <p className="text-sm font-semibold text-[#0F2557] mb-2">What happens next:</p>
                {[
                  'Your request is matched to verified specialists',
                  'A specialist reviews your case and accepts',
                  'You receive an email with your specialist\'s details',
                  'Your secure client portal opens for document sharing',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-[#0F2557] text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/find-a-specialist"
                  className="bg-[#0F2557] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1a3570] transition-colors text-sm"
                >
                  Browse Specialists Yourself
                </Link>
                <Link
                  href="/"
                  className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          {/* Trust footer */}
          {step < 3 && (
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-sm text-blue-200">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Free to submit</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Verified specialists only</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> No obligation</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
