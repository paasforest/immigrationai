'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign,
  BarChart3,
  RefreshCw,
  Calendar,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function UTMAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics/utm`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

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
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totals = analytics?.totals || {};
  const bySource = analytics?.bySource || [];
  const byCampaign = analytics?.byCampaign || [];

  // Find ProConnectSA stats
  const proConnectSAStats = bySource.find((s: any) => s.utm_source === 'proconnectsa') || { signups: 0, conversions: 0, conversion_rate: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">UTM Analytics</h1>
              <p className="text-gray-600">
                Track marketing campaigns and traffic sources
              </p>
            </div>
            <Button onClick={fetchAnalytics} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tracked Signups</p>
                  <p className="text-3xl font-bold text-gray-900">{totals.total_tracked_users || 0}</p>
                </div>
                <Users className="w-12 h-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ProConnectSA Signups</p>
                  <p className="text-3xl font-bold text-purple-600">{proConnectSAStats.signups || 0}</p>
                </div>
                <Target className="w-12 h-12 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Conversions</p>
                  <p className="text-3xl font-bold text-green-600">{totals.total_conversions || 0}</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ProConnectSA Paid</p>
                  <p className="text-3xl font-bold text-orange-600">{proConnectSAStats.conversions || 0}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ProConnectSA Highlight */}
        <Card className="mb-8 border-l-4 border-l-purple-600">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-6 h-6 mr-2 text-purple-600" />
              ProConnectSA Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Signups</p>
                <p className="text-4xl font-bold text-purple-600">{proConnectSAStats.signups || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Paid Customers</p>
                <p className="text-4xl font-bold text-green-600">{proConnectSAStats.conversions || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Conversion Rate</p>
                <p className="text-4xl font-bold text-blue-600">{proConnectSAStats.conversion_rate || 0}%</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                💡 <strong>Tip:</strong> Add UTM parameters to ProConnectSA links to track more traffic. 
                See <code className="bg-purple-200 px-2 py-1 rounded">PROCONNECTSA_LINKS.md</code> for ready-to-use URLs.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* By Source */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Traffic by Source
                </span>
                <Badge>{bySource.length} sources</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bySource.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No tracking data yet</p>
                  <p className="text-sm">Signups with UTM parameters will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bySource.map((source: any, index: number) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 capitalize">
                            {source.utm_source || 'Direct'}
                          </span>
                          {source.utm_source === 'proconnectsa' && (
                            <Badge className="ml-2 bg-purple-100 text-purple-800">Your Business</Badge>
                          )}
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{source.signups}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Conversions: <span className="font-semibold">{source.conversions}</span>
                        </span>
                        <span className="text-green-600 font-semibold">
                          {source.conversion_rate}% conversion rate
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* By Campaign */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  By Campaign
                </span>
                <Badge>{byCampaign.length} campaigns</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {byCampaign.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No campaign data yet</p>
                  <p className="text-sm">Campaign tracking will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {byCampaign.map((campaign: any, index: number) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          {campaign.utm_campaign || 'Unnamed Campaign'}
                        </span>
                        <span className="text-2xl font-bold text-purple-600">{campaign.signups}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Conversions: <span className="font-semibold">{campaign.conversions}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">📊 Add Tracking to ProConnectSA</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Update ProConnectSA links with UTM parameters to track traffic
                </p>
                <code className="text-xs bg-blue-100 p-2 rounded block mb-2">
                  ?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration
                </code>
                <a 
                  href="https://immigrationai.co.za/PROCONNECTSA_LINKS.md" 
                  target="_blank"
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  View tracking URLs <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">✅ Test Tracking</h3>
                <p className="text-sm text-green-800 mb-3">
                  Test the tracking system with a signup
                </p>
                <code className="text-xs bg-green-100 p-2 rounded block mb-2">
                  immigrationai.co.za?utm_source=test
                </code>
                <p className="text-xs text-green-700">
                  Sign up and check if data appears above
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

