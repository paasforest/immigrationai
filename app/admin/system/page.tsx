'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  ArrowLeft, 
  RefreshCw, 
  Users,
  FileText,
  Zap,
  Database,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminSystemPage() {
  const router = useRouter();
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/system/health`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHealth(data.data);
          setError(null);
        } else {
          setError(data.message || 'Failed to load system health');
        }
      } else if (response.status === 403) {
        alert('Access Denied: Admin privileges required');
        router.push('/dashboard');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to fetch system health');
      }
    } catch (error: any) {
      console.error('Failed to fetch system health:', error);
      setError(error.message || 'Failed to fetch system health');
    } finally {
      setLoading(false);
    }
  };

  const getHealthBadge = (status: string) => {
    return status === 'healthy' ? (
      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Unhealthy</Badge>
    );
  };

  if (loading && !health) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading system health...</p>
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
              <Activity className="w-8 h-8 text-teal-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
                <p className="text-sm text-gray-600">Monitor system performance and uptime</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={fetchHealth} variant="outline">
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
              <Button onClick={fetchHealth} variant="outline" className="mt-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
        {health && !error && (
          <>
            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">{health.users?.total || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {health.users?.active24h || 0} active (24h)
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
                      <p className="text-sm font-medium text-gray-600">Total Documents</p>
                      <p className="text-3xl font-bold text-gray-900">{health.documents?.total || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {health.documents?.created24h || 0} created (24h)
                      </p>
                    </div>
                    <FileText className="w-12 h-12 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">API Success Rate</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {health.api?.successRate?.toFixed(1) || 100}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {health.api?.usage24h?.requests || 0} requests (24h)
                      </p>
                    </div>
                    <Zap className="w-12 h-12 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Database</p>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        {getHealthBadge(health.database?.status || 'unknown')}
                      </p>
                    </div>
                    <Database className="w-12 h-12 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* API Usage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>API Usage (Last 24 Hours)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Requests</span>
                      <span className="font-bold text-lg">{health.api?.usage24h?.requests || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Tokens Used</span>
                      <span className="font-bold text-lg">
                        {health.api?.usage24h?.tokens?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Cost (USD)</span>
                      <span className="font-bold text-lg">
                        ${(health.api?.usage24h?.cost || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Usage (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Requests</span>
                      <span className="font-bold text-lg">{health.api?.usage7d?.requests || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Tokens Used</span>
                      <span className="font-bold text-lg">
                        {health.api?.usage7d?.tokens?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Cost (USD)</span>
                      <span className="font-bold text-lg">
                        ${(health.api?.usage7d?.cost || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-semibold">
                      {health.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Auto-refresh</p>
                    <p className="font-semibold">Every 30 seconds</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

