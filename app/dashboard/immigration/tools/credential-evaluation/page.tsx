'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GraduationCap,
  ExternalLink,
  AlertTriangle,
  Info,
  Clock,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface EvaluationBody {
  name: string;
  acronym: string;
  website: string;
  description: string;
  estimatedFee: string;
  estimatedTimeline: string;
  documentsRequired: string[];
  notes: string;
  isRegulatory: boolean;
}

interface LookupResult {
  professionType: string;
  destinationCountry: string;
  originCountry: string;
  evaluationBodies: EvaluationBody[];
  preEvaluationRequired: string | null;
  additionalSteps: string[];
  refusalRiskNote: string;
  euFamilyMemberNote: string | null;
}

interface Options {
  destinations: string[];
  professions: { value: string; label: string }[];
  originCountries: string[];
}

function BodyCard({ body, step }: { body: EvaluationBody; step: number }) {
  const [expanded, setExpanded] = useState(step === 1);

  return (
    <Card className={cn('border-2', body.isRegulatory ? 'border-red-200 bg-red-50/30' : 'border-blue-100')}>
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white',
              body.isRegulatory ? 'bg-red-500' : 'bg-[#0F2557]'
            )}>
              {step}
            </div>
            <div>
              <CardTitle className="text-base">{body.name}</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                {body.isRegulatory ? (
                  <span className="text-red-600 font-semibold">⚠ Regulatory — legally required to practise</span>
                ) : (
                  <span className="text-gray-500">Advisory — required for visa/employment</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs hidden sm:flex">{body.acronym}</Badge>
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4">
          <p className="text-sm text-gray-700">{body.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Estimated Fee</p>
                <p className="text-sm font-semibold text-gray-800">{body.estimatedFee}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Timeline</p>
                <p className="text-sm font-semibold text-gray-800">{body.estimatedTimeline}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Documents Required
            </p>
            <ul className="space-y-1.5">
              {body.documentsRequired.map((doc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {body.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-xs font-semibold text-amber-800 mb-1">Important Note</p>
              <p className="text-xs text-amber-700">{body.notes}</p>
            </div>
          )}

          <a
            href={body.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <Globe className="w-3.5 h-3.5" />
            Official website: {body.website}
            <ExternalLink className="w-3 h-3" />
          </a>
        </CardContent>
      )}
    </Card>
  );
}

export default function CredentialEvaluationPage() {
  const [options, setOptions] = useState<Options | null>(null);
  const [form, setForm] = useState({ originCountry: '', destinationCountry: '', professionType: '' });
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const token = apiClient.getToken();
        const res = await fetch(`${API_URL}/api/tools/credential-evaluation/options`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.success) setOptions(data.data);
      } catch (e) {
        console.error('Failed to load options');
      }
    };
    loadOptions();
  }, []);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));
  const isComplete = Object.values(form).every(v => v.length > 0);

  const handleLookup = async () => {
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const token = apiClient.getToken();
      const res = await fetch(`${API_URL}/api/tools/credential-evaluation/lookup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.data);
      } else {
        setError(data.error || data.message || 'Lookup failed');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg bg-[#0F2557] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Credential Evaluation Matrix</h1>
        </div>
        <p className="text-gray-600">
          Find the correct evaluation body for an applicant's qualification — based on their home country, destination, and profession.
          Includes required documents, fees, timelines, and official sources.
        </p>
      </div>

      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-sm">
          Missing credential evaluation is one of the top 3 reasons African applicants are rejected for skilled worker visas.
          Run this check at the start of every professional immigration case.
        </AlertDescription>
      </Alert>

      {/* Lookup Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lookup Evaluation Requirements</CardTitle>
          <CardDescription>Select the applicant's details to find the right evaluation path</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Applicant's Origin Country</Label>
              <Select value={form.originCountry} onValueChange={v => set('originCountry', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  {options?.originCountries.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  )) ?? <SelectItem value="loading">Loading...</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Destination Country</Label>
              <Select value={form.destinationCountry} onValueChange={v => set('destinationCountry', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select destination" /></SelectTrigger>
                <SelectContent>
                  {options?.destinations.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  )) ?? <SelectItem value="loading">Loading...</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Profession / Qualification Type</Label>
              <Select value={form.professionType} onValueChange={v => set('professionType', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select profession" /></SelectTrigger>
                <SelectContent>
                  {options?.professions.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  )) ?? <SelectItem value="loading">Loading...</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleLookup}
            disabled={!isComplete || loading}
            className="mt-4 bg-[#0F2557] hover:bg-[#0a1d42]"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Looking up...</>
            ) : (
              <><GraduationCap className="w-4 h-4 mr-2" /> Find Evaluation Requirements</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">
              Results: {result.professionType} · {result.originCountry} → {result.destinationCountry}
            </h2>
          </div>

          {/* Pre-evaluation warning */}
          {result.preEvaluationRequired && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800 font-medium">
                <span className="font-bold">⚡ Do This First: </span>
                {result.preEvaluationRequired}
              </AlertDescription>
            </Alert>
          )}

          {/* EU Family Member Note */}
          {result.euFamilyMemberNote && (
            <Alert className="border-purple-200 bg-purple-50">
              <Info className="w-4 h-4 text-purple-600" />
              <AlertDescription className="text-purple-800 text-sm">
                <span className="font-bold">EU Free Movement Route: </span>
                {result.euFamilyMemberNote}
              </AlertDescription>
            </Alert>
          )}

          {/* Refusal risk note */}
          <Alert className={result.refusalRiskNote.startsWith('⚠️') ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
            <Info className="w-4 h-4" />
            <AlertDescription className="text-sm">{result.refusalRiskNote}</AlertDescription>
          </Alert>

          {/* Step-by-step evaluation bodies */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Evaluation Path ({result.evaluationBodies.length} step{result.evaluationBodies.length > 1 ? 's' : ''})
            </h3>
            <div className="space-y-4">
              {result.evaluationBodies.map((body, i) => (
                <BodyCard key={body.acronym} body={body} step={i + 1} />
              ))}
            </div>
          </div>

          {/* Additional steps */}
          {result.additionalSteps.length > 0 && (
            <Card className="border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Additional Requirements for {result.destinationCountry}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.additionalSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-500 font-bold mt-0.5 flex-shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <p className="text-xs text-gray-400">
            Data sourced from official government and evaluation body websites. Always verify current requirements directly with the relevant body before submitting an application.
          </p>
        </div>
      )}
    </div>
  );
}
