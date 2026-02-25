'use client';

import React from 'react';
import Link from 'next/link';
import { ImmigrationCase } from '@/types/immigration';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Upload } from 'lucide-react';

const statusLabels: Record<string, { label: string; emoji: string; progress: number }> = {
  open: { label: 'Getting Started', emoji: '📋', progress: 10 },
  in_progress: { label: 'In Progress', emoji: '⚙️', progress: 50 },
  submitted: { label: 'Application Submitted', emoji: '✓', progress: 80 },
  approved: { label: 'Approved!', emoji: '🎉', progress: 100 },
  refused: { label: 'Unfortunately Refused', emoji: '❌', progress: 0 },
  closed: { label: 'Closed', emoji: '🔒', progress: 100 },
};

const countryFlags: Record<string, string> = {
  'Nigeria': '🇳🇬',
  'United Kingdom': '🇬🇧',
  'Canada': '🇨🇦',
  'United States': '🇺🇸',
  'Germany': '🇩🇪',
  'UAE': '🇦🇪',
  'Australia': '🇦🇺',
};

function getCountryFlag(country: string | null): string {
  if (!country) return '';
  return countryFlags[country] || '';
}

function getDaysRemaining(deadline: string | null): { text: string; isUrgent: boolean } {
  if (!deadline) return { text: 'No deadline set', isUrgent: false };
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diff = deadlineDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (days < 0) {
    return { text: 'Overdue', isUrgent: true };
  } else if (days === 0) {
    return { text: 'Due today', isUrgent: true };
  } else if (days <= 7) {
    return { text: `${days} days remaining`, isUrgent: true };
  } else {
    return { text: `${days} days remaining`, isUrgent: false };
  }
}

interface PortalCaseCardProps {
  caseData: ImmigrationCase;
}

export default function PortalCaseCard({ caseData }: PortalCaseCardProps) {
  const statusInfo = statusLabels[caseData.status] || statusLabels.open;
  const deadline = getDaysRemaining(caseData.submissionDeadline);
  const originFlag = getCountryFlag(caseData.originCountry);
  const destFlag = getCountryFlag(caseData.destinationCountry);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{caseData.title}</h3>
            <p className="text-sm text-gray-500 font-mono">{caseData.referenceNumber}</p>
          </div>

          {/* Status */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{statusInfo.emoji}</span>
              <span className="font-semibold text-lg">{statusInfo.label}</span>
            </div>
            <Progress value={statusInfo.progress} className="h-2" />
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{caseData.visaType || 'N/A'}</Badge>
              <span className="text-gray-600">
                {originFlag} {caseData.originCountry} → {destFlag} {caseData.destinationCountry}
              </span>
            </div>

            {caseData.assignedProfessional && (
              <p className="text-gray-600">
                <span className="font-medium">Your consultant:</span> {caseData.assignedProfessional.fullName}
              </p>
            )}

            {caseData.submissionDeadline && (
              <p className={deadline.isUrgent ? 'text-red-600 font-medium' : 'text-gray-600'}>
                <span className="font-medium">Submission deadline:</span> {deadline.text}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button asChild variant="default" className="flex-1 bg-[#0F2557] hover:bg-[#0a1d42]">
              <Link href={`/portal/cases/${caseData.id}`}>
                View Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/portal/cases/${caseData.id}?tab=documents`}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
