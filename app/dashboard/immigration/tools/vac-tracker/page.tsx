'use client';

import VACTracker from '@/components/immigration/tools/VACTracker';

export default function VACTrackerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">VAC Appointment Tracker</h1>
        <p className="text-gray-600 mt-2">
          Find visa application centres and estimated wait times across Africa
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Data last updated — verify with official sources
        </p>
      </div>

      <VACTracker />
    </div>
  );
}
