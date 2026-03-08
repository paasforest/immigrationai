'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { immigrationApi } from '@/lib/api/immigration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Inbox, Send, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ReferralsPage() {
  const [sent, setSent] = useState<any[]>([]);
  const [received, setReceived] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await immigrationApi.getMyReferrals();
      if (res.success && res.data) {
        setSent(res.data.sent || []);
        setReceived(res.data.received || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    setActingId(id);
    try {
      const res = await immigrationApi.acceptReferral(id);
      if (res.success) fetchReferrals();
    } catch (e) {
      console.error(e);
    } finally {
      setActingId(null);
    }
  };

  const handleDecline = async (id: string) => {
    setActingId(id);
    try {
      const res = await immigrationApi.declineReferral(id);
      if (res.success) fetchReferrals();
    } catch (e) {
      console.error(e);
    } finally {
      setActingId(null);
    }
  };

  const refSummary = (r: any) => {
    if (r.intake) {
      return `${r.intake.referenceNumber} — ${r.intake.destinationCountry}`;
    }
    if (r.case) {
      return `${r.case.referenceNumber} — ${r.case.title}`;
    }
    return 'Lead/Case';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
        <p className="text-gray-600 mt-1">
          Referrals you have sent and received. Accept or decline incoming referrals.
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Loading referrals...
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="w-5 h-5" />
                Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              {received.length === 0 ? (
                <p className="text-sm text-gray-500">No referrals received yet.</p>
              ) : (
                <ul className="space-y-3">
                  {received.map((r) => (
                    <li
                      key={r.id}
                      className="border rounded-lg p-3 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            From: {(r.referrer?.professionalProfile?.displayName) || r.referrer?.fullName || r.referrer?.email}
                          </p>
                          <p className="text-sm text-gray-600">{refSummary(r)}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(r.createdAt), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                        <Badge
                          variant={
                            r.status === 'accepted'
                              ? 'default'
                              : r.status === 'declined'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {r.status}
                        </Badge>
                      </div>
                      {r.note && (
                        <p className="text-sm text-gray-600 border-t pt-2">{r.note}</p>
                      )}
                      {r.status === 'pending' && (
                        <div className="flex gap-2 mt-1">
                          <Button
                            size="sm"
                            onClick={() => handleAccept(r.id)}
                            disabled={actingId === r.id}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDecline(r.id)}
                            disabled={actingId === r.id}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}
                      {r.status === 'accepted' && r.intakeId && (
                        <Link
                          href="/dashboard/immigration/cases"
                          className="text-sm text-[#0F2557] hover:underline"
                        >
                          View cases →
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sent.length === 0 ? (
                <p className="text-sm text-gray-500">No referrals sent yet.</p>
              ) : (
                <ul className="space-y-3">
                  {sent.map((r) => (
                    <li key={r.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            To: {(r.recipient?.professionalProfile?.displayName) || r.recipient?.fullName || r.recipient?.email}
                          </p>
                          <p className="text-sm text-gray-600">{refSummary(r)}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(r.createdAt), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                        <Badge
                          variant={
                            r.status === 'accepted'
                              ? 'default'
                              : r.status === 'declined'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {r.status}
                        </Badge>
                      </div>
                      {r.note && (
                        <p className="text-sm text-gray-600 border-t pt-2 mt-2">{r.note}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
