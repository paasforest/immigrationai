'use client';

import React, { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { CaseStats } from '@/types/immigration';
import {
  FolderOpen,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const stats = [
  {
    key: 'total' as const,
    label: 'Total Cases',
    icon: FolderOpen,
    color: '#0F2557',
    bgColor: 'bg-[#0F2557]',
  },
  {
    key: 'inProgress' as const,
    label: 'In Progress',
    icon: Clock,
    color: '#2563eb',
    bgColor: 'bg-blue-600',
  },
  {
    key: 'submitted' as const,
    label: 'Submitted',
    icon: Send,
    color: '#F59E0B',
    bgColor: 'bg-amber-500',
  },
  {
    key: 'approved' as const,
    label: 'Approved',
    icon: CheckCircle,
    color: '#16a34a',
    bgColor: 'bg-green-600',
  },
  {
    key: 'refused' as const,
    label: 'Refused',
    icon: XCircle,
    color: '#dc2626',
    bgColor: 'bg-red-600',
  },
  {
    key: 'urgent' as const,
    label: 'Urgent',
    icon: AlertTriangle,
    color: '#ea580c',
    bgColor: 'bg-orange-500',
  },
];

export default function StatsCards() {
  const [statsData, setStatsData] = useState<CaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await immigrationApi.getCaseStats();
        if (response.success && response.data) {
          setStatsData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const value = statsData?.[stat.key] || 0;

        return (
          <Card key={stat.key} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </div>
                <div
                  className={`${stat.bgColor} rounded-full p-2 text-white`}
                  style={{ backgroundColor: stat.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ backgroundColor: stat.color }}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
