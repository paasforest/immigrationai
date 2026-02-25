'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import StatsCards from '@/components/immigration/StatsCards';
import RecentCases from '@/components/immigration/RecentCases';
import UpcomingDeadlines from '@/components/immigration/UpcomingDeadlines';
import QuickActions from '@/components/immigration/QuickActions';
import { Badge } from '@/components/ui/badge';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getPlanBadgeColor(plan: string): string {
  switch (plan) {
    case 'starter':
      return 'bg-gray-100 text-gray-800';
    case 'professional':
      return 'bg-blue-100 text-blue-800';
    case 'agency':
      return 'bg-[#0F2557] text-white';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function ImmigrationOverviewPage() {
  const { user } = useAuth();
  const { organization } = useOrganization();

  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {greeting}, {firstName}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          {organization && (
            <>
              <span className="text-gray-600">{organization.name}</span>
              <span className="text-gray-400">·</span>
              <Badge className={getPlanBadgeColor(organization.plan)}>
                {organization.plan.charAt(0).toUpperCase() + organization.plan.slice(1)}
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentCases />
        </div>
        <div className="lg:col-span-1">
          <UpcomingDeadlines />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
