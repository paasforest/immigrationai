'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  ArrowLeft, 
  RefreshCw, 
  DollarSign,
  Users,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminRevenuePage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const endDate = new Date();
      const startDate = new Date();
      
      if (range === '7d') startDate.setDate(endDate.getDate() - 7);
      else if (range === '30d') startDate.setDate(endDate.getDate() - 30);
      else startDate.setDate(endDate.getDate() - 90);

      const response = await fetch(
        `${API_BASE_URL}/api/admin/analytics/revenue?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.data);
        }
      } else if (response.status === 403) {
        alert('Access Denied: Admin privileges required');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch revenue analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading revenue analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <TrendingUp className="w-8 h-8 text-pink-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
                <p className="text-sm text-gray-600">Track revenue, MRR, and growth metrics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                className="rounded-lg border border-gray-200 p-2 bg-white"
                value={range}
                onChange={(e) => setRange(e.target.value as '7d' | '30d' | '90d')}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <Button onClick={fetchAnalytics} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Link href="/admin">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Admin Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(analytics.revenue?.mrr || 0)}
                      </p>
                    </div>
                    <DollarSign className="w-12 h-12 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {analytics.subscriptions?.active || 0}
                      </p>
                    </div>
                    <Users className="w-12 h-12 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue (Period)</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {analytics.revenue?.total && Array.isArray(analytics.revenue.total)
                          ? formatCurrency(
                              analytics.revenue.total.reduce(
                                (sum: number, item: any) => sum + (parseFloat(item.total_revenue) || 0) / 100,
                                0
                              )
                            )
                          : formatCurrency(0)}
                      </p>
                    </div>
                    <CreditCard className="w-12 h-12 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue by Plan */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.revenue?.total && Array.isArray(analytics.revenue.total) && analytics.revenue.total.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.revenue.total.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">
                            {item.plan} ({item.billing_cycle})
                          </p>
                          <p className="text-sm text-gray-600">{item.payment_count} payments</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency((parseFloat(item.total_revenue) || 0) / 100)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-600">No revenue data available</div>
                )}
              </CardContent>
            </Card>

            {/* Subscriptions by Plan */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Subscriptions by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.subscriptions?.byPlan && analytics.subscriptions.byPlan.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.subscriptions.byPlan.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">{item.plan}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-600">No subscription data available</div>
                )}
              </CardContent>
            </Card>

            {/* Subscriptions by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Subscriptions by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.subscriptions?.byStatus && analytics.subscriptions.byStatus.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.subscriptions.byStatus.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">{item.status}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-600">No status data available</div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

