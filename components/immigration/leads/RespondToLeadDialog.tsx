'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type IntakeAssignment } from '@/types/immigration';
import { immigrationApi } from '@/lib/api/immigration';
import { getCountryFlag } from '@/lib/utils/countryFlags';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RespondToLeadDialogProps {
  isOpen: boolean;
  assignment: IntakeAssignment | null;
  action: 'accept' | 'decline' | null;
  onClose: () => void;
  onSuccess: (data?: any) => void;
}

function getPrivacyName(name: string): string {
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName} ${lastName[0]}.`;
}

export default function RespondToLeadDialog({
  isOpen,
  assignment,
  action,
  onClose,
  onSuccess,
}: RespondToLeadDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [otherReasonText, setOtherReasonText] = useState('');

  if (!assignment) return null;

  const handleAccept = async () => {
    if (!checkboxChecked) {
      toast.error('Please confirm you understand the commitment');
      return;
    }

    try {
      setIsLoading(true);
      const response = await immigrationApi.respondToLead({
        assignmentId: assignment.id,
        action: 'accept',
      });

      if (response.success) {
        toast.success('Lead accepted! Case created.');
        if (response.data?.case?.id) {
          router.push(`/dashboard/immigration/cases/${response.data.case.id}`);
        }
        onSuccess(response.data);
      } else {
        toast.error(response.error || 'Failed to accept lead');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept lead');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason) {
      toast.error('Please select a reason for declining');
      return;
    }

    if (declineReason === 'other' && otherReasonText.trim().length < 10) {
      toast.error('Please provide at least 10 characters for the reason');
      return;
    }

    try {
      setIsLoading(true);
      const reasonText =
        declineReason === 'other'
          ? `other: ${otherReasonText}`
          : declineReason.replace(/_/g, ' ');

      const response = await immigrationApi.respondToLead({
        assignmentId: assignment.id,
        action: 'decline',
        declinedReason: reasonText,
      });

      if (response.success) {
        toast.success('Lead declined. Next specialist being notified.');
        onSuccess();
        onClose();
      } else {
        toast.error(response.error || 'Failed to decline lead');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to decline lead');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {action === 'accept' ? (
          <>
            <DialogHeader>
              <DialogTitle>Accept This Lead?</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-2">
                  {assignment.intake.service.name}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  {getCountryFlag(assignment.intake.applicantCountry)}{' '}
                  {assignment.intake.applicantCountry} →{' '}
                  {getCountryFlag(assignment.intake.destinationCountry)}{' '}
                  {assignment.intake.destinationCountry}
                </p>
                {getUrgencyBadge(assignment.intake.urgencyLevel)}
                <p className="text-sm text-gray-600 mt-2">
                  Applicant: {getPrivacyName(assignment.intake.applicantName)}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  By accepting, you commit to contacting this client within 24 hours. Their full
                  contact details will be sent to them via email.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="commitment"
                  checked={checkboxChecked}
                  onCheckedChange={(checked) => setCheckboxChecked(checked === true)}
                />
                <Label htmlFor="commitment" className="text-sm cursor-pointer">
                  I understand and will contact the client promptly
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!checkboxChecked || isLoading}
                className="bg-green-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating case...
                  </>
                ) : (
                  'Accept Lead'
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Decline This Lead</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                This lead will be offered to the next available specialist.
              </p>

              <div>
                <Label htmlFor="declineReason">Reason for declining *</Label>
                <Select value={declineReason} onValueChange={setDeclineReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outside_specialization">Outside my specialization</SelectItem>
                    <SelectItem value="at_capacity">At full capacity right now</SelectItem>
                    <SelectItem value="corridor_not_covered">Corridor not covered</SelectItem>
                    <SelectItem value="requirements_unclear">Client requirements unclear</SelectItem>
                    <SelectItem value="other">Other reason</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {declineReason === 'other' && (
                <div>
                  <Label htmlFor="otherReason">Please explain *</Label>
                  <Textarea
                    id="otherReason"
                    value={otherReasonText}
                    onChange={(e) => setOtherReasonText(e.target.value)}
                    placeholder="Please explain..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {otherReasonText.length} characters (minimum 10)
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleDecline}
                disabled={!declineReason || isLoading || (declineReason === 'other' && otherReasonText.trim().length < 10)}
                className="bg-red-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Declining...
                  </>
                ) : (
                  'Decline Lead'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getUrgencyBadge(urgencyLevel: string) {
  switch (urgencyLevel) {
    case 'emergency':
      return (
        <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          🔴 Emergency
        </span>
      );
    case 'urgent':
      return (
        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
          ⚡ Urgent
        </span>
      );
    case 'soon':
      return (
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
          Soon
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
          Standard
        </span>
      );
  }
}
