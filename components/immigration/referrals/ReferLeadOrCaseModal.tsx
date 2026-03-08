'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { immigrationApi } from '@/lib/api/immigration';
import { apiClient } from '@/lib/api/client';

export type ReferralModalStep = 1 | 2 | 3;

interface ReferLeadOrCaseModalProps {
  open: boolean;
  onClose: () => void;
  /** When opened from network profile */
  recipientUserId?: string;
  recipientName?: string;
  /** When opened from lead detail */
  intakeId?: string;
  intakeSummary?: string;
  /** When opened from case detail */
  caseId?: string;
  caseSummary?: string;
  onSuccess?: () => void;
}

export default function ReferLeadOrCaseModal({
  open,
  onClose,
  recipientUserId: initialRecipientId,
  recipientName: initialRecipientName,
  intakeId: initialIntakeId,
  intakeSummary,
  caseId: initialCaseId,
  caseSummary,
  onSuccess,
}: ReferLeadOrCaseModalProps) {
  const [step, setStep] = useState<ReferralModalStep>(1);
  const [recipientUserId, setRecipientUserId] = useState<string | null>(
    initialRecipientId || null
  );
  const [recipientName, setRecipientName] = useState(initialRecipientName || '');
  const [intakeId, setIntakeId] = useState(initialIntakeId || '');
  const [caseId, setCaseId] = useState(initialCaseId || '');
  const [note, setNote] = useState('');
  const [notifyClient, setNotifyClient] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [networkSearch, setNetworkSearch] = useState('');
  const [networkResults, setNetworkResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const [myLeads, setMyLeads] = useState<any[]>([]);
  const [myCases, setMyCases] = useState<any[]>([]);
  const [loadingLeadsCases, setLoadingLeadsCases] = useState(false);

  const hasWhat = !!(intakeId || caseId);
  const hasWho = !!recipientUserId;

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setRecipientUserId(initialRecipientId || null);
    setRecipientName(initialRecipientName || '');
    setIntakeId(initialIntakeId || '');
    setCaseId(initialCaseId || '');
    setNote('');
    setError(null);
  }, [open, initialRecipientId, initialRecipientName, initialIntakeId, initialCaseId]);

  const searchNetwork = async () => {
    if (!networkSearch.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const res = await immigrationApi.getNetworkDirectory({
        search: networkSearch.trim(),
        limit: 10,
      });
      if (res.success && res.data) {
        setNetworkResults(res.data.profiles);
      }
    } catch (e) {
      setError('Failed to search network');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (!open || !initialRecipientId) return;
    if (hasWhat) {
      setStep(2);
      return;
    }
    setLoadingLeadsCases(true);
    Promise.all([
      immigrationApi.getMyLeads(),
      immigrationApi.getCases(undefined, 1, 50),
    ])
      .then(([leadsRes, casesRes]) => {
        if (leadsRes.success && (leadsRes.data as any)?.assignments)
          setMyLeads((leadsRes.data as any).assignments);
        if (casesRes.success && (casesRes.data as any)?.data)
          setMyCases((casesRes.data as any).data);
      })
      .catch(() => {})
      .finally(() => setLoadingLeadsCases(false));
  }, [open, initialRecipientId, hasWhat]);

  const handleSend = async () => {
    if (!recipientUserId) {
      setError('Please select a professional');
      return;
    }
    if (!intakeId && !caseId) {
      setError('Please select a lead or case to refer');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await immigrationApi.createReferral({
        recipientId: recipientUserId,
        intakeId: intakeId || undefined,
        caseId: caseId || undefined,
        note: note.trim() || undefined,
        notifyClient: notifyClient,
      });
      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setError((res as any).error || 'Failed to send referral');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to send referral');
    } finally {
      setLoading(false);
    }
  };

  const getStep1Title = () => {
    if (hasWhat && !hasWho) return 'Choose professional to refer to';
    if (hasWho && !hasWhat) return 'Choose lead or case to refer';
    return 'Referral details';
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Refer lead or case</DialogTitle>
        </DialogHeader>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{getStep1Title()}</p>

            {hasWhat && !hasWho && (
              <>
                <div>
                  <Label>Search professional</Label>
                  <div className="flex gap-2 mt-1">
                    <input
                      className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Name or practice..."
                      value={networkSearch}
                      onChange={(e) => setNetworkSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchNetwork()}
                    />
                    <Button type="button" variant="outline" onClick={searchNetwork} disabled={searching}>
                      Search
                    </Button>
                  </div>
                </div>
                {networkResults.length > 0 && (
                  <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                    {networkResults.map((p) => (
                      <button
                        key={p.userId}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                        onClick={() => {
                          setRecipientUserId(p.userId);
                          setRecipientName(p.displayName);
                          setStep(2);
                        }}
                      >
                        <span className="font-medium">{p.displayName}</span>
                        {p.professionalType && (
                          <span className="text-xs text-gray-500 capitalize">{p.professionalType}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {recipientUserId && (
                  <p className="text-sm text-gray-600">
                    Selected: <strong>{recipientName}</strong>
                  </p>
                )}
              </>
            )}

            {hasWho && !hasWhat && (
              <div className="space-y-2">
                <p className="text-sm">Referring to: <strong>{recipientName || initialRecipientName}</strong></p>
                <Label>Select a lead to refer</Label>
                {loadingLeadsCases ? (
                  <p className="text-sm text-gray-500">Loading your leads...</p>
                ) : myLeads.length > 0 ? (
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={intakeId}
                    onChange={(e) => {
                      setIntakeId(e.target.value);
                      setCaseId('');
                    }}
                  >
                    <option value="">— Select lead —</option>
                    {myLeads.map((a: any) => (
                      <option key={a.id} value={a.intake?.id}>
                        {a.intake?.referenceNumber} — {a.intake?.destinationCountry}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-500">No pending leads.</p>
                )}
                <Label className="mt-2">Or select a case to refer</Label>
                {myCases.length > 0 ? (
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={caseId}
                    onChange={(e) => {
                      setCaseId(e.target.value);
                      setIntakeId('');
                    }}
                  >
                    <option value="">— Select case —</option>
                    {myCases.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.referenceNumber} — {c.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-500">No cases.</p>
                )}
                <Button
                  className="mt-2"
                  disabled={!intakeId && !caseId}
                  onClick={() => setStep(2)}
                >
                  Next
                </Button>
              </div>
            )}

            {hasWho && hasWhat && (
              <Button onClick={() => setStep(2)}>Next</Button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {intakeId ? 'Lead' : 'Case'} will be referred to <strong>{recipientName}</strong>.
              Fee arrangement: off platform.
            </p>
            <div>
              <Label>Note to recipient (optional)</Label>
              <Textarea
                className="mt-1"
                placeholder="I'm referring because..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={notifyClient}
                onChange={(e) => setNotifyClient(e.target.checked)}
              />
              Notify the client by email when they accept
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleSend} disabled={loading}>
                {loading ? 'Sending...' : 'Send referral'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
