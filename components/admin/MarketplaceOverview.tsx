'use client';

import { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MarketplaceOverview() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.getRoutingStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!stats) return null;

  const matchRate =
    stats.totalIntakes > 0
      ? Math.round((stats.successfullyMatched / stats.totalIntakes) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Intakes</p>
                <p className="text-2xl font-bold text-[#0F2557]">{stats.totalIntakes}</p>
              </div>
              <FileText className="w-8 h-8 text-[#0F2557] opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Matched This Month</p>
                <p className="text-2xl font-bold text-green-600">{stats.intakesThisMonth}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">No Match Found</p>
                <p className="text-2xl font-bold text-amber-600">{stats.noMatchFound}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Active Professionals</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalActiveProfessionals}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Match Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Match Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-5xl font-bold text-[#0F2557] mb-2">{matchRate}%</p>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-[#0F2557] h-4 rounded-full"
                style={{ width: `${matchRate}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {stats.successfullyMatched} of {stats.totalIntakes} intakes successfully matched
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top Services */}
      {stats.topServices && stats.topServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topServices.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-gray-600">
                    {item.count} ({Math.round((item.count / stats.totalIntakes) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Corridors */}
      {stats.topCorridors && stats.topCorridors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Corridors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topCorridors.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.corridor}</span>
                  <span className="text-sm text-gray-600">
                    {item.count} ({Math.round((item.count / stats.totalIntakes) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Avg Match Attempts</p>
              <p className="text-2xl font-bold">{stats.averageMatchAttempts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold">{stats.averageResponseHours.toFixed(1)} hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
