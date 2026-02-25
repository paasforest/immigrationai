'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { getCountryFlag } from '@/lib/utils/countryFlags';
import { type IntakeAssignment } from '@/types/immigration';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, X, ExternalLink } from 'lucide-react';

interface LeadCardProps {
  assignment: IntakeAssignment;
  onRespond: (assignment: IntakeAssignment, action: 'accept' | 'decline') => void;
}

function getUrgencyBadge(urgencyLevel: string) {
  switch (urgencyLevel) {
    case 'emergency':
      return (
        <Badge className="bg-red-500 text-white animate-pulse">
          🔴 Emergency
        </Badge>
      );
    case 'urgent':
      return <Badge className="bg-red-100 text-red-700">⚡ Urgent</Badge>;
    case 'soon':
      return <Badge className="bg-amber-100 text-amber-700">Soon</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-600">Standard</Badge>;
  }
}

function getPrivacyName(name: string): string {
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName} ${lastName[0]}.`;
}

export default function LeadCard({ assignment, onRespond }: LeadCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const updateTimeRemaining = () => {
      const expiresAt = new Date(assignment.expiresAt);
      const now = new Date();
      const diffMs = expiresAt.getTime() - now.getTime();
      const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
      const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffMs <= 0) {
        setTimeRemaining('Expired');
      } else if (hoursLeft > 24) {
        setTimeRemaining(`Expires in ${hoursLeft}h`);
      } else if (hoursLeft > 0) {
        setTimeRemaining(`Expires in ${hoursLeft}h ${minutesLeft}m`);
      } else {
        setTimeRemaining(`Expires in ${minutesLeft}m`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [assignment.expiresAt]);

  const hoursLeft = Math.floor(
    (new Date(assignment.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)
  );
  const isExpired = new Date(assignment.expiresAt) < new Date();
  const isPending = assignment.status === 'pending' && !isExpired;

  const getTimeRemainingColor = () => {
    if (isExpired) return 'bg-gray-100 text-gray-500';
    if (hoursLeft > 24) return 'bg-green-100 text-green-700';
    if (hoursLeft > 6) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700 animate-pulse';
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
      {/* Row 1: Service and Urgency */}
      <div className="flex justify-between items-start mb-3">
        <Badge className="bg-blue-50 text-[#0F2557] rounded-full px-3 py-1 text-xs font-medium">
          {assignment.intake.service.name}
        </Badge>
        {getUrgencyBadge(assignment.intake.urgencyLevel)}
      </div>

      {/* Row 2: Applicant Info */}
      <div className="mt-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
            {getPrivacyName(assignment.intake.applicantName)
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {getPrivacyName(assignment.intake.applicantName)}
            </p>
            <p className="text-xs text-gray-500">
              Submitted {formatDistanceToNow(new Date(assignment.intake.submittedAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Route */}
        <div className="mt-2 text-sm">
          <span>
            {getCountryFlag(assignment.intake.applicantCountry)} {assignment.intake.applicantCountry}
          </span>
          <span className="mx-2">→</span>
          <span>
            {getCountryFlag(assignment.intake.destinationCountry)} {assignment.intake.destinationCountry}
          </span>
        </div>

        {/* Description */}
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {assignment.intake.description.slice(0, 150)}
        </p>
      </div>

      {/* Row 3: Time and Actions */}
      <div className="mt-4 pt-3 border-t flex justify-between items-center">
        <div className={`text-xs rounded-full px-2 py-1 ${getTimeRemainingColor()}`}>
          {timeRemaining}
        </div>

        <div className="flex gap-2">
          {isPending && (
            <>
              <Button
                size="sm"
                className="bg-green-500 text-white text-xs px-3 py-1 h-auto"
                onClick={() => onRespond(assignment, 'accept')}
              >
                ✓ Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500 text-red-500 text-xs px-3 py-1 h-auto"
                onClick={() => onRespond(assignment, 'decline')}
              >
                ✗ Decline
              </Button>
            </>
          )}
          {assignment.status === 'pending' && isExpired && (
            <Badge variant="outline" className="text-gray-500">
              Expired
            </Badge>
          )}
          {assignment.status === 'accepted' && (
            <Button
              size="sm"
              asChild
              className="bg-[#0F2557] text-white text-xs px-3 py-1 h-auto"
            >
              <Link
                href={`/dashboard/immigration/cases/${assignment.intake.convertedCaseId}`}
                target="_blank"
              >
                View Case →
              </Link>
            </Button>
          )}
          {assignment.status === 'declined' && (
            <span className="text-sm text-gray-500">Declined</span>
          )}
        </div>
      </div>
    </div>
  );
}
