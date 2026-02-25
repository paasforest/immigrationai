'use client';

import CredentialEvaluator from '@/components/immigration/tools/CredentialEvaluator';

export default function CredentialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Credential Evaluation Guide</h1>
        <p className="text-gray-600 mt-2">
          Check how African qualifications are recognised internationally and get a personalised
          evaluation roadmap
        </p>
      </div>

      <div className="bg-[#0F2557] text-white rounded-lg p-4">
        <p className="text-sm">
          This tool covers 14 major African universities and attestation processes for 8 African
          countries
        </p>
      </div>

      <CredentialEvaluator />
    </div>
  );
}
