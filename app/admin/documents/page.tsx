'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  ArrowLeft, 
  RefreshCw, 
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminDocumentsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const endDate = new Date();
      const startDate = new Date();
      
      if (range === '7d') startDate.setDate(endDate.getDate() - 7);
      else if (range === '30d') startDate.setDate(endDate.getDate() - 30);
      else startDate.setDate(endDate.getDate() - 90);

      const response = await fetch(
        `${API_BASE_URL}/api/admin/analytics/documents?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
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
          setError(null);
        } else {
          setError(data.message || 'Failed to load analytics');
        }
      } else if (response.status === 403) {
        alert('Access Denied: Admin privileges required');
        router.push('/dashboard');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to fetch document analytics');
      }
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      setError(error.message || 'Failed to fetch document analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading document analytics...</p>
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
              <FileText className="w-8 h-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Document Analytics</h1>
                <p className="text-sm text-gray-600">View document generation statistics</p>
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
        {error && (
          <Card className="mb-6 border-l-4 border-l-red-600">
            <CardContent className="p-4">
              <p className="text-red-600">⚠️ {error}</p>
              <Button onClick={fetchAnalytics} variant="outline" className="mt-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
        {analytics && !error && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Documents</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.totals.totalDocuments}</p>
                    </div>
                    <FileText className="w-12 h-12 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Document Types</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.byType?.length || 0}</p>
                    </div>
                    <BarChart3 className="w-12 h-12 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Status Types</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.byStatus?.length || 0}</p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Documents by Type */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Documents by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.byType && analytics.byType.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.byType.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">{item.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                          <p className="text-sm text-gray-600">
                            {analytics.totals.totalDocuments > 0
                              ? Math.round((item.count / analytics.totals.totalDocuments) * 100)
                              : 0}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-600">No document type data available</div>
                )}
              </CardContent>
            </Card>

            {/* Documents by Status */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Documents by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.byStatus && analytics.byStatus.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.byStatus.map((item: any, index: number) => (
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

            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.recentDocuments && analytics.recentDocuments.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.recentDocuments.map((doc: any) => (
                      <div key={doc.id} className="p-3 bg-white border rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{doc.type}</p>
                          <p className="text-sm text-gray-600">
                            {doc.user?.email} • {doc.title || 'Untitled'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(doc.createdAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">{doc.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-600">No recent documents</div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

