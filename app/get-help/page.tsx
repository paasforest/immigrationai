'use client';

import { CheckCircle } from 'lucide-react';
import ServiceGrid from '@/components/intake/ServiceGrid';

export default function GetHelpPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            ✦ Free Matching Service
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Find Your Immigration Specialist
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Tell us what you need. We'll match you with a verified professional who specializes in
            your exact situation — at no cost to you.
          </p>

          {/* Trust Row */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Verified Specialists Only</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">African Corridors Expertise</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Free Matching — No Hidden Fees</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">
            What do you need help with?
          </h2>
          <p className="text-gray-600 text-center mb-12">Select a service to get started</p>
          <ServiceGrid />
        </div>
      </div>
    </div>
  );
}
