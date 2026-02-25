'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail } from 'lucide-react';
import Link from 'next/link';

interface TrialStepProps {
  organizationName?: string;
}

export default function TrialStep({ organizationName }: TrialStepProps) {
  const router = useRouter();
  const [showCheckmark, setShowCheckmark] = useState(false);

  useEffect(() => {
    // Animate checkmark
    setTimeout(() => setShowCheckmark(true), 300);
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
      {/* Checkmark Animation */}
      <div className="flex justify-center">
        <div
          className={`w-24 h-24 rounded-full bg-green-100 flex items-center justify-center transition-all duration-500 ${
            showCheckmark ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        >
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-4xl font-bold text-gray-900">
          Your 14-day trial is ready!
        </h2>
        {organizationName && (
          <p className="text-xl text-gray-600">
            Welcome, {organizationName}
          </p>
        )}
      </div>

      {/* What's Included */}
      <div className="bg-white rounded-lg border p-8 text-left max-w-md mx-auto">
        <h3 className="font-semibold text-lg mb-4">What's included:</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">Unlimited cases during trial</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">AI checklist generation</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">Document management</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">Team collaboration (up to 3 members)</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">Client portal</span>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="space-y-4 pt-4">
        <Button
          onClick={() => router.push('/dashboard/immigration')}
          size="lg"
          className="bg-[#0F2557] hover:bg-[#0a1d42] text-white px-12 py-6 text-lg"
        >
          Go to your Dashboard
        </Button>
        <div>
          <Link
            href="mailto:support@immigrationai.co.za"
            className="text-sm text-gray-600 hover:text-[#0F2557] flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Have a question? Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
