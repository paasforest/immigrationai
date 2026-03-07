'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Search,
  RefreshCw,
  Users,
  FileText,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

import { API_BASE_URL } from '@/lib/api/client';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  planStatus: string;
  trialEndsAt: string | null;
  billingEmail: string | null;
  country: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { users: number; cases: number; subscriptions: number };
}

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planStatusFilter, setPlanStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (search) params.append('search', search);
      if (planStatusFilter) params.append('planStatus', planStatusFilter);

      const res = await fetch(`${API_BASE_URL}/api/admin/organizations?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setOrgs(json.data.organizations);
          setTotalPages(json.data.pagination.totalPages);
          setTotal(json.data.pagination.total);
        }
      } else if (res.status === 403) {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Failed to fetch organizations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, [page, search, planStatusFilter]);

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
        <p className="text-gray-600 mt-1">Agencies and firms on the platform</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, slug, or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <select
              value={planStatusFilter}
              onChange={(e) => {
                setPlanStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="past_due">Past due</option>
            </select>
            <Button variant="outline" onClick={fetchOrgs} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All organizations ({total})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading...</div>
          ) : orgs.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No organizations found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="pb-3 font-medium">Organization</th>
                    <th className="pb-3 font-medium">Plan</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Users</th>
                    <th className="pb-3 font-medium">Cases</th>
                    <th className="pb-3 font-medium">Trial ends</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.map((org) => (
                    <tr key={org.id} className="border-b last:border-0 hover:bg-slate-50/50">
                      <td className="py-4">
                        <div>
                          <p className="font-medium text-gray-900">{org.name}</p>
                          <p className="text-gray-500 text-xs">{org.slug}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant="secondary">{org.plan}</Badge>
                      </td>
                      <td className="py-4">
                        <Badge
                          variant={
                            org.planStatus === 'active'
                              ? 'default'
                              : org.planStatus === 'trial'
                              ? 'outline'
                              : 'destructive'
                          }
                        >
                          {org.planStatus}
                        </Badge>
                      </td>
                      <td className="py-4">{org._count.users}</td>
                      <td className="py-4">{org._count.cases}</td>
                      <td className="py-4 text-gray-600">{formatDate(org.trialEndsAt)}</td>
                      <td className="py-4">
                        <Link href={`/admin/users?org=${org.slug}`}>
                          <Button variant="ghost" size="sm">
                            View <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
