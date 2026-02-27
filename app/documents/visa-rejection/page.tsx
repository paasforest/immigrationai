'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  AlertTriangle,
  FileText,
  Loader,
  Copy,
  CheckCircle,
  XCircle,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const ORIGIN_COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Zimbabwe', 'Ethiopia',
  'Uganda', 'Tanzania', 'Cameroon', 'Zambia', 'Senegal', 'Rwanda',
];

const TARGET_COUNTRIES = [
  'United Kingdom', 'Canada', 'United States', 'Australia', 'Germany',
  'UAE', 'Netherlands', 'New Zealand', 'Ireland', 'Schengen (Schengen Area)',
];

const VISA_TYPES = [
  'Skilled Worker Visa', 'Student Visa', 'Standard Visitor Visa',
  'Express Entry', 'Study Permit', 'F-1 Student Visa',
  'Skilled Migration', 'Employment Visa', 'Tourist Visa', 'Family Visa',
  'Business Visa', 'Permanent Residency',
];

const SEVERITY_CONFIG = {
  low: { color: 'text-green-700 bg-green-50 border-green-200', label: 'Low Risk', icon: '🟢' },
  medium: { color: 'text-amber-700 bg-amber-50 border-amber-200', label: 'Medium Risk', icon: '🟡' },
  high: { color: 'text-orange-700 bg-orange-50 border-orange-200', label: 'High Risk', icon: '🟠' },
  critical: { color: 'text-red-700 bg-red-50 border-red-200', label: 'Critical', icon: '🔴' },
};

