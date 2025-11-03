'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type BulkItem = {
  id: string;
  fileName?: string;
  fullName?: string;
  currentCountry?: string;
  targetCountry?: string;
  purpose?: string;
  institution?: string;
  program?: string;
  background?: string;
  motivation?: string;
  careerGoals?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: { sop?: string };
  error?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function BulkProcessingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<BulkItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  if (!loading && !user) {
    router.push('/auth/login');
  }

  const plan = user?.subscriptionPlan || 'starter';
  const isEnterprise = plan === 'enterprise';

  const parseCSV = (text: string): BulkItem[] => {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map((line, idx) => {
      const cols = line.split(',');
      const record: any = {};
      headers.forEach((h, i) => { record[h] = (cols[i] || '').trim(); });
      return {
        id: `${Date.now()}_${idx}`,
        fullName: record.fullName,
        currentCountry: record.currentCountry,
        targetCountry: record.targetCountry,
        purpose: record.purpose,
        institution: record.institution,
        program: record.program,
        background: record.background,
        motivation: record.motivation,
        careerGoals: record.careerGoals,
        status: 'pending',
        progress: 0,
      } as BulkItem;
    });
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    let parsed: BulkItem[] = [];
    try {
      if (file.name.endsWith('.json')) {
        const json = JSON.parse(text);
        parsed = (Array.isArray(json) ? json : []).map((r: any, idx: number) => ({
          id: `${Date.now()}_${idx}`,
          ...r,
          status: 'pending',
          progress: 0,
        }));
      } else {
        parsed = parseCSV(text);
      }
    } catch (e: any) {
      alert('Failed to parse file. Please upload CSV with headers or JSON array.');
      return;
    }
    setItems(parsed);
  };

  const runBatch = async () => {
    if (!items.length) return;
    setIsRunning(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    for (let i = 0; i < items.length; i++) {
      setItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'processing', progress: 10 } : it));
      const item = items[i];
      try {
        const res = await fetch(`${API_BASE_URL}/api/ai/generate-sop`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            fullName: item.fullName || 'Applicant',
            currentCountry: item.currentCountry || 'South Africa',
            targetCountry: item.targetCountry || 'Canada',
            purpose: item.purpose || 'study',
            institution: item.institution || 'University',
            program: item.program || 'Program',
            background: item.background || 'Background details',
            motivation: item.motivation || 'Motivation',
            careerGoals: item.careerGoals || 'Career goals',
          }),
        });
        const data = await res.json();
        if (data?.success) {
          setItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'completed', progress: 100, result: { sop: data.data.sop } } : it));
        } else {
          setItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'error', progress: 100, error: data?.message || 'Failed' } : it));
        }
      } catch (e: any) {
        setItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'error', progress: 100, error: e.message } : it));
      }
    }
    setIsRunning(false);
  };

  const downloadResults = () => {
    const rows = items.map(it => ({ fullName: it.fullName, targetCountry: it.targetCountry, status: it.status, sop: it.result?.sop?.slice(0, 50) || '' }));
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isEnterprise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Bulk Document Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">This feature is available on the Enterprise plan.</p>
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-purple-500 to-indigo-600">Upgrade to Enterprise</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Document Processing</h1>
          <Badge className="bg-purple-600">Enterprise</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload CSV or JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <input
                type="file"
                accept=".csv,application/json"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <p className="text-sm text-gray-600">CSV headers supported: fullName,currentCountry,targetCountry,purpose,institution,program,background,motivation,careerGoals</p>
              <div className="flex gap-3">
                <Button onClick={runBatch} disabled={!items.length || isRunning} className="bg-gradient-to-r from-purple-500 to-indigo-600">
                  {isRunning ? 'Processing…' : 'Start Processing'}
                </Button>
                <Button variant="outline" onClick={downloadResults} disabled={!items.some(i => i.status !== 'pending')}>Download Results</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.length === 0 && (
                <p className="text-sm text-gray-600">No items loaded yet.</p>
              )}
              {items.map((it) => (
                <div key={it.id} className="bg-white rounded-lg border p-4">
                  <div className="flex justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">{it.fullName || it.fileName || 'Record'}</div>
                      <div className="text-xs text-gray-500">{it.targetCountry || 'Target Country'}</div>
                    </div>
                    <div>
                      <Badge className={it.status === 'completed' ? 'bg-green-600' : it.status === 'error' ? 'bg-red-600' : 'bg-blue-600'}>
                        {it.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-2" style={{ width: `${it.progress}%` }} />
                  </div>
                  {it.error && <div className="text-red-600 text-sm mt-2">{it.error}</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


