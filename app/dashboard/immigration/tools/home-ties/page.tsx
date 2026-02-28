'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Home,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  BarChart2,
  FileText,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ScoreResult {
  score: number;
  maxScore: number;
  percentage: number;
  rating: 'very_strong' | 'strong' | 'moderate' | 'weak';
  riskLevel: 'very_low' | 'low' | 'medium' | 'high';
  breakdown: { category: string; score: number; max: number; label: string }[];
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  summaryNote: string;
}

const RATING_CONFIG = {
  very_strong: { label: 'Very Strong Ties', color: 'text-green-700', bg: 'bg-green-50 border-green-200', bar: 'bg-green-500', Icon: ShieldCheck },
  strong:      { label: 'Strong Ties', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', bar: 'bg-blue-500', Icon: ShieldCheck },
  moderate:    { label: 'Moderate Ties', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', bar: 'bg-amber-500', Icon: ShieldAlert },
  weak:        { label: 'Weak Ties — High Refusal Risk', color: 'text-red-700', bg: 'bg-red-50 border-red-200', bar: 'bg-red-500', Icon: ShieldX },
};

const RISK_BADGE = {
  very_low: 'bg-green-100 text-green-800',
  low:      'bg-blue-100 text-blue-800',
  medium:   'bg-amber-100 text-amber-800',
  high:     'bg-red-100 text-red-800',
};

export default function HomeTiesScorerPage() {
  const [form, setForm] = useState({
    employmentStatus: '',
    employmentDuration: '',
    monthlyIncome: '',
    propertyOwnership: '',
    familyInHomeCountry: '',
    financialCommitments: '',
    bankAccountProfile: '',
    priorTravelHistory: '',
    visaType: '',
    destinationCountry: '',
  });

  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const isComplete = Object.values(form).every(v => v.length > 0);

  const handleScore = async () => {
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const token = apiClient.getToken();
      const res = await fetch(`${API_URL}/api/tools/home-ties/score`, {
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
        setError(data.error || data.message || 'Failed to score');
      }
    } catch (e: any) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cfg = result ? RATING_CONFIG[result.rating] : null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg bg-[#0F2557] flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Home Ties Strength Scorer</h1>
        </div>
        <p className="text-gray-600 ml-13">
          Assess an applicant's ties to their home country before submitting a tourist, visitor, or student visa.
          Identifies refusal risk areas <em>before</em> the application goes in.
        </p>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          Based on UK Appendix V, Schengen Article 14/21, and US INA Section 214(b) assessment criteria.
          Use this tool at the start of every short-stay visa case.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Visa Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Destination Country</Label>
                <Input
                  placeholder="e.g. United Kingdom, Germany, Canada"
                  value={form.destinationCountry}
                  onChange={e => set('destinationCountry', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Visa Type</Label>
                <Select value={form.visaType} onValueChange={v => set('visaType', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tourist">Tourist / Holiday</SelectItem>
                    <SelectItem value="visitor">Visitor / Family</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="other">Other Short-Stay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Employment & Income</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Employment Status</Label>
                <Select value={form.employmentStatus} onValueChange={v => set('employmentStatus', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employed_full_time">Employed full-time</SelectItem>
                    <SelectItem value="employed_part_time">Employed part-time</SelectItem>
                    <SelectItem value="self_employed">Self-employed / Business owner</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Time in Current Role / Business</Label>
                <Select value={form.employmentDuration} onValueChange={v => set('employmentDuration', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select duration" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="over_3_years">3+ years</SelectItem>
                    <SelectItem value="1_to_3_years">1–3 years</SelectItem>
                    <SelectItem value="under_1_year">Less than 1 year</SelectItem>
                    <SelectItem value="new_job">New job / recent change</SelectItem>
                    <SelectItem value="not_applicable">Not applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Monthly Income vs Trip Cost</Label>
                <Select value={form.monthlyIncome} onValueChange={v => set('monthlyIncome', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select ratio" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="over_3x_trip_cost">Income covers trip cost 3x+</SelectItem>
                    <SelectItem value="2x_to_3x">Income covers trip cost 2–3x</SelectItem>
                    <SelectItem value="1x_to_2x">Income barely covers trip</SelectItem>
                    <SelectItem value="under_1x">Income insufficient for trip</SelectItem>
                    <SelectItem value="unknown">Income not confirmed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Property & Family</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Property / Residence</Label>
                <Select value={form.propertyOwnership} onValueChange={v => set('propertyOwnership', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owns_property">Owns property in home country</SelectItem>
                    <SelectItem value="family_home">Lives in family-owned home</SelectItem>
                    <SelectItem value="long_term_renting">Long-term rental (stable address)</SelectItem>
                    <SelectItem value="no_fixed_address">No fixed address</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Family Remaining in Home Country</Label>
                <Select value={form.familyInHomeCountry} onValueChange={v => set('familyInHomeCountry', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse_children_left_behind">Spouse and/or children staying behind</SelectItem>
                    <SelectItem value="parents_siblings">Parents / siblings in home country</SelectItem>
                    <SelectItem value="extended_family_only">Extended family only</SelectItem>
                    <SelectItem value="none">No family ties at home</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Financial & Travel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Ongoing Financial Commitments</Label>
                <Select value={form.financialCommitments} onValueChange={v => set('financialCommitments', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mortgage_or_bond">Mortgage / property bond</SelectItem>
                    <SelectItem value="vehicle_loan_or_business">Vehicle finance or active business</SelectItem>
                    <SelectItem value="small_obligations">Small obligations (credit, store accounts)</SelectItem>
                    <SelectItem value="none">No ongoing commitments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bank Account Profile</Label>
                <Select value={form.bankAccountProfile} onValueChange={v => set('bankAccountProfile', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular_salary_6_months">Regular salary deposits (6+ months history)</SelectItem>
                    <SelectItem value="some_savings">Some consistent savings</SelectItem>
                    <SelectItem value="lump_sum_recently">Lump sum deposited recently</SelectItem>
                    <SelectItem value="minimal">Minimal / inconsistent balance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prior Travel History</Label>
                <Select value={form.priorTravelHistory} onValueChange={v => set('priorTravelHistory', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_prior_visas">Multiple prior visas / stamps</SelectItem>
                    <SelectItem value="one_or_two_prior">1–2 prior visa grants</SelectItem>
                    <SelectItem value="none_but_clean_record">No prior travel, clean record</SelectItem>
                    <SelectItem value="no_history">No travel history at all</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleScore}
            disabled={!isComplete || loading}
            className="w-full bg-[#0F2557] hover:bg-[#0a1d42] h-12 text-base"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Calculating Score...</>
            ) : (
              <><BarChart2 className="w-5 h-5 mr-2" /> Calculate Home Ties Score</>
            )}
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-5">
          {!result ? (
            <Card className="h-64 flex items-center justify-center">
              <CardContent className="text-center text-gray-400">
                <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Fill in the form to see the score</p>
                <p className="text-sm mt-1">Results appear here instantly</p>
              </CardContent>
            </Card>
          ) : cfg ? (
            <>
              {/* Score Card */}
              <Card className={cn('border-2', cfg.bg)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <cfg.Icon className={cn('w-6 h-6', cfg.color)} />
                      <span className={cn('font-bold text-lg', cfg.color)}>{cfg.label}</span>
                    </div>
                    <Badge className={RISK_BADGE[result.riskLevel]}>
                      {result.riskLevel.replace('_', ' ').toUpperCase()} RISK
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Score</span>
                      <span className="font-bold">{result.score} / {result.maxScore} ({result.percentage}%)</span>
                    </div>
                    <Progress value={result.percentage} className="h-4" />
                  </div>

                  <p className="text-sm text-gray-700 bg-white/60 rounded p-3">{result.summaryNote}</p>
                </CardContent>
              </Card>

              {/* Breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.breakdown.map((b) => {
                    const pct = Math.round((b.score / b.max) * 100);
                    const color = pct >= 67 ? 'bg-green-500' : pct >= 34 ? 'bg-amber-500' : 'bg-red-500';
                    return (
                      <div key={b.category}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="font-medium text-gray-700">{b.category}</span>
                          <span className="text-gray-500">{b.score}/{b.max} — {b.label}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Strengths */}
              {result.strengths.length > 0 && (
                <Card className="border-green-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="w-4 h-4" /> Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {result.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Weaknesses */}
              {result.weaknesses.length > 0 && (
                <Card className="border-red-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                      <XCircle className="w-4 h-4" /> Weak Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {result.weaknesses.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <Card className="border-amber-100 bg-amber-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
                      <FileText className="w-4 h-4" /> Recommendations Before Submission
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-amber-900">
                        <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
