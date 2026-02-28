'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, CreditCard, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TrialExpiredWall() {
  return (
    <div className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Your Free Trial Has Ended
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Your 14-day free trial has expired. To continue using ImmigrationAI — including cases, leads, AI tools, and your client portal — please complete your payment.
        </p>

        {/* How to pay */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-left mb-6">
          <h2 className="font-semibold text-[#0F2557] mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            How to Activate Your Account
          </h2>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-[#0F2557] text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              Go to <strong className="mx-1">Billing</strong> to see your bank details and unique payment reference
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-[#0F2557] text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              Make an EFT payment using your reference number
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-[#0F2557] text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              Upload your proof of payment — we verify within 1 business day
            </li>
          </ol>
        </div>

        {/* Processing time note */}
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mb-6">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>Once verified, your account is activated immediately. EFTs typically reflect within 1–3 business days.</span>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/dashboard/immigration/billing">
            <Button className="w-full bg-[#0F2557] hover:bg-[#1a3570] text-white py-3 text-base">
              Go to Billing & Pay Now
            </Button>
          </Link>
          <a
            href="mailto:support@immigrationai.co.za"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#0F2557] transition-colors"
          >
            <Mail className="w-4 h-4" />
            Need help? Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
