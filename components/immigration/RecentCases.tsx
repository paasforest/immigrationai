'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { immigrationApi } from '@/lib/api/immigration';
import { ImmigrationCase } from '@/types/immigration';
import { FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

// Country flag emoji mapping
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
  // Add more as needed
};

function getCountryFlag(country: string | null): string {
  if (!country) return '';
  return countryFlags[country] || '';
}

function formatDeadline(deadline: string | null): { text: string; isOverdue: boolean } {
  if (!deadline) return { text: 'No deadline', isOverdue: false };
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diff = deadlineDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (days < 0) {
    return { text: `${Math.abs(days)} days ago`, isOverdue: true };
  } else if (days === 0) {
    return { text: 'Today', isOverdue: true };
  } else {
    return { text: `in ${days} days`, isOverdue: false };
  }
}

export default function RecentCases() {
  const router = useRouter();
  const [cases, setCases] = useState<ImmigrationCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setIsLoading(true);
        const response = await immigrationApi.getCases({}, 1, 5);
        if (response.success && response.data) {
          setCases(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch cases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
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
        <CardHeader>
          <CardTitle>Recent Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FolderOpen className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">No cases yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Cases</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/immigration/cases">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Deadline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((caseItem) => {
              const deadline = formatDeadline(caseItem.submissionDeadline);
              const originFlag = getCountryFlag(caseItem.originCountry);
              const destFlag = getCountryFlag(caseItem.destinationCountry);
              
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
                    {caseItem.applicant?.fullName || 'No client'}
                  </TableCell>
                  <TableCell>
                    {originFlag && destFlag
                      ? `${originFlag} ${caseItem.originCountry} → ${destFlag} ${caseItem.destinationCountry}`
                      : `${caseItem.originCountry || 'N/A'} → ${caseItem.destinationCountry || 'N/A'}`}
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
                  <TableCell className={deadline.isOverdue ? 'text-red-600 font-medium' : ''}>
                    {deadline.text}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
