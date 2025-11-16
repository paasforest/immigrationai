'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Target,
  TrendingUp,
  Users,
  MousePointerClick,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Filter,
  Download,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SourceAnalytics {
  source: string;
  medium: string;
  signups: number;
  conversions: number;
  conversionRate: number;
  lastSeen?: string;
}

interface CampaignAnalytics {
  campaign: string;
  source: string;
  medium: string;
  signups: number;
  conversions: number;
  lastSeen?: string;
}

interface MediumAnalytics {
  medium: string;
  signups: number;
  conversions: number;
  lastSeen?: string;
}

interface Analytics {
  totals: {
    totalSignups: number;
    totalConversions: number;
    totalSources: number;
    totalCampaigns: number;
    proconnectsaSignups: number;
    proconnectsaConversions: number;
  };
  bySource: SourceAnalytics[];
  byCampaign: CampaignAnalytics[];
  byMedium: MediumAnalytics[];
}

interface SessionItem {
  id: string;
  session_id?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  referrer?: string | null;
  landing_page?: string | null;
  ip_address?: string | null;
  created_at: string;
}

interface SessionStats {
  totalSessions: number;
  bySource: Array<{ utm_source: string | null; count: number }>;
  byCampaign: Array<{ utm_campaign: string | null; count: number }>;
}

