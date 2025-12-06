'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Settings,
  BarChart3,
  Shield,
  ArrowLeft,
  Activity,
  Target,
  Compass,
  Globe
} from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [eligibilityInsights, setEligibilityInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchEligibilityInsights();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/payments/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsAdmin(true);
      } else if (response.status === 403) {
        alert('Access Denied: Admin privileges required');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Admin access check failed:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibilityInsights = async () => {
    try {
      setInsightsLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics/eligibility`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const payload = await response.json();
        setEligibilityInsights(payload.data);
      }
    } catch (error) {
      console.error('Failed to load eligibility analytics', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const adminFeatures = [
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Payment Verification",
      description: "Review and verify customer payments",
      href: "/admin/payments",
      color: "from-green-500 to-emerald-600",
      stats: "Pending verification"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "UTM Analytics",
      description: "Track marketing campaigns and traffic sources",
      href: "/admin/utm-analytics",
      color: "from-purple-500 to-violet-600",
      stats: "ProConnectSA tracking"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "User Management",
      description: "Manage users, subscriptions, and access",
      href: "/admin/users",
      color: "from-blue-500 to-cyan-600",
      stats: "Active users"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Document Analytics",
      description: "View document generation statistics",
      href: "/admin/documents",
      color: "from-orange-500 to-red-600",
      stats: "Document stats"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Revenue Analytics",
      description: "Track revenue, MRR, and growth metrics",
      href: "/admin/revenue",
      color: "from-pink-500 to-rose-600",
      stats: "Revenue tracking"
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: "System Health",
      description: "Monitor system performance and uptime",
      href: "/admin/system",
      color: "from-teal-500 to-green-600",
      stats: "System status"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Immigration AI Administration</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <Card className="mb-8 border-l-4 border-l-blue-600">
          <CardHeader>
            <CardTitle className="flex items-center">
              <LayoutDashboard className="w-6 h-6 mr-2 text-blue-600" />
              Welcome, Administrator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Access administrative tools and analytics to manage your Immigration AI platform.
              Select a feature below to get started.
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admin Role</p>
                  <p className="text-2xl font-bold text-gray-900">Active</p>
                </div>
                <Shield className="w-12 h-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admin Email</p>
                  <p className="text-lg font-semibold text-gray-900 truncate">{user?.email}</p>
                </div>
                <Users className="w-12 h-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Platform Status</p>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                </div>
                <Activity className="w-12 h-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Eligibility Checks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {eligibilityInsights?.totals?.totalChecks ?? (insightsLoading ? '—' : 0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {eligibilityInsights?.totals?.last24h
                      ? `${eligibilityInsights.totals.last24h} in last 24h`
                      : 'Awaiting first checks'}
                  </p>
                </div>
                <Globe className="w-12 h-12 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

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

        {/* Admin Features Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Administrative Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminFeatures.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{feature.stats}</span>
                      <span className="text-blue-600 text-sm font-medium group-hover:underline">
                        Open →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/admin/payments">
                <Button className="w-full" variant="outline">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Review Pending Payments
                </Button>
              </Link>
              <Link href="/admin/utm-analytics">
                <Button className="w-full" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View UTM Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

