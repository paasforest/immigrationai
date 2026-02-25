'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const referenceNumber = searchParams.get('ref') || '';
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referenceNumber);
    setCopied(true);
    toast.success('Reference number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto w-full">
        {/* Animated Checkmark */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-[scaleIn_0.4s_ease-out]">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </div>

        <style jsx>{`
          @keyframes scaleIn {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>

        <Card className="bg-white shadow-xl rounded-2xl">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-center mb-2">Request Submitted!</h1>
            <p className="text-gray-600 text-center mb-6">
              We're finding your specialist
            </p>

            {/* Reference Box */}
            <div className="bg-[#0F2557] bg-opacity-5 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-2 text-center">
                Your Reference Number
              </p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <p className="text-2xl font-mono text-[#0F2557] font-bold">{referenceNumber}</p>
                <button
                  onClick={copyToClipboard}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Copy"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <p className="text-xs text-gray-600 text-center">
                Save this to track your request
              </p>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">What happens next</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {/* Step 1 - Active */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-[#0F2557] rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Matching you with a specialist</p>
                  <p className="text-sm text-gray-600">Usually within a few hours</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-500 font-semibold">2</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-400">Specialist reviews your request</p>
                  <p className="text-sm text-gray-500">Within 24-48 hours</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-500 font-semibold">3</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-400">Specialist contacts you</p>
                  <p className="text-sm text-gray-500">Direct communication via email/phone</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-500 font-semibold">4</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-400">Work together on your case</p>
                  <p className="text-sm text-gray-500">Complete your immigration application</p>
                </div>
              </div>
            </div>

            {/* Email Note */}
            <div className="mt-6 p-4 bg-amber-50 rounded-lg flex items-start gap-2">
              <Mail className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                A confirmation has been sent to your email
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-6 space-y-3">
              <Button
                asChild
                className="w-full bg-[#0F2557] text-white"
              >
                <Link href={`/intake-status?ref=${referenceNumber}`}>
                  Check My Status
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
