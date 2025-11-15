'use client';

import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

const benefits = [
  'Unlimited access to AI document builders and reviewers',
  'Compliance-grade payment verification and admin tools',
  'Live analytics, UTM tracking, and affiliate-ready reporting',
];

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-3xl w-full bg-white border rounded-3xl shadow-lg px-8 py-12 text-center">
        <p className="text-blue-600 font-semibold uppercase tracking-wide mb-3">Subscriptions</p>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Choose a plan that meets your immigration goals</h1>
        <p className="text-slate-600 mb-8">
          Immigration AI offers Starter, Professional, and Enterprise plans. Compare features, usage limits, and admin
          capabilities on our pricing page or reach out for a custom enterprise quote.
        </p>
        <div className="grid gap-3 text-left mb-10">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-start gap-3 text-slate-700">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/20"
          >
            View Pricing
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <a
            href="mailto:hello@immigrationai.co.za"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-slate-200 text-slate-700 font-semibold bg-white hover:border-slate-300"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </div>
  );
}


