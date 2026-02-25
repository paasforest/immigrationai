'use client';

import React from 'react';
import { ImmigrationCase } from '@/types/immigration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

interface OverviewTabProps {
  caseData: ImmigrationCase;
}

export default function OverviewTab({ caseData }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column - Case Details */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Visa Type</p>
                <p className="font-medium">{caseData.visaType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Origin Country</p>
                <p className="font-medium">{caseData.originCountry || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Destination Country</p>
                <p className="font-medium">{caseData.destinationCountry || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <Badge>{caseData.priority}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge>{caseData.status.replace('_', ' ')}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Submission Deadline</p>
                <p className="font-medium">{formatDate(caseData.submissionDeadline)}</p>
              </div>
              {caseData.submittedAt && (
                <div>
                  <p className="text-sm text-gray-600">Submitted Date</p>
                  <p className="font-medium">{formatDate(caseData.submittedAt)}</p>
                </div>
              )}
              {caseData.decisionAt && (
                <div>
                  <p className="text-sm text-gray-600">Decision Date</p>
                  <p className="font-medium">{formatDate(caseData.decisionAt)}</p>
                </div>
              )}
              {caseData.outcome && (
                <div>
                  <p className="text-sm text-gray-600">Outcome</p>
                  <p className="font-medium">{caseData.outcome}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Created Date</p>
                <p className="font-medium">{formatDate(caseData.createdAt)}</p>
              </div>
            </div>

            {caseData.notes && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">Notes</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{caseData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-bold">{caseData._count?.caseDocuments || 0}</p>
              <p className="text-sm text-gray-600">Documents</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{caseData._count?.tasks || 0}</p>
              <p className="text-sm text-gray-600">Tasks</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{caseData._count?.messages || 0}</p>
              <p className="text-sm text-gray-600">Messages</p>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Professional */}
        {caseData.assignedProfessional && (
          <Card>
            <CardHeader>
              <CardTitle>Assigned Professional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {getInitials(caseData.assignedProfessional.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{caseData.assignedProfessional.fullName}</p>
                  <p className="text-sm text-gray-600">{caseData.assignedProfessional.email}</p>
                  <Badge variant="outline" className="mt-1">Professional</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Client */}
        {caseData.applicant ? (
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {getInitials(caseData.applicant.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{caseData.applicant.fullName}</p>
                  <p className="text-sm text-gray-600">{caseData.applicant.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No client linked</p>
                <p className="text-xs mt-1">Link a client to this case</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
