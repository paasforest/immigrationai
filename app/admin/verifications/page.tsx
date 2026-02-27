'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ShieldCheck,
  ShieldX,
  Shield,
  User,
  Building2,
  FileText,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  XCircle,
  Search,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface VerificationProfile {
  id: string;
  displayName: string;
  title?: string;
  bio?: string;
  verificationDoc?: string;
  isVerified: boolean;
  locationCity?: string;
  locationCountry?: string;
  createdAt: string;
  user: { id: string; email: string; fullName?: string };
  organization?: { name: string };
}

export default function AdminVerificationsPage() {
  const [profiles, setProfiles] = useState<VerificationProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<VerificationProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { fetchPending(); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); } }, [toast]);

  const token = () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/intake/admin/verifications?limit=50`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) {
        setProfiles(data.data.profiles);
        setTotal(data.data.total);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleVerify = async (profileId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      setToast({ msg: 'Please enter a reason for rejection', type: 'error' });
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/intake/admin/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ profileId, action, rejectionReason: action === 'reject' ? rejectionReason : undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ msg: `Profile ${action === 'approve' ? 'approved ✓' : 'rejected'}`, type: action === 'approve' ? 'success' : 'error' });
        setSelected(null);
        setRejectionReason('');
        fetchPending();
      } else {
        setToast({ msg: data.message || 'Action failed', type: 'error' });
      }
    } catch {
      setToast({ msg: 'Network error', type: 'error' });
    }
    setActionLoading(false);
  };

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase();
    return !q
      || p.displayName.toLowerCase().includes(q)
      || p.user.email.toLowerCase().includes(q)
      || (p.user.fullName || '').toLowerCase().includes(q)
      || (p.organization?.name || '').toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-500 hover:text-gray-800">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#0F2557]" />
                Professional Verifications
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Review and approve agencies, lawyers, and immigration professionals
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={fetchPending} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Toast */}
        {toast && (
          <Alert className={toast.type === 'success' ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}>
            <AlertDescription className={toast.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {toast.msg}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
                <p className="text-xs text-gray-500">Pending Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{profiles.filter(p => p.organization).length}</p>
                <p className="text-xs text-gray-500">Agencies</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{profiles.filter(p => !p.organization).length}</p>
                <p className="text-xs text-gray-500">Individual Professionals</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left — List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <ShieldCheck className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="font-medium text-gray-600">All caught up!</p>
                <p className="text-sm text-gray-400">No pending verifications</p>
              </div>
            ) : (
              filtered.map(p => (
                <Card
                  key={p.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${selected?.id === p.id ? 'ring-2 ring-[#0F2557]' : ''}`}
                  onClick={() => { setSelected(p); setRejectionReason(''); }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {p.organization ? <Building2 className="w-5 h-5 text-blue-600" /> : <User className="w-5 h-5 text-blue-600" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{p.user.fullName || p.displayName}</p>
                          <p className="text-xs text-gray-500 truncate">{p.user.email}</p>
                          {p.organization && (
                            <Badge variant="outline" className="text-[10px] mt-1 text-blue-700 border-blue-300">
                              {p.organization.name}
                            </Badge>
                          )}
                          {p.title && <p className="text-xs text-gray-400 mt-1">{p.title}</p>}
                        </div>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 text-[10px] ml-2 flex-shrink-0">Pending</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Right — Detail panel */}
          <div className="lg:col-span-3">
            {!selected ? (
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                  <Shield className="w-12 h-12 text-gray-200 mb-3" />
                  <p className="text-gray-400">Select a profile to review</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-5 h-5 text-[#0F2557]" />
                    {selected.user.fullName || selected.displayName}
                  </CardTitle>
                  <p className="text-sm text-gray-500">{selected.user.email}</p>
                </CardHeader>
                <CardContent className="p-6 space-y-5">

                  {/* Profile info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ['Display Name', selected.displayName],
                      ['Title / Role', selected.title || '—'],
                      ['Organisation', selected.organization?.name || 'Individual'],
                      ['Location', [selected.locationCity, selected.locationCountry].filter(Boolean).join(', ') || '—'],
                      ['Submitted', new Date(selected.createdAt).toLocaleDateString('en-ZA')],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                        <p className="font-medium text-gray-800">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Bio */}
                  {selected.bio && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bio</p>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">{selected.bio}</p>
                    </div>
                  )}

                  {/* Verification doc */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Submitted Document</p>
                    {selected.verificationDoc ? (
                      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-900 truncate">
                            {selected.verificationDoc.split('/').pop()}
                          </p>
                          <p className="text-xs text-blue-600">Practicing certificate / credential</p>
                        </div>
                        <a
                          href={`${API_BASE}/${selected.verificationDoc}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-medium"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No document uploaded yet</p>
                    )}
                  </div>

                  {/* Rejection reason input */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Rejection reason (required to reject)</p>
                    <Textarea
                      placeholder="e.g. Document is expired. Please resubmit with a current practicing certificate."
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleVerify(selected.id, 'approve')}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Verify
                    </Button>
                    <Button
                      onClick={() => handleVerify(selected.id, 'reject')}
                      disabled={actionLoading || !rejectionReason.trim()}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>

                  <p className="text-[11px] text-gray-400 text-center">
                    Approval sends a verification badge email. Rejection sends the reason and asks them to resubmit.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
