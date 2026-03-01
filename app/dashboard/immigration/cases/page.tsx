'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { immigrationApi } from '@/lib/api/immigration';
import { ImmigrationCase, PaginatedResponse } from '@/types/immigration';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CaseFilters from '@/components/immigration/cases/CaseFilters';
import CaseTable from '@/components/immigration/cases/CaseTable';
import { Badge } from '@/components/ui/badge';

export default function CasesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cases, setCases] = useState<ImmigrationCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginatedResponse<ImmigrationCase>['pagination'] | undefined>();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const status = searchParams.get('status') || undefined;
  const visaType = searchParams.get('visaType') || undefined;
  const destination = searchParams.get('destination') || undefined;
  const priority = searchParams.get('priority') || undefined;
  const search = searchParams.get('search') || undefined;

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const filters = {
        ...(status && status !== 'all' && { status }),
        ...(visaType && visaType !== 'all' && { visaType }),
        ...(destination && destination !== 'all' && { destination }),
        ...(priority && priority !== 'all' && { priority }),
        ...(search && { search }),
      };

      const response = await immigrationApi.getCases(filters, page, 20);
      
      if (response.success && response.data) {
        setCases(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, visaType, destination, priority, search]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cases</h1>
          {pagination && (
            <p className="text-gray-600 mt-1">
              <Badge variant="secondary" className="mr-2">
                {pagination.total}
              </Badge>
              total cases
            </p>
          )}
        </div>
        <Button asChild>
          <Link href="/dashboard/immigration/cases/new">
            <Plus className="w-4 h-4 mr-2" />
            New Case
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <CaseFilters onFilterChange={fetchCases} />

      {/* Table */}
      <CaseTable
        cases={cases}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
