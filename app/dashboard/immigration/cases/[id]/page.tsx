'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { immigrationApi } from '@/lib/api/immigration';
import { ImmigrationCase } from '@/types/immigration';
import CaseHeader from '@/components/immigration/cases/detail/CaseHeader';
import CaseTabs from '@/components/immigration/cases/detail/CaseTabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id as string;
  const [caseData, setCaseData] = useState<ImmigrationCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCase();
  }, [caseId]);

  const fetchCase = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await immigrationApi.getCaseById(caseId);
      
      if (response.success && response.data) {
        setCaseData(response.data);
      } else {
        setError('Case not found');
      }
    } catch (err: any) {
      console.error('Failed to fetch case:', err);
      setError(err.message || 'Failed to load case');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Case not found</h2>
            <p className="text-gray-600 mb-6">{error || 'The case you are looking for does not exist.'}</p>
            <Button asChild>
              <Link href="/dashboard/immigration/cases">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cases
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <CaseHeader caseData={caseData} onUpdate={fetchCase} />
      <CaseTabs caseData={caseData} caseId={caseId} onRefresh={fetchCase} />
    </div>
  );
}
