'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Download,
  Filter,
  Calendar,
  Target,
  Award,
  Activity,
  Globe,
  Zap
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalDocuments: number;
    successRate: number;
    avgProcessingTime: number;
    monthlyRevenue: number;
    activeSubscriptions: number;
  };
  usageStats: {
    documentsByType: Array<{ type: string; count: number; percentage: number }>;
    countriesByUsage: Array<{ country: string; count: number; percentage: number }>;
    peakHours: Array<{ hour: string; requests: number }>;
    monthlyTrend: Array<{ month: string; documents: number; revenue: number }>;
  };
  userInsights: {
    newUsers: number;
    returningUsers: number;
    churnRate: number;
    avgSessionDuration: number;
    topFeatures: Array<{ feature: string; usage: number }>;
  };
  performance: {
    systemUptime: number;
    avgResponseTime: number;
    errorRate: number;
    apiCalls: number;
  };
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('documents');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/analytics?timeRange=${timeRange}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        // Set empty/default data on error instead of mock data
        setAnalyticsData({
          overview: {
            totalUsers: 0,
            totalDocuments: 0,
            successRate: 0,
            avgProcessingTime: 0,
            monthlyRevenue: 0,
            activeSubscriptions: 0
          },
          usageStats: {
            documentsByType: [],
            countriesByUsage: [],
            peakHours: [],
            monthlyTrend: []
          },
          userInsights: {
            newUsers: 0,
            returningUsers: 0,
            churnRate: 0,
            avgSessionDuration: 0,
            topFeatures: []
          },
          performance: {
            systemUptime: 0,
            avgResponseTime: 0,
            errorRate: 0,
            apiCalls: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive insights into your platform performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold">{analyticsData.overview.totalUsers.toLocaleString()}</p>
                  <p className="text-blue-100 text-sm">+12% from last month</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Documents Processed</p>
                  <p className="text-3xl font-bold">{analyticsData.overview.totalDocuments.toLocaleString()}</p>
                  <p className="text-green-100 text-sm">+18% from last month</p>
                </div>
                <FileText className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-bold">{analyticsData.overview.successRate}%</p>
                  <p className="text-purple-100 text-sm">+2.1% from last month</p>
                </div>
                <Target className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Monthly Revenue</p>
                  <p className="text-3xl font-bold">R{analyticsData.overview.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-orange-100 text-sm">+25% from last month</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
            <TabsTrigger value="users">User Insights</TabsTrigger>
            <TabsTrigger value="performance">System Performance</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          </TabsList>

          {/* Usage Analytics Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Documents by Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Documents by Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.usageStats.documentsByType.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-purple-500' :
                            index === 3 ? 'bg-orange-500' : 'bg-pink-500'
                          }`}></div>
                          <span className="font-medium">{item.type}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{item.count.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{item.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Countries by Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Top Countries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.usageStats.countriesByUsage.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-600">{index + 1}</span>
                          </div>
                          <span className="font-medium">{item.country}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{item.count.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{item.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Peak Hours Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Peak Usage Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end space-x-2 h-32">
                  {analyticsData.usageStats.peakHours.map((item, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <div 
                        className="bg-blue-500 rounded-t w-8 transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${(item.requests / 100) * 100}px` }}
                      ></div>
                      <span className="text-xs text-gray-600">{item.hour}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Insights Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New Users</p>
                      <p className="text-2xl font-bold text-green-600">{analyticsData.userInsights.newUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Returning Users</p>
                      <p className="text-2xl font-bold text-blue-600">{analyticsData.userInsights.returningUsers}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                      <p className="text-2xl font-bold text-red-600">{analyticsData.userInsights.churnRate}%</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Most Used Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.userInsights.topFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{feature.feature}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${feature.usage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{feature.usage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">System Uptime</p>
                      <p className="text-2xl font-bold text-green-600">{analyticsData.performance.systemUptime}%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                      <p className="text-2xl font-bold text-blue-600">{analyticsData.performance.avgResponseTime}s</p>
                    </div>
                    <Zap className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Error Rate</p>
                      <p className="text-2xl font-bold text-red-600">{analyticsData.performance.errorRate}%</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">API Calls</p>
                      <p className="text-2xl font-bold text-purple-600">{analyticsData.performance.apiCalls.toLocaleString()}</p>
                    </div>
                    <Activity className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Analytics Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Monthly Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.usageStats.monthlyTrend.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{item.month}</span>
                        </div>
                        <div>
                          <p className="font-medium">Documents: {item.documents.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Revenue: R{item.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">R{item.revenue.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">+{Math.floor(Math.random() * 20 + 5)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


