'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ImmigrationCase, PaginatedResponse } from '@/types/immigration';
import { FolderOpen, Eye, Pencil } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const statusColors: Record<string, string> = {
  open: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  submitted: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  refused: 'bg-red-100 text-red-800',
  closed: 'bg-slate-100 text-slate-800',
};

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  normal: 'bg-gray-100 text-gray-800',
  low: 'bg-slate-100 text-slate-800',
};

const countryFlags: Record<string, string> = {
  'Nigeria': '🇳🇬',
  'UK': '🇬🇧',
  'United Kingdom': '🇬🇧',
  'Canada': '🇨🇦',
  'USA': '🇺🇸',
  'United States': '🇺🇸',
  'Germany': '🇩🇪',
  'UAE': '🇦🇪',
  'Australia': '🇦🇺',
};

function getCountryFlag(country: string | null): string {
  if (!country) return '';
  return countryFlags[country] || '';
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: string | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isOverdue(deadline: string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

interface CaseTableProps {
  cases: ImmigrationCase[];
  isLoading: boolean;
  pagination?: PaginatedResponse<ImmigrationCase>['pagination'];
  onPageChange?: (page: number) => void;
}

export default function CaseTable({ cases, isLoading, pagination, onPageChange }: CaseTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <FolderOpen className="w-16 h-16 mb-4" />
            <p className="text-xl font-medium mb-2">No cases found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const start = pagination ? (pagination.page - 1) * pagination.limit + 1 : 1;
  const end = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : cases.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Visa Type</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((caseItem) => {
                const originFlag = getCountryFlag(caseItem.originCountry);
                const destFlag = getCountryFlag(caseItem.destinationCountry);
                const overdue = isOverdue(caseItem.submissionDeadline);

                return (
                  <TableRow
                    key={caseItem.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => router.push(`/dashboard/immigration/cases/${caseItem.id}`)}
                  >
                    <TableCell className="font-mono font-semibold text-[#0F2557]">
                      {caseItem.referenceNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(caseItem.applicant?.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{caseItem.applicant?.fullName || 'No client'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{caseItem.visaType || 'N/A'}</TableCell>
                    <TableCell>
                      {originFlag && destFlag
                        ? `${originFlag} ${caseItem.originCountry} → ${destFlag} ${caseItem.destinationCountry}`
                        : `${caseItem.originCountry || 'N/A'} → ${caseItem.destinationCountry || 'N/A'}`}
                    </TableCell>
                    <TableCell>
                      {caseItem.assignedProfessional ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(caseItem.assignedProfessional.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {caseItem.assignedProfessional.fullName.split(' ')[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[caseItem.status] || statusColors.open}>
                        {caseItem.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[caseItem.priority] || priorityColors.normal}>
                        {caseItem.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className={overdue ? 'text-red-600 font-medium' : ''}>
                      {caseItem.submissionDeadline ? formatDate(caseItem.submissionDeadline) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/dashboard/immigration/cases/${caseItem.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // Placeholder for edit - will implement in Phase 3E
                            console.log('Edit case', caseItem.id);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4">
          <p className="text-sm text-gray-600">
            Showing {start}-{end} of {pagination.total} cases
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
