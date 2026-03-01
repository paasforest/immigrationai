'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ImmigrationCase } from '@/types/immigration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader,
  ShieldCheck,
  FileWarning,
  Info,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

interface ValidationIssue {
  severity: 'critical' | 'warning' | 'info';
  field: string;
  description: string;
  documentA: string;
  documentB: string;
  valueA: string;
  valueB: string;
  recommendation: string;
}

interface ValidationResult {
  passed: boolean;
  score: number;
  totalChecks: number;
  issuesFound: number;
  issues: ValidationIssue[];
  summary: string;
}

interface ValidationTabProps {
  caseData: ImmigrationCase;
}

const SEVERITY_CONFIG = {
  critical: {
    label: 'Critical',
    icon: <XCircle className="w-4 h-4 text-red-500" />,
    badge: 'bg-red-100 text-red-800',
    border: 'border-red-200 bg-red-50',
  },
  warning: {
    label: 'Warning',
    icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    badge: 'bg-amber-100 text-amber-800',
    border: 'border-amber-200 bg-amber-50',
  },
  info: {
    label: 'Info',
    icon: <Info className="w-4 h-4 text-blue-500" />,
    badge: 'bg-blue-100 text-blue-800',
    border: 'border-blue-200 bg-blue-50',
  },
};

const FIELD_LABELS: Record<string, string> = {
  dates: '📅 Date Inconsistency',
  name: '👤 Name Mismatch',
  address: '🏠 Address Mismatch',
  financial: '💰 Financial Inconsistency',
  reference: '🔢 Reference Mismatch',
  expiry: '⏰ Expiry / Validity Issue',
  missing: '❌ Missing Document',
  system: '⚙️ System',
};

export default function ValidationTab({ caseData }: ValidationTabProps) {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());

  // Get document count from case data
  const documentCount = caseData._count?.caseDocuments || 0;
  const hasEnoughDocuments = documentCount >= 2;

  // Clear result if document count drops below threshold
  useEffect(() => {
    if (!hasEnoughDocuments && result) {
      setResult(null);
      setError(null);
    }
  }, [hasEnoughDocuments, documentCount, result]);

  const runValidation = useCallback(async () => {
    if (!hasEnoughDocuments) {
      setError(`Only ${documentCount} document(s) uploaded. Cross-validation requires at least 2 documents. Upload more documents to enable validation.`);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_BASE}/api/cases/${caseData.id}/cross-validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      } else {
        setError(json.message || 'Validation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Could not run validation. Check connection.');
    } finally {
      setLoading(false);
    }
  }, [caseData.id, hasEnoughDocuments, documentCount]);

  const toggleIssue = (idx: number) => {
    setExpandedIssues((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const criticals = result?.issues.filter((i) => i.severity === 'critical').length || 0;
  const warnings = result?.issues.filter((i) => i.severity === 'warning').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0F2557]" />
            Document Cross-Validation
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            AI scans all uploaded documents for inconsistencies that cause visa refusals — name mismatches, date conflicts, financial discrepancies.
          </p>
        </div>
        <Button
          onClick={runValidation}
          disabled={loading || !hasEnoughDocuments}
          className="bg-[#0F2557] hover:bg-[#1a3a7a] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Scanning…
            </>
          ) : result ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-run
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 mr-2" />
              Run Validation
            </>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-700 text-sm">{error}</CardContent>
        </Card>
      )}

      {/* Not enough documents state */}
      {!hasEnoughDocuments && !result && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-12 text-center">
            <FileWarning className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-amber-800 font-medium mb-2">Insufficient Documents</h3>
            <p className="text-sm text-amber-700 max-w-md mx-auto mb-4">
              Only {documentCount} document(s) uploaded. Cross-validation requires at least 2 documents to compare for inconsistencies.
            </p>
            <p className="text-xs text-amber-600">
              Upload more documents in the Documents tab to enable validation.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state - ready to validate */}
      {hasEnoughDocuments && !result && !loading && !error && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="py-16 text-center">
            <FileWarning className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-700 font-medium mb-2">Ready to validate</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Click "Run Validation" to scan all {documentCount} documents in this case for inconsistencies that could trigger a refusal — names, dates, financial figures, addresses, and more.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && hasEnoughDocuments && (
        <div className="space-y-4">
          {/* Score card */}
          <Card className={result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {result.passed ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500" />
                  )}
                  <div>
                    <div className={`text-lg font-bold ${result.passed ? 'text-green-800' : 'text-red-800'}`}>
                      {result.passed ? 'Validation Passed' : 'Issues Found'}
                    </div>
                    <div className="text-sm text-gray-600">{result.summary || `Validated ${documentCount} document(s)`}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${result.score >= 80 ? 'text-green-600' : result.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                    {result.score}
                  </div>
                  <div className="text-xs text-gray-500">Consistency Score</div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                  <div className="text-2xl font-bold text-gray-800">{result.totalChecks}</div>
                  <div className="text-xs text-gray-500">Checks Run</div>
                </div>
                <div className={`rounded-lg p-3 text-center border ${criticals > 0 ? 'bg-red-100 border-red-200' : 'bg-white border-gray-100'}`}>
                  <div className={`text-2xl font-bold ${criticals > 0 ? 'text-red-700' : 'text-gray-800'}`}>{criticals}</div>
                  <div className="text-xs text-gray-500">Critical Issues</div>
                </div>
                <div className={`rounded-lg p-3 text-center border ${warnings > 0 ? 'bg-amber-100 border-amber-200' : 'bg-white border-gray-100'}`}>
                  <div className={`text-2xl font-bold ${warnings > 0 ? 'text-amber-700' : 'text-gray-800'}`}>{warnings}</div>
                  <div className="text-xs text-gray-500">Warnings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues list */}
          {result.issues.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                Issues Requiring Attention
                <Badge className="bg-gray-100 text-gray-600 text-xs">{result.issues.length}</Badge>
              </h3>

              {result.issues.map((issue, idx) => {
                const config = SEVERITY_CONFIG[issue.severity];
                const isExpanded = expandedIssues.has(idx);

                return (
                  <Card key={idx} className={`border ${config.border}`}>
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleIssue(idx)}
                        className="w-full text-left p-3 flex items-center gap-3"
                      >
                        {config.icon}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`text-xs px-1.5 py-0 ${config.badge}`}>
                              {config.label}
                            </Badge>
                            <span className="text-xs font-medium text-gray-700">
                              {FIELD_LABELS[issue.field] || issue.field}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 mt-0.5 truncate">{issue.description}</div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="px-3 pb-3 pt-0 border-t border-gray-100 space-y-2">
                          {issue.documentA && (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-white rounded p-2 border border-gray-100">
                                <div className="font-medium text-gray-600 mb-1">📄 {issue.documentA}</div>
                                <div className="text-gray-500">{issue.valueA || 'N/A'}</div>
                              </div>
                              {issue.documentB && (
                                <div className="bg-white rounded p-2 border border-gray-100">
                                  <div className="font-medium text-gray-600 mb-1">📄 {issue.documentB}</div>
                                  <div className="text-gray-500">{issue.valueB || 'N/A'}</div>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="bg-white rounded-lg p-2 border border-emerald-100">
                            <div className="text-xs font-medium text-emerald-700 mb-1">💡 Recommendation</div>
                            <div className="text-xs text-gray-600">{issue.recommendation}</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {result.issues.length === 0 && result.passed && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="py-8 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <div className="text-green-800 font-medium">No inconsistencies detected</div>
                <div className="text-sm text-green-600 mt-1">All documents appear consistent with each other.</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
