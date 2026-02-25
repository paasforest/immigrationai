'use client';

import { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2 } from 'lucide-react';

interface ProfessionalData {
  professionalId: string;
  name: string;
  activeCases: number;
  completedCases: number;
  approvalRate: number;
  avgCaseDuration: number;
}

type SortField = 'activeCases' | 'completedCases' | 'approvalRate' | 'avgCaseDuration';
type SortDirection = 'asc' | 'desc';

export default function ProfessionalTable() {
  const [data, setData] = useState<ProfessionalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('activeCases');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.getProfessionalPerformance();
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch professional performance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const getApprovalRateBadge = (rate: number) => {
    if (rate >= 70) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">{rate}%</Badge>;
    } else if (rate >= 50) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-300">{rate}%</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-300">{rate}%</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : sortedData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No team performance data yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Professional</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('activeCases')}
                >
                  Active Cases
                  {sortField === 'activeCases' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('completedCases')}
                >
                  Completed
                  {sortField === 'completedCases' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('approvalRate')}
                >
                  Approval Rate
                  {sortField === 'approvalRate' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('avgCaseDuration')}
                >
                  Avg Duration
                  {sortField === 'avgCaseDuration' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((prof) => (
                <TableRow key={prof.professionalId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0F2557] text-white flex items-center justify-center font-semibold text-sm">
                        {getInitials(prof.name)}
                      </div>
                      <span className="font-medium">{prof.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold">{prof.activeCases}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">{prof.completedCases}</span>
                  </TableCell>
                  <TableCell>{getApprovalRateBadge(prof.approvalRate)}</TableCell>
                  <TableCell>
                    <span className="text-gray-600">{prof.avgCaseDuration} days</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
