'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, FileInput, DollarSign, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface KPIData {
  organizations: { total: number; active: number; trial: number };
  users: number;
  intakes: { total: number; last30d: number; converted: number };
  revenue: number;
}

export default function PlatformKPIStrip() {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/analytics/platform-kpis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) setData(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch platform KPIs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const kpis = [
    {
      label: 'Organizations',
      value: data.organizations.total,
      sub: `${data.organizations.trial} on trial`,
      icon: Building2,
      href: '/admin/organizations',
      color: 'text-blue-600',
    },
    {
      label: 'Users',
      value: data.users,
      sub: 'Total accounts',
      icon: Users,
      href: '/admin/users',
      color: 'text-indigo-600',
    },
    {
      label: 'Intakes',
      value: data.intakes.total,
      sub: `${data.intakes.last30d} last 30d · ${data.intakes.converted} converted`,
      icon: FileInput,
      href: '/admin/marketplace',
      color: 'text-emerald-600',
    },
    {
      label: 'Revenue',
      value: formatCurrency(data.revenue),
      sub: 'All-time completed',
      icon: DollarSign,
      href: '/admin/revenue',
      color: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const content = (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{kpi.value}</p>
                  {kpi.sub && <p className="text-xs text-gray-500 mt-1">{kpi.sub}</p>}
                </div>
                <Icon className={`w-8 h-8 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        );
        return kpi.href ? (
          <Link key={kpi.label} href={kpi.href}>
            {content}
          </Link>
        ) : (
          <div key={kpi.label}>{content}</div>
        );
      })}
    </div>
  );
}
