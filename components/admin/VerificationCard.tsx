'use client';

import { useState } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ExternalLink, CheckCircle2, X, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface VerificationCardProps {
  profile: any;
  onUpdate: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function VerificationCard({ profile, onUpdate }: VerificationCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async () => {
    if (!confirm('Approve this professional verification?')) return;

    try {
      setIsProcessing(true);
      const response = await immigrationApi.verifyProfessional({
        profileId: profile.id,
        action: 'approve',
      });

      if (response.success) {
        toast.success('Verification approved');
        onUpdate();
      } else {
        toast.error('Failed to approve verification');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await immigrationApi.verifyProfessional({
        profileId: profile.id,
        action: 'reject',
        rejectionReason: rejectionReason.trim(),
      });

      if (response.success) {
        toast.success('Verification rejected');
        setShowRejectForm(false);
        setRejectionReason('');
        onUpdate();
      } else {
        toast.error('Failed to reject verification');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-white rounded-xl border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-[#0F2557] rounded-full flex items-center justify-center text-white font-bold">
            {getInitials(profile.user?.fullName || profile.displayName || 'U')}
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">{profile.displayName}</p>
            <p className="text-sm text-gray-600">{profile.user?.email}</p>
            {profile.organization && (
              <p className="text-xs text-gray-500 mt-1">{profile.organization.name}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Submitted {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">Verification Document</Label>
          {profile.verificationDoc && (
            <a
              href={profile.verificationDoc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#0F2557] hover:underline text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              View Document
            </a>
          )}
        </div>

        {!showRejectForm ? (
          <div className="flex gap-3">
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 text-white flex-1"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Approve
            </Button>
            <Button
              onClick={() => setShowRejectForm(true)}
              disabled={isProcessing}
              variant="outline"
              className="border-red-500 text-red-500 flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="rejectionReason">Reason for rejection (sent to professional):</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Please explain why verification was rejected..."
                className="mt-2"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="bg-red-600 text-white flex-1"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  'Confirm Rejection'
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason('');
                }}
                disabled={isProcessing}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
