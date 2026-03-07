'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, DollarSign, Compass, Target } from 'lucide-react';
import Link from 'next/link';
import PlatformKPIStrip from '@/components/admin/PlatformKPIStrip';
import { apiClient } from '@/lib/api/client';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [eligibilityInsights, setEligibilityInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    fetchEligibilityInsights();
  }, []);

  const fetchEligibilityInsights = async () => {
    try {
      setInsightsLoading(true);
      const res = await apiClient.get<any>('/api/admin/analytics/eligibility');
      if (res.success && res.data) setEligibilityInsights(res.data);
    } catch (error) {
      console.error('Failed to load eligibility analytics', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform overview and analytics</p>
          {user?.email && (
            <p className="text-sm text-gray-500 mt-1">Signed in as {user.email}</p>
          )}
        </div>

        <PlatformKPIStrip />

        {/* Eligibility Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Hot destinations</span>
                <Compass className="w-5 h-5 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eligibilityInsights?.topCountries?.length ? (
                <div className="space-y-4">
                  {eligibilityInsights.topCountries.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{item.country}</p>
                        <p className="text-sm text-gray-500">Last 30 days</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{item.checks}</p>
                        <p className="text-xs text-gray-500">checks logged</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  {insightsLoading ? 'Loading...' : 'No eligibility activity recorded yet.'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Latest applicant signals</span>
                <Target className="w-5 h-5 text-indigo-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eligibilityInsights?.recent?.length ? (
                <div className="space-y-4">
                  {eligibilityInsights.recent.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 border border-gray-100 rounded-2xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">
                          {item.country} • {item.visaType}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          item.verdict === 'likely'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.verdict === 'needs_more_info'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {item.verdict}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.summary}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  {insightsLoading ? 'Loading...' : 'No recent submissions.'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/payments">
                <span className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pending payments
                </span>
              </Link>
              <Link href="/admin/utm-analytics">
                <span className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  UTM analytics
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

