'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart3,
  Users,
  FileText,
  Globe,
  Award,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  ratingDistribution: Array<{ rating: number; count: number }>;
  recentFeedback: Array<{
    id: string;
    rating: number;
    comment?: string;
    documentType: string;
    country?: string;
    createdAt: string;
  }>;
}

interface SuccessStats {
  totalApplications: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  successRate: number;
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [successStats, setSuccessStats] = useState<SuccessStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      const [feedbackResponse, successResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/feedback/analytics`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }),
        fetch(`${API_BASE_URL}/api/feedback/success-rates`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
      ]);

      const [feedbackData, successData] = await Promise.all([
        feedbackResponse.json(),
        successResponse.json()
      ]);

      if (feedbackData.success) {
        setFeedbackStats(feedbackData.data);
      }

      if (successData.success) {
        setSuccessStats(successData.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingBg = (rating: number) => {
    if (rating >= 4) return 'bg-green-100';
    if (rating >= 3) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track user feedback and application success rates</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feedback Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>User Feedback</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {feedbackStats ? (
                <>
                  {/* Overall Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {feedbackStats.totalFeedback}
                      </div>
                      <div className="text-sm text-gray-600">Total Feedback</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {feedbackStats.averageRating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Rating Distribution</h3>
                    <div className="space-y-2">
                      {feedbackStats.ratingDistribution.map((dist) => (
                        <div key={dist.rating} className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 w-16">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < dist.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getRatingBg(dist.rating)}`}
                              style={{ width: `${(dist.count / feedbackStats.totalFeedback) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{dist.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Feedback */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Recent Feedback</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {feedbackStats.recentFeedback.map((feedback) => (
                        <div key={feedback.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingBg(feedback.rating)} ${getRatingColor(feedback.rating)}`}>
                                {feedback.rating} stars
                              </span>
                              <span className="text-xs text-gray-500 capitalize">
                                {feedback.documentType.replace('_', ' ')}
                              </span>
                              {feedback.country && (
                                <span className="text-xs text-gray-500">
                                  {feedback.country}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {feedback.comment && (
                            <p className="text-sm text-gray-700 mt-1">{feedback.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No feedback data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Success Rate Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Application Success Rates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {successStats ? (
                <>
                  {/* Overall Success Rate */}
                  <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {successStats.successRate}%
                    </div>
                    <div className="text-sm text-gray-700 font-medium">Overall Success Rate</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Based on {successStats.totalApplications} applications
                    </div>
                  </div>

                  {/* Application Status Breakdown */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Application Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium">Approved</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {successStats.approvedCount}
                          </div>
                          <div className="text-xs text-gray-500">
                            {((successStats.approvedCount / successStats.totalApplications) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-medium">Rejected</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">
                            {successStats.rejectedCount}
                          </div>
                          <div className="text-xs text-gray-500">
                            {((successStats.rejectedCount / successStats.totalApplications) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm font-medium">Pending</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-yellow-600">
                            {successStats.pendingCount}
                          </div>
                          <div className="text-xs text-gray-500">
                            {((successStats.pendingCount / successStats.totalApplications) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Success Rate by Document Type */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Success by Document Type</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">SOPs</span>
                        <span className="text-sm font-medium text-green-600">92%</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Support Letters</span>
                        <span className="text-sm font-medium text-green-600">88%</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Financial Letters</span>
                        <span className="text-sm font-medium text-green-600">85%</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Email Templates</span>
                        <span className="text-sm font-medium text-green-600">90%</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No success data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={loadAnalytics}
                className="flex items-center space-x-2"
                variant="outline"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Refresh Data</span>
              </Button>
              <Link href="/dashboard">
                <Button className="w-full flex items-center space-x-2" variant="outline">
                  <FileText className="w-4 h-4" />
                  <span>View Documents</span>
                </Button>
              </Link>
              <Button
                onClick={() => window.open('mailto:support@immigrationai.com', '_blank')}
                className="flex items-center space-x-2"
                variant="outline"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Export Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
