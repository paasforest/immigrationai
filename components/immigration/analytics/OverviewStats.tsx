'use client';

import { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, MapPin, Clock } from 'lucide-react';

interface OverviewData {
  casesThisMonth: number;
  casesLastMonth: number;
  monthOverMonthGrowth: number;
  approvalRate: number;
  averageCaseDuration: number;
  activeClients: number;
}

export default function OverviewStats() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.getOverviewAnalytics();
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch overview analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getApprovalRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Cases This Month */}
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 mb-1">Cases This Month</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{data.casesThisMonth}</p>
            {data.monthOverMonthGrowth !== 0 && (
              <div
                className={`flex items-center gap-1 text-sm ${
                  data.monthOverMonthGrowth > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {data.monthOverMonthGrowth > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{Math.abs(data.monthOverMonthGrowth)}%</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">vs last month</p>
        </CardContent>
      </Card>

      {/* Approval Rate */}
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 mb-1">Approval Rate</p>
          <p className={`text-3xl font-bold ${getApprovalRateColor(data.approvalRate)}`}>
            {data.approvalRate}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Based on decided cases
          </p>
        </CardContent>
      </Card>

      {/* Active Clients */}
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 mb-1">Active Clients</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{data.activeClients}</p>
            <MapPin className="w-5 h-5 text-[#0F2557]" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Unique applicants with open cases</p>
        </CardContent>
      </Card>

      {/* Avg Case Duration */}
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 mb-1">Avg Case Duration</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{data.averageCaseDuration}</p>
            <Clock className="w-5 h-5 text-[#0F2557]" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Days from case open to decision</p>
        </CardContent>
      </Card>
    </div>
  );
}