export default function UTMAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const [utmRes, sessionsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/analytics/utm`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/admin/analytics/utm/sessions?limit=25`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/admin/analytics/utm/session-stats`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (!utmRes.ok || !sessionsRes.ok || !statsRes.ok) {
        if (utmRes.status === 403 || sessionsRes.status === 403 || statsRes.status === 403) {
          alert('Access Denied: Admin privileges required');
          router.push('/dashboard');
          return;
        }
        throw new Error('Failed to fetch analytics');
      }

      const [utmData, sessionsData, statsData] = await Promise.all([
        utmRes.json(),
        sessionsRes.json(),
        statsRes.json(),
      ]);
      if (utmData.success) setAnalytics(utmData.data);
      if (sessionsData.success) setSessions(sessionsData.data || []);
      if (statsData.success) setSessionStats(statsData.data);
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Target className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">UTM Analytics</h1>
                <p className="text-sm text-gray-600">Track marketing campaigns and traffic sources</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-l-4 border-l-red-600">
            <CardContent className="p-4">
              <p className="text-red-600">⚠️ {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Overview Stats */}
        {analytics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Signups</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.totals.totalSignups}</p>
                    </div>
                    <Users className="w-12 h-12 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Conversions</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.totals.totalConversions}</p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Traffic Sources</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.totals.totalSources}</p>
                    </div>
                    <MousePointerClick className="w-12 h-12 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.totals.totalCampaigns}</p>
                    </div>
                    <Target className="w-12 h-12 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ProConnectSA Highlight */}
            <Card className="mb-8 border-l-4 border-l-purple-600">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  ProConnectSA Campaign Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.bySource.find(s => s.source === 'proconnectsa') ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 font-semibold mb-2">✅ Campaign Active & Tracking</p>
                      <p className="text-gray-600">
                        Signups from ProConnectSA: <span className="font-bold text-blue-600">
                          {analytics.bySource.find(s => s.source === 'proconnectsa')?.signups || 0}
                        </span>
                      </p>
                      <p className="text-gray-600 text-sm">
                        Conversions: <span className="font-semibold text-green-600">
                          {analytics.totals.proconnectsaConversions}
                        </span>
                      </p>
                    </div>
                    <ExternalLink className="w-6 h-6 text-gray-400" />
                  </div>
                ) : (
                  <div>
                    <p className="text-yellow-600 font-semibold mb-2">⚠️ No ProConnectSA Traffic Yet</p>
                    <p className="text-gray-600 text-sm">
                      Add UTM parameters to ProConnectSA links to start tracking. Once users click those links and sign up, data will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Traffic by Source */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Traffic by Source</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.bySource.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.bySource.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              item.source === 'proconnectsa' ? 'bg-purple-600' : 'bg-blue-600'
                            }`} />
                            <div>
                              <p className="font-semibold text-gray-900 capitalize">{item.source || 'Direct'}</p>
                              <p className="text-sm text-gray-600">
                                Medium: {item.medium || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{item.signups}</p>
                          <p className="text-sm text-gray-600">signups</p>
                        </div>
                        <div className="text-right ml-6">
                          <p className="text-xl font-semibold text-green-600">{item.conversions}</p>
                          <p className="text-sm text-gray-600">conversions</p>
                          <p className="text-xs text-gray-500">{item.conversionRate?.toFixed(2)}% rate</p>
                        </div>
                        <div className="ml-6 text-right">
                          <p className="text-xs text-gray-500">Last seen</p>
                          <p className="text-xs text-gray-600">{formatDate(item.lastSeen)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No UTM tracking data yet</p>
                    <p className="text-sm text-gray-500 mt-2">Data will appear here once users sign up via UTM-tagged links</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.map((s) => (
                      <div key={s.id} className="p-3 bg-white border rounded-lg flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {(s.utm_source || 'direct')}{s.utm_campaign ? ` • ${s.utm_campaign}` : ''}{s.utm_medium ? ` • ${s.utm_medium}` : ''}
                          </p>
                          <p className="text-xs text-gray-600">
                            {s.landing_page || '—'} {s.referrer ? ` • Ref: ${(() => { try { return new URL(s.referrer || '').hostname; } catch { return s.referrer; } })()}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{formatDate(s.created_at)}</p>
                          <p className="text-[10px] text-gray-400">{s.session_id || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-600">
                    No session activity yet.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Stats */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Session Stats</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">{sessionStats.totalSessions}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Top Sources</p>
                      <div className="space-y-1 text-sm text-gray-800">
                        {sessionStats.bySource.slice(0, 5).map((x, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="capitalize">{x.utm_source || 'direct'}</span>
                            <span className="font-medium">{x.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Top Campaigns</p>
                      <div className="space-y-1 text-sm text-gray-800">
                        {sessionStats.byCampaign.slice(0, 5).map((x, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{x.utm_campaign || 'none'}</span>
                            <span className="font-medium">{x.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-600">
                    No stats yet.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Traffic by Campaign */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Traffic by Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.byCampaign.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.byCampaign.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.campaign || 'No Campaign'}</p>
                          <p className="text-sm text-gray-600">
                            Source: {item.source || 'N/A'} • Medium: {item.medium || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{item.signups}</p>
                          <p className="text-sm text-gray-600">signups</p>
                          <p className="text-sm text-green-600">{item.conversions} conversions</p>
                        </div>
                        <div className="ml-6 text-right">
                          <p className="text-xs text-gray-500">Last seen</p>
                          <p className="text-xs text-gray-600">{formatDate(item.lastSeen)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No campaign data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Traffic by Medium */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Traffic by Medium</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.byMedium.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.byMedium.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">{item.medium}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{item.signups}</p>
                          <p className="text-sm text-gray-600">signups</p>
                          <p className="text-sm text-green-600">{item.conversions} conversions</p>
                        </div>
                        <div className="ml-6 text-right">
                          <p className="text-xs text-gray-500">Last seen</p>
                          <p className="text-xs text-gray-600">{formatDate(item.lastSeen)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MousePointerClick className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No medium data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Setup Instructions */}
            <Card className="border-l-4 border-l-blue-600">
              <CardHeader>
                <CardTitle>How to Use UTM Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">📋 For ProConnectSA Links:</h3>
                    <code className="block bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=hero_button
                    </code>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">🎯 UTM Parameters:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li><strong>utm_source:</strong> Where traffic comes from (e.g., proconnectsa, facebook, google)</li>
                      <li><strong>utm_medium:</strong> Marketing medium (e.g., website, email, social)</li>
                      <li><strong>utm_campaign:</strong> Campaign name (e.g., immigration_integration)</li>
                      <li><strong>utm_content:</strong> Specific link/button (e.g., hero_button, footer_link)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">✅ What Gets Tracked:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li>When user clicks a UTM link, parameters are captured</li>
                      <li>When they sign up, data is saved to database</li>
                      <li>This dashboard shows all conversions by source/campaign</li>
                      <li>ProConnectSA traffic is highlighted separately</li>
                    </ul>
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
