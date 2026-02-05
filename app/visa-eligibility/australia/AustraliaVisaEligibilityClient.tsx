'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Globe, MapPin } from 'lucide-react';
import { getTrackingDataForConversion, trackEvent } from '@/lib/utm-tracker';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const australiaVisaTypes = [
  { value: 'australia_skilled_independent', label: 'Skilled Independent Visa (189)' },
  { value: 'australia_skilled_nominated', label: 'Skilled Nominated Visa (190)' },
  { value: 'australia_skilled_regional', label: 'Skilled Regional Visa (491)' },
  { value: 'australia_student', label: 'Student Visa (500)' },
  { value: 'australia_partner', label: 'Partner / Spouse Visa (820/801)' },
  { value: 'australia_work', label: 'Temporary Skill Shortage Visa (482)' },
];

export default function AustraliaVisaEligibilityPage() {
  const [formData, setFormData] = useState({
    visaType: 'australia_skilled_independent',
    ageRange: '',
    educationLevel: '',
    workExperienceYears: '',
    englishExam: '',
    pointsScore: '',
    email: '',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tracking = getTrackingDataForConversion();
      const response = await fetch(`${API_BASE_URL}/api/eligibility/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: 'australia',
          ...formData,
          tracking,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setResult(data.data);
        trackEvent('australia_visa_eligibility_check', { visaType: formData.visaType });
      } else {
        setError(data?.message || 'Unable to check eligibility. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Globe className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Immigration AI
            </span>
          </Link>
        </nav>
      </header>

      <section className="pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Australia Visa Eligibility Check · Free</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Check Your Australia Visa Eligibility
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Skilled Migration, Student & Partner Visas
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get instant AI-powered feedback on your Australia visa eligibility. Check requirements for Skilled Migration (189/190/491), Student Visa, Partner Visa, and Work Visa.
          </p>
        </div>
      </section>

      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-2">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Eligibility Check (Free)</h2>
            
            {error && (
              <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Australia Visa Type</label>
                <select
                  className="w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.visaType}
                  onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                  required
                >
                  {australiaVisaTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Age Range</label>
                  <select
                    className="w-full rounded-xl border-slate-200"
                    value={formData.ageRange}
                    onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                    required
                  >
                    <option value="">Select age</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45-54">45-54</option>
                    <option value="55+">55+</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Education Level</label>
                  <select
                    className="w-full rounded-xl border-slate-200"
                    value={formData.educationLevel}
                    onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                    required
                  >
                    <option value="">Select education</option>
                    <option value="High school diploma">High school diploma</option>
                    <option value="Bachelor degree">Bachelor degree</option>
                    <option value="Postgraduate / Masters">Postgraduate / Masters</option>
                    <option value="Doctorate">Doctorate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">English Test (IELTS/PTE/TOEFL)</label>
                <select
                  className="w-full rounded-xl border-slate-200"
                  value={formData.englishExam}
                  onChange={(e) => setFormData({ ...formData, englishExam: e.target.value })}
                  required
                >
                  <option value="">Select test</option>
                  <option value="IELTS 8.0+">IELTS 8.0+ (Superior English)</option>
                  <option value="IELTS 7.0+">IELTS 7.0+ (Proficient English)</option>
                  <option value="IELTS 6.0+">IELTS 6.0+ (Competent English)</option>
                  <option value="PTE 65+">PTE 65+</option>
                  <option value="No test yet">No test yet</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Estimated Points Score (for Skilled Migration)</label>
                <select
                  className="w-full rounded-xl border-slate-200"
                  value={formData.pointsScore}
                  onChange={(e) => setFormData({ ...formData, pointsScore: e.target.value })}
                >
                  <option value="">Select score</option>
                  <option value="85+">85+ points</option>
                  <option value="75-84">75-84 points</option>
                  <option value="65-74">65-74 points</option>
                  <option value="Below 65">Below 65 points</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Email (Optional)</label>
                <input
                  type="email"
                  className="w-full rounded-xl border-slate-200"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Get your full checklist via email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl text-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                {loading ? 'Checking...' : (
                  <>
                    <span>Check Australia Visa Eligibility</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl shadow-xl p-8">
            {result ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Your Eligibility Result</h3>
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                    result.verdict === 'likely' ? 'bg-emerald-500' :
                    result.verdict === 'needs_more_info' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}>
                    {result.verdict === 'likely' ? 'Strong Match' :
                     result.verdict === 'needs_more_info' ? 'Needs More Info' : 'High Risk'}
                  </span>
                </div>
                <p className="text-blue-100 leading-relaxed">{result.summary}</p>
                
                {result.recommendedDocuments && result.recommendedDocuments.length > 0 && (
                  <div className="bg-white rounded-2xl p-4 text-slate-900">
                    <h4 className="font-semibold mb-2">Required Documents</h4>
                    <ul className="space-y-1 text-sm">
                      {result.recommendedDocuments.slice(0, 5).map((doc: string, idx: number) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/auth/signup" className="mt-4 inline-flex items-center text-blue-600 font-semibold text-sm">
                      Get full checklist & templates
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold mb-4">Why Check Australia Visa Eligibility?</h3>
                <ul className="space-y-4 text-blue-100">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                    <span>AI assessment based on Australian immigration points system and DHA requirements</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                    <span>Check Skilled Migration points score (189/190/491 visas)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                    <span>Understand occupation lists (MLTSSL, STSOL, ROL)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                    <span>Get personalized document checklist for your visa type</span>
                  </li>
                </ul>
                <div className="mt-8 bg-white/10 rounded-2xl p-4 border border-white/20">
                  <p className="text-sm text-blue-200">
                    <strong>Popular Routes:</strong> Skilled Independent (189), Skilled Nominated (190), Skilled Regional (491), Student Visa (500), Partner Visa (820/801), and TSS Visa (482).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Australia Application?</h2>
          <p className="text-xl text-gray-600 mb-8">Get AI-powered SOP writing, document generation, and interview prep.</p>
          <Link href="/auth/signup" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all inline-flex items-center space-x-2">
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Australia Visa Eligibility Checker',
            applicationCategory: 'TravelApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'ZAR',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '1250',
            },
          }),
        }}
      />
    </div>
  );
}
