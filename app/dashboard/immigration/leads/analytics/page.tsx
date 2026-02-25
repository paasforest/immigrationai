'use client';

import LeadAnalytics from '@/components/immigration/leads/LeadAnalytics';

export default function LeadAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lead Analytics</h1>
        <p className="text-gray-600 mt-1">Your performance and insights</p>
      </div>
      <LeadAnalytics />
    </div>
  );
}
