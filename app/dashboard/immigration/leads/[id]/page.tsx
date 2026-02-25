'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { immigrationApi } from '@/lib/api/immigration';
import { type IntakeAssignment } from '@/types/immigration';
import { getCountryFlag } from '@/lib/utils/countryFlags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import RespondToLeadDialog from '@/components/immigration/leads/RespondToLeadDialog';

function getUrgencyBadge(urgencyLevel: string) {
  switch (urgencyLevel) {
    case 'emergency':
      return (
        <Badge className="bg-red-500 text-white animate-pulse text-base px-4 py-1.5">
          🔴 Emergency
        </Badge>
      );
    case 'urgent':
      return <Badge className="bg-red-100 text-red-700 text-base px-4 py-1.5">⚡ Urgent</Badge>;
    case 'soon':
      return <Badge className="bg-amber-100 text-amber-700 text-base px-4 py-1.5">Soon</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-600 text-base px-4 py-1.5">Standard</Badge>;
  }
}

function getPrivacyName(name: string): string {
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName} ${lastName[0]}.`;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  return `${local[0]}***@${domain}`;
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return `${phone.slice(0, 2)}***${phone.slice(-2)}`;
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [assignment, setAssignment] = useState<IntakeAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<{
    assignment: IntakeAssignment;
    action: 'accept' | 'decline';
  } | null>(null);
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    fetchLead();
  }, [id]);

  useEffect(() => {
    if (assignment && assignment.status === 'pending') {
      const updateCountdown = () => {
        const expiresAt = new Date(assignment.expiresAt);
        const now = new Date();
        const diffMs = expiresAt.getTime() - now.getTime();

        if (diffMs <= 0) {
          setCountdown('Expired');
        } else {
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
          setCountdown(`${hours}h ${minutes}m ${seconds}s remaining`);
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [assignment]);

  const fetchLead = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.getMyLeads();
      if (response.success && response.data) {
        const found = response.data.assignments.find((a: any) => a.id === id);
        if (!found) {
          router.push('/dashboard/immigration/leads');
          return;
        }
        setAssignment(found);
      }
    } catch (error) {
      console.error('Failed to fetch lead:', error);
      router.push('/dashboard/immigration/leads');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-gray-600 mb-4">Lead not found</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/immigration/leads">← Back to Leads</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isExpired = new Date(assignment.expiresAt) < new Date();
  const isPending = assignment.status === 'pending' && !isExpired;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/immigration/leads"
        className="text-[#0F2557] text-sm inline-flex items-center hover:underline"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Leads
      </Link>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Lead Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{assignment.intake.service.name}</CardTitle>
                {getUrgencyBadge(assignment.intake.urgencyLevel)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Submitted:</p>
                  <p className="font-medium">
                    {format(new Date(assignment.intake.submittedAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Expires:</p>
                  <p className="font-medium">
                    {format(new Date(assignment.expiresAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                You are specialist #{assignment.attemptNumber} to review this request
              </p>
            </CardContent>
          </Card>

          {/* Applicant Information */}
          <Card>
            <CardHeader>
              <CardTitle>Applicant Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-amber-800">
                  Full contact details are shared via email after accepting
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Name</p>
                  <p className="font-medium">{getPrivacyName(assignment.intake.applicantName)}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Email</p>
                  <p className="font-medium">{maskEmail(assignment.intake.applicantEmail)}</p>
                </div>
                {assignment.intake.applicantPhone && (
                  <div>
                    <p className="text-gray-600 mb-1">Phone</p>
                    <p className="font-medium">{maskPhone(assignment.intake.applicantPhone)}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600 mb-1">Current Country</p>
                  <p className="font-medium">
                    {getCountryFlag(assignment.intake.applicantCountry)}{' '}
                    {assignment.intake.applicantCountry}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Destination</p>
                  <p className="font-medium">
                    {getCountryFlag(assignment.intake.destinationCountry)}{' '}
                    {assignment.intake.destinationCountry}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Case Description */}
          <Card>
            <CardHeader>
              <CardTitle>Their Situation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{assignment.intake.description}</p>
              {(assignment.intake as any).additionalData && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-2">Additional Information:</p>
                  <pre className="text-xs text-gray-600">
                    {JSON.stringify((assignment.intake as any).additionalData, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-8 lg:self-start">
          {/* Assignment Status */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Status</CardTitle>
            </CardHeader>
            <CardContent>
              {assignment.status === 'pending' && !isExpired && (
                <div className="space-y-2">
                  <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {countdown}
                  </p>
                </div>
              )}
              {assignment.status === 'pending' && isExpired && (
                <Badge className="bg-red-100 text-red-700">Expired</Badge>
              )}
              {assignment.status === 'accepted' && (
                <div className="space-y-2">
                  <Badge className="bg-green-100 text-green-700">Accepted</Badge>
                  <p className="text-sm text-gray-600">Case created</p>
                  {assignment.intake.convertedCaseId && (
                    <Button asChild variant="outline" size="sm" className="w-full mt-2">
                      <Link
                        href={`/dashboard/immigration/cases/${assignment.intake.convertedCaseId}`}
                        target="_blank"
                      >
                        View Case →
                      </Link>
                    </Button>
                  )}
                </div>
              )}
              {assignment.status === 'declined' && (
                <div className="space-y-2">
                  <Badge className="bg-gray-100 text-gray-600">Declined</Badge>
                  {assignment.declinedReason && (
                    <p className="text-sm text-gray-600">{assignment.declinedReason}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Card */}
          {isPending && (
            <Card className="bg-green-50 border border-green-200">
              <CardContent className="p-6">
                <Button
                  onClick={() => setRespondingTo({ assignment, action: 'accept' })}
                  className="w-full bg-green-600 text-white py-3 rounded-xl mb-3"
                >
                  ✓ Accept This Lead
                </Button>
                <button
                  onClick={() => setRespondingTo({ assignment, action: 'decline' })}
                  className="w-full text-sm text-gray-400 text-center hover:text-gray-600"
                >
                  Decline this lead
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Respond Dialog */}
      <RespondToLeadDialog
        isOpen={!!respondingTo}
        assignment={respondingTo?.assignment || null}
        action={respondingTo?.action || null}
        onClose={() => setRespondingTo(null)}
        onSuccess={() => {
          setRespondingTo(null);
          fetchLead();
        }}
      />
    </div>
  );
}
