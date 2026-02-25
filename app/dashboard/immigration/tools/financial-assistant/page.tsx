'use client';

import React from 'react';
import FinancialAssistant from '@/components/immigration/tools/FinancialAssistant';

export default function FinancialAssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Documentation Assistant</h1>
        <p className="text-gray-600 mt-1">
          Get AI-powered analysis of your financial profile for visa applications
        </p>
      </div>

      <FinancialAssistant />
    </div>
  );
}
