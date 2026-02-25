'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ImmigrationCase } from '@/types/immigration';
import { immigrationApi } from '@/lib/api/immigration';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { toast } from 'sonner';

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

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getDaysRemaining(deadline: string | null): { text: string; color: string } {
  if (!deadline) return { text: 'No deadline', color: 'text-gray-600' };
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diff = deadlineDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (days < 0) {
    return { text: 'Overdue', color: 'text-red-600' };
  } else if (days <= 3) {
    return { text: `${days} days remaining`, color: 'text-red-600' };
  } else {
    return { text: `${days} days remaining`, color: 'text-green-600' };
  }
}

interface CaseHeaderProps {
  caseData: ImmigrationCase;
  onUpdate: () => void;
}

export default function CaseHeader({ caseData, onUpdate }: CaseHeaderProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      const response = await immigrationApi.updateCase(caseData.id, { status: newStatus as any });
      
      if (response.success) {
        toast.success('Case status updated');
        onUpdate();
      } else {
        toast.error(response.error || 'Failed to update status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const deadline = getDaysRemaining(caseData.submissionDeadline);
  const originFlag = caseData.originCountry ? '🇳🇬' : ''; // Simplified - would use proper mapping
  const destFlag = caseData.destinationCountry ? '🇬🇧' : '';

  return (
    <div className="space-y-4">
      {/* Top row - Back link and Reference */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/immigration/cases">
            <ArrowLeft className="w-4 h-4 mr-2" />
            All Cases
          </Link>
        </Button>
        <div className="font-mono text-lg font-semibold text-[#0F2557]">
          {caseData.referenceNumber}
        </div>
      </div>

      {/* Main header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left section */}
            <div className="flex-1 space-y-4">
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {caseData.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline">{caseData.visaType || 'N/A'}</Badge>
                <span className="text-gray-600">
                  {originFlag} {caseData.originCountry} → {destFlag} {caseData.destinationCountry}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {caseData.assignedProfessional && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(caseData.assignedProfessional.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{caseData.assignedProfessional.fullName}</p>
                      <p className="text-xs text-gray-500">Assigned Professional</p>
                    </div>
                  </div>
                )}

                {caseData.applicant ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(caseData.applicant.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{caseData.applicant.fullName}</p>
                      <p className="text-xs text-gray-500">Client</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No client linked</div>
                )}
              </div>
            </div>

            {/* Right section */}
            <div className="flex flex-col gap-4 lg:items-end">
              <div className="flex items-center gap-3">
                <Select
                  value={caseData.status}
                  onValueChange={handleStatusChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="refused">Refused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Badge className={priorityColors[caseData.priority] || priorityColors.normal}>
                {caseData.priority}
              </Badge>

              {caseData.submissionDeadline && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Submission Deadline</p>
                  <p className={`text-sm font-medium ${deadline.color}`}>
                    {deadline.text}
                  </p>
                </div>
              )}

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle>Edit Case</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Edit functionality will be implemented in Phase 4
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