export default function VisaRejectionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('summary');

  const [formData, setFormData] = useState({
    applicantName: '',
    originCountry: '',
    targetCountry: '',
    visaType: 'Student Visa',
    rejectionDate: '',
    rejectionReason: '',
    rejectionLetter: '',
    previousAttempts: '0',
    documentsSubmitted: '',
    concerns: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAnalyze = async () => {
    if (!formData.targetCountry || !formData.visaType) {
      alert('Please fill in target country and visa type.');
      return;
    }
    if (!formData.rejectionLetter && !formData.rejectionReason) {
      alert('Please paste the rejection letter or at least the stated reason.');
      return;
    }

    setIsLoading(true);
    setReport(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-rejection-v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          applicantName: formData.applicantName || 'Applicant',
          originCountry: formData.originCountry || '',
          targetCountry: formData.targetCountry,
          visaType: formData.visaType,
          rejectionDate: formData.rejectionDate || undefined,
          rejectionReason: formData.rejectionReason || undefined,
          rejectionLetter: formData.rejectionLetter || undefined,
          previousAttempts: parseInt(formData.previousAttempts || '0', 10) || 0,
          documentsSubmitted: formData.documentsSubmitted
            ? formData.documentsSubmitted.split(',').map((s) => s.trim()).filter(Boolean)
            : undefined,
          concerns: formData.concerns || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setReport(data.data.analysis);
      } else {
        alert(data.message || 'Failed to analyze rejection');
      }
    } catch {
      alert('Failed to analyze. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const toggle = (s: string) => setExpandedSection(expandedSection === s ? null : s);

  const severity = report?.severity as keyof typeof SEVERITY_CONFIG;
  const severityConf = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Dashboard</span>
          </Link>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-gray-800">Visa Rejection Analyzer</span>
            <Badge className="bg-orange-100 text-orange-700 text-xs">Powered by Route Intelligence</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Turn Your Refusal Into a <span className="text-orange-600">Winning Reapplication</span>
          </h1>
          <p className="text-gray-600">
            Paste your refusal letter. Our AI cross-references it against verified country-pair rules to pinpoint the officer's real concerns and build a precise reapplication roadmap.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ── Left: Input Form ── */}
          <div className="space-y-4">
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Refusal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  name="applicantName"
                  value={formData.applicantName}
                  onChange={handleInputChange}
                  placeholder="Applicant Full Name"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Origin Country</label>
                    <select
                      name="originCountry"
                      value={formData.originCountry}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select country…</option>
                      {ORIGIN_COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Target Country *</label>
                    <select
                      name="targetCountry"
                      value={formData.targetCountry}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select…</option>
                      {TARGET_COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Visa Type *</label>
                    <select
                      name="visaType"
                      value={formData.visaType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {VISA_TYPES.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Refusal Date</label>
                    <Input
                      type="date"
                      name="rejectionDate"
                      value={formData.rejectionDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Previous Attempts</label>
                    <Input
                      type="number"
                      name="previousAttempts"
                      value={formData.previousAttempts}
                      onChange={handleInputChange}
                      min="0"
                      max="10"
                    />
                  </div>
                  <div />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Refusal Letter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-medium">
                    Stated Reason (from letter)
                  </label>
                  <Input
                    name="rejectionReason"
                    value={formData.rejectionReason}
                    onChange={handleInputChange}
                    placeholder="e.g. Not satisfied you will leave at end of visit"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-medium">
                    Full Refusal Letter Text (paste here for best results)
                  </label>
                  <Textarea
                    name="rejectionLetter"
                    value={formData.rejectionLetter}
                    onChange={handleInputChange}
                    placeholder="Paste the full text of your refusal letter here…"
                    rows={6}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-medium">
                    Documents You Submitted (comma-separated)
                  </label>
                  <Input
                    name="documentsSubmitted"
                    value={formData.documentsSubmitted}
                    onChange={handleInputChange}
                    placeholder="e.g. Passport, Bank Statements, Employment Letter"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-medium">
                    Your Concerns / Additional Context
                  </label>
                  <Textarea
                    name="concerns"
                    value={formData.concerns}
                    onChange={handleInputChange}
                    placeholder="Anything specific you want the AI to consider…"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing against Route Intelligence…
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Refusal
                </>
              )}
            </Button>
          </div>

          {/* ── Right: Results ── */}
          <div className="space-y-4">
            {!report && !isLoading && (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="py-20 text-center">
                  <AlertTriangle className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-600 font-medium mb-2">Analysis will appear here</h3>
                  <p className="text-sm text-gray-400 max-w-xs mx-auto">
                    Our AI will cross-reference your refusal against verified rules for your specific route and give you a precise reapplication roadmap.
                  </p>
                </CardContent>
              </Card>
            )}

            {isLoading && (
              <Card>
                <CardContent className="py-16 text-center">
                  <Loader className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
                  <div className="text-gray-700 font-medium">Analyzing your refusal…</div>
                  <div className="text-sm text-gray-500 mt-1">Cross-referencing against verified route rules</div>
                </CardContent>
              </Card>
            )}

            {report && (
              <div className="space-y-3">
                {/* Severity badge */}
                <Card className={`border-2 ${severityConf.color}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{severityConf.icon}</span>
                      <div>
                        <div className="font-bold text-lg">{severityConf.label}</div>
                        <div className="text-sm opacity-80">
                          AI Confidence: {Math.round((report.confidence || 0.7) * 100)}%
                          {report.knownPatternMatch && (
                            <span className="ml-2 text-purple-700 font-medium">✓ Known Refusal Pattern</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => copyText(report.rootCauseSummary || '', 'summary')}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      {copiedSection === 'summary' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </CardContent>
                </Card>

                {/* Root Cause */}
                <SectionCard
                  id="summary"
                  title="📋 Root Cause Analysis"
                  expanded={expandedSection === 'summary'}
                  onToggle={() => toggle('summary')}
                >
                  <p className="text-sm text-gray-700 leading-relaxed">{report.rootCauseSummary}</p>

                  {report.routeSpecificWarnings?.length > 0 && (
                    <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="text-xs font-bold text-purple-800 mb-1">
                        🗺 {formData.originCountry || 'Country'}-Specific Warnings
                      </div>
                      {report.routeSpecificWarnings.map((w: string, i: number) => (
                        <div key={i} className="text-xs text-purple-700">• {w}</div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                {/* Officer Concerns */}
                {report.officerConcerns?.length > 0 && (
                  <SectionCard
                    id="concerns"
                    title={`🔍 Officer's Real Concerns (${report.officerConcerns.length})`}
                    expanded={expandedSection === 'concerns'}
                    onToggle={() => toggle('concerns')}
                  >
                    {report.officerConcerns.map((c: string, i: number) => (
                      <div key={i} className="flex gap-2 text-sm text-gray-700 mb-1">
                        <span className="text-orange-500 flex-shrink-0">⚠</span>
                        {c}
                      </div>
                    ))}
                  </SectionCard>
                )}

                {/* Missing Evidence */}
                {report.missingEvidence?.length > 0 && (
                  <SectionCard
                    id="missing"
                    title={`❌ Missing Evidence (${report.missingEvidence.length})`}
                    expanded={expandedSection === 'missing'}
                    onToggle={() => toggle('missing')}
                  >
                    {report.missingEvidence.map((e: string, i: number) => (
                      <div key={i} className="flex gap-2 text-sm text-red-700 mb-1">
                        <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        {e}
                      </div>
                    ))}
                  </SectionCard>
                )}

                {/* Recommended Fixes */}
                {report.recommendedFixes?.length > 0 && (
                  <SectionCard
                    id="fixes"
                    title={`✅ Recommended Fixes (${report.recommendedFixes.length})`}
                    expanded={expandedSection === 'fixes'}
                    onToggle={() => toggle('fixes')}
                  >
                    {report.recommendedFixes.map((f: string, i: number) => (
                      <div key={i} className="flex gap-2 text-sm text-green-800 mb-1.5 bg-green-50 rounded px-2 py-1">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-green-600" />
                        {f}
                      </div>
                    ))}
                  </SectionCard>
                )}

                {/* Timeline */}
                {report.timeline?.length > 0 && (
                  <SectionCard
                    id="timeline"
                    title="📅 Reapplication Timeline"
                    expanded={expandedSection === 'timeline'}
                    onToggle={() => toggle('timeline')}
                  >
                    <div className="space-y-2">
                      {report.timeline.map((t: any, i: number) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0F2557] text-white text-xs flex items-center justify-center font-bold">
                            {i + 1}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800">{t.step}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {t.dueBy}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* Reapplication Checklist */}
                {report.reapplicationChecklist?.length > 0 && (
                  <SectionCard
                    id="checklist"
                    title="📝 Reapplication Checklist"
                    expanded={expandedSection === 'checklist'}
                    onToggle={() => toggle('checklist')}
                  >
                    {report.reapplicationChecklist.map((item: any, i: number) => (
                      <div key={i} className="border border-gray-100 rounded-lg p-3 mb-2 bg-white">
                        <div className="flex items-start gap-2">
                          <Badge className={`text-xs flex-shrink-0 ${item.status === 'required' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {item.status}
                          </Badge>
                          <div>
                            <div className="text-sm font-medium text-gray-800">{item.item}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{item.details}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </SectionCard>
                )}

                {/* Risk Factors */}
                {report.riskFactors?.length > 0 && (
                  <SectionCard
                    id="risks"
                    title={`⚠ Risk Factors (${report.riskFactors.length})`}
                    expanded={expandedSection === 'risks'}
                    onToggle={() => toggle('risks')}
                  >
                    {report.riskFactors.map((r: string, i: number) => (
                      <div key={i} className="text-sm text-orange-700 mb-1 flex gap-2">
                        <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        {r}
                      </div>
                    ))}
                  </SectionCard>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionCard({
  id, title, expanded, onToggle, children,
}: {
  id: string;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-gray-200">
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expanded && (
        <CardContent className="pt-0 pb-4 px-4 border-t border-gray-100">{children}</CardContent>
      )}
    </Card>
  );
}
