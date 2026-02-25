'use client';

import { useSearchParams } from 'next/navigation';
import StatusChecker from '@/components/intake/StatusChecker';

export default function IntakeStatusPage() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-3">
          Check Your Request Status
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Enter your reference number and email address
        </p>
        <StatusChecker initialRef={initialRef} />
      </div>
    </div>
  );
}
