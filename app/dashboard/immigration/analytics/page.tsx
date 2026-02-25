'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OverviewStats from '@/components/immigration/analytics/OverviewStats';
import CaseTrends from '@/components/immigration/analytics/CaseTrends';
import DestinationChart from '@/components/immigration/analytics/DestinationChart';
import ProfessionalTable from '@/components/immigration/analytics/ProfessionalTable';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && user.role !== 'org_admin') {
      router.push('/dashboard/immigration');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F2557]"></div>
      </div>
    );
  }

  if (!user || user.role !== 'org_admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Organization performance overview</p>
        <p className="text-sm text-gray-500 mt-1">Showing data for all time</p>
      </div>

      <OverviewStats />

      <CaseTrends />

      <DestinationChart />

      <ProfessionalTable />
    </div>
  );
}
