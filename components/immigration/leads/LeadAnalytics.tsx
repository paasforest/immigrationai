'use client';

import { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Card, CardContent } from '@/components/ui/card';
import { getCountryFlag } from '@/lib/utils/countryFlags';
import { TrendingUp, Calendar, Clock, CheckCircle2, Lightbulb, Link as LinkIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import LeadPerformanceChart from './LeadPerformanceChart';

export default function LeadAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsResponse, profileResponse] = await Promise.all([
        immigrationApi.getMyLeadStats(),
        immigrationApi.getMyProfile(),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      if (profileResponse.success) {
        setProfile(profileResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!stats) return null;

  const acceptanceRateColor =
    stats.acceptanceRate >= 60
      ? 'text-green-600'
      : stats.acceptanceRate >= 40
      ? 'text-amber-600'
      : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-[#0F2557]" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Acceptance Rate</p>
            <p className={`text-3xl font-bold ${acceptanceRateColor}`}>
              {stats.acceptanceRate}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalAccepted} accepted of {stats.totalLeadsReceived} received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-[#0F2557]" />
            </div>
            <p className="text-xs text-gray-600 mb-1">This Month</p>
            <p className="text-3xl font-bold text-[#0F2557]">{stats.leadsThisMonth}</p>
            <p className="text-xs text-green-600 mt-1">{stats.acceptedThisMonth} accepted</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-[#0F2557]" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Avg Response Time</p>
            <p className="text-3xl font-bold text-[#0F2557]">{stats.avgResponseHours.toFixed(1)}h</p>
            <p className="text-xs text-gray-500 mt-1">Time from assignment to response</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Total Handled</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalAccepted}</p>
            <p className="text-xs text-gray-500 mt-1">All time accepted</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {stats.leadsByMonth && stats.leadsByMonth.length > 0 && (
        <LeadPerformanceChart leadsByMonth={stats.leadsByMonth} />
      )}

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Services */}
        {stats.topServiceTypes && stats.topServiceTypes.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Your Most Common Services</h3>
              <div className="space-y-3">
                {stats.topServiceTypes.map((item: any, idx: number) => {
                  const maxCount = stats.topServiceTypes[0].count;
                  const width = (item.count / maxCount) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-600">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#0F2557] h-2 rounded-full"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Origins */}
        {stats.topOriginCountries && stats.topOriginCountries.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Where Your Clients Come From</h3>
              <div className="space-y-3">
                {stats.topOriginCountries.map((item: any, idx: number) => {
                  const maxCount = stats.topOriginCountries[0].count;
                  const width = (item.count / maxCount) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">
                          {getCountryFlag(item.country)} {item.country}
                        </span>
                        <span className="text-gray-600">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#0F2557] h-2 rounded-full"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Destinations */}
        {stats.topDestinations && stats.topDestinations.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Destinations You Cover Most</h3>
              <div className="space-y-3">
                {stats.topDestinations.map((item: any, idx: number) => {
                  const maxCount = stats.topDestinations[0].count;
                  const width = (item.count / maxCount) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">
                          {getCountryFlag(item.destination)} {item.destination}
                        </span>
                        <span className="text-gray-600">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#0F2557] h-2 rounded-full"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Improvement Tips */}
      <Card className="bg-amber-50 border border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-3">Tips to Receive More Leads</h3>
              <div className="space-y-2 text-sm text-amber-800">
                {stats.totalLeadsReceived === 0 && (
                  <p>
                    You have not received any leads yet. Make sure your specializations are
                    configured and isAcceptingLeads is on.{' '}
                    <Link
                      href="/dashboard/immigration/profile"
                      className="underline font-medium"
                    >
                      Set Up Specializations
                    </Link>
                  </p>
                )}
                {stats.acceptanceRate < 50 && stats.totalLeadsReceived > 0 && (
                  <p>
                    Your acceptance rate is below 50%. Consider expanding your available corridors
                    or increasing your lead capacity.
                  </p>
                )}
                {profile && !profile.isVerified && (
                  <p>
                    Get verified to receive significantly more leads. Upload your credentials in
                    your profile.{' '}
                    <Link
                      href="/dashboard/immigration/profile"
                      className="underline font-medium"
                    >
                      Get Verified
                    </Link>
                  </p>
                )}
                <p>Keep your response time under 12 hours for best results</p>
                <p>Profiles with bios receive more lead assignments</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
