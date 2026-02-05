'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, MapPin, ArrowRight, CheckCircle } from 'lucide-react';

export default function SingaporeVisaEligibilityClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-red-100">
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
          <div className="inline-flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-full mb-6">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Singapore Visa Eligibility Check</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Check Your Singapore Visa Eligibility
            <span className="block mt-2 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Employment Pass, S Pass & Student Pass
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Free eligibility check — no sign-up required. Get instant AI-powered feedback for Employment Pass, S Pass, Student Pass, Dependent Pass, and EntrePass.
          </p>
        </div>
      </section>
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Popular Singapore Visa Routes</h2>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Employment Pass (EP)</strong> - For professionals, managers, and executives with job offers</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>S Pass</strong> - For mid-level skilled workers</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Student Pass</strong> - For international students at Singapore institutions</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Dependent Pass</strong> - For dependents of EP/S Pass holders</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <span className="text-gray-700"><strong>Entrepreneur Pass (EntrePass)</strong> - For entrepreneurs starting businesses in Singapore</span>
              </li>
            </ul>
          </div>
          <div className="text-center">
            <Link href="/" className="bg-gradient-to-r from-red-600 to-red-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all inline-flex items-center space-x-2">
              <span>Check Singapore Visa Eligibility (Free)</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Singapore Visa Eligibility Checker',
            applicationCategory: 'TravelApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'ZAR' },
          }),
        }}
      />
    </div>
  );
}
