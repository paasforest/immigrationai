'use client';

import MarketplaceOverview from '@/components/admin/MarketplaceOverview';

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marketplace Overview</h1>
        <p className="text-gray-600 mt-1">Platform-wide intake and routing statistics</p>
        <p className="text-sm text-gray-500 mt-1">Showing data for all time</p>
      </div>
      <MarketplaceOverview />
    </div>
  );
}
