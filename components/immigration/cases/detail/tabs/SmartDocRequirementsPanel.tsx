'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { ImmigrationCase } from '@/types/immigration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wand2,
  ExternalLink,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronRight,
  Zap,
  ShieldAlert,
  Info,
  CalendarClock,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Requirement {
  id: string;
  name: string;
  description: string;
  category: string;
  isRequired: boolean;
  estimatedDays: number;
  officialSource: string;
  canAIGenerate: boolean;
  aiDocType: string | null;
  notes: string;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
}

interface Intelligence {
  summary: string;
  requirements: Requirement[];
  knownGotchas: string[];
  criticalPath: string[];
  estimatedReadinessWeeks: number;
}

interface UploadedDoc {
  name: string;
  status: string;
  category: string;
}

interface SmartDocRequirementsPanelProps {
  caseData: ImmigrationCase;
  caseId: string;
  uploadedDocs: UploadedDoc[];
  onSelectAIDocType: (docTypeId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  identity: '🛂 Identity',
  financial: '💰 Financial',
  educational: '🎓 Educational',
  employment: '💼 Employment',
  travel: '✈️ Travel',
  supporting: '📎 Supporting',
  medical: '🏥 Medical',
  legal: '⚖️ Legal',
};

const URGENCY_CONFIG: Record<string, { label: string; class: string }> = {
  critical: { label: 'Critical', class: 'bg-red-100 text-red-800 border-red-200' },
  high:     { label: 'High',     class: 'bg-orange-100 text-orange-800 border-orange-200' },
  medium:   { label: 'Medium',   class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  low:      { label: 'Optional', class: 'bg-gray-100 text-gray-600 border-gray-200' },
};

function getDaysLabel(days: number): string {
  if (days === 0) return 'Ready to submit';
  if (days <= 3) return `~${days}d`;
  if (days <= 14) return `~${days}d`;
  if (days <= 30) return `~${Math.round(days / 7)}wk`;
  return `~${Math.round(days / 7)}wk`;
}

function getDaysClass(days: number): string {
  if (days === 0) return 'text-green-600';
  if (days <= 7) return 'text-yellow-600';
  if (days <= 21) return 'text-orange-600';
  return 'text-red-600';
}

// Fuzzy match: is this document likely covered by uploaded docs?
function isLikelyCovered(req: Requirement, uploadedDocs: UploadedDoc[]): boolean {
  const nameLower = req.name.toLowerCase();
  return uploadedDocs.some((d) => {
    const docLower = d.name.toLowerCase();
    // Check word overlap
    const reqWords = nameLower.split(/\s+/).filter((w) => w.length > 3);
    return (
      reqWords.some((w) => docLower.includes(w)) &&
      d.status !== 'rejected'
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function SmartDocRequirementsPanel({
  caseData,
  caseId,
  uploadedDocs,
  onSelectAIDocType,
}: SmartDocRequirementsPanelProps) {
  const [intelligence, setIntelligence] = useState<Intelligence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(['identity', 'financial', 'supporting']));

  const canGenerate =
    !!caseData.visaType && !!caseData.originCountry && !!caseData.destinationCountry;

  // ── Auto-load on first render if case has required fields ──────────────
  useEffect(() => {
    if (canGenerate && !hasLoaded && !isLoading) {
      handleGenerate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;
    try {
      setIsLoading(true);
      setError(null);

      const res = await immigrationApi.getPreDocRequirements({
        caseId,
        visaType: caseData.visaType || undefined,
        originCountry: caseData.originCountry || undefined,
        destinationCountry: caseData.destinationCountry || undefined,
      });

      if (res.success && res.data) {
        setIntelligence(res.data);
        setHasLoaded(true);
        // Open all categories initially
        const cats = new Set<string>(res.data.requirements.map((r) => r.category));
        setOpenCategories(cats);
      } else {
        throw new Error(res.error || 'Failed to generate requirements');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to generate requirements';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [caseId, caseData, canGenerate]);

  // ── Missing fields warning ─────────────────────────────────────────────
  if (!canGenerate) {
    const missing: string[] = [];
    if (!caseData.visaType) missing.push('Visa Type');
    if (!caseData.originCountry) missing.push('Origin Country');
    if (!caseData.destinationCountry) missing.push('Destination Country');

    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Cannot generate requirements</strong> — please set the following case fields first:{' '}
          {missing.join(', ')}. Edit the case overview to add these details.
        </AlertDescription>
      </Alert>
    );
  }

  // ── Loading state ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-[#0F2557]/5 rounded-lg border border-[#0F2557]/20">
          <Loader2 className="w-5 h-5 text-[#0F2557] animate-spin flex-shrink-0" />
          <div>
            <p className="font-semibold text-[#0F2557] text-sm">
              Generating smart document requirements…
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Analysing {caseData.originCountry} → {caseData.destinationCountry} {caseData.visaType} requirements with country-specific rules
            </p>
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error && !intelligence) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={handleGenerate} className="ml-4 flex-shrink-0">
            <RefreshCw className="w-3 h-3 mr-1" /> Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // ── No data yet ────────────────────────────────────────────────────────
  if (!intelligence) return null;

  // ── Compute stats ──────────────────────────────────────────────────────
  const required = intelligence.requirements.filter((r) => r.isRequired);
  const covered = required.filter((r) => isLikelyCovered(r, uploadedDocs));
  const aiGeneratable = intelligence.requirements.filter((r) => r.canAIGenerate && r.isRequired);
  const completionPct = required.length > 0 ? Math.round((covered.length / required.length) * 100) : 0;
  const maxDays = Math.max(...intelligence.requirements.filter((r) => r.isRequired && !isLikelyCovered(r, uploadedDocs)).map((r) => r.estimatedDays), 0);

  // Group by category
  const byCategory = intelligence.requirements.reduce<Record<string, Requirement[]>>((acc, req) => {
    const cat = req.category || 'supporting';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(req);
    return acc;
  }, {});

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* ── Header bar ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Smart Document Requirements
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {caseData.originCountry} → {caseData.destinationCountry} · {caseData.visaType}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGenerate}
          disabled={isLoading}
          className="text-gray-500 hover:text-gray-800"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Refresh
        </Button>
      </div>

      {/* ── Summary card ─────────────────────────────────────────────────── */}
      <div className="rounded-lg border bg-gradient-to-br from-[#0F2557]/5 to-white p-4 space-y-3">
        <p className="text-sm text-gray-700 leading-relaxed">{intelligence.summary}</p>

        {/* Progress */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#0F2557]">{required.length}</p>
            <p className="text-xs text-gray-500">Required docs</p>
          </div>
          <div className="text-center">
            <p className={cn('text-2xl font-bold', getDaysClass(maxDays))}>
              {maxDays === 0 ? '—' : getDaysLabel(maxDays)}
            </p>
            <p className="text-xs text-gray-500">Longest lead time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{intelligence.estimatedReadinessWeeks}wk</p>
            <p className="text-xs text-gray-500">Est. readiness</p>
          </div>
        </div>

        {required.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Documents received</span>
              <span className="text-xs font-semibold">{covered.length}/{required.length}</span>
            </div>
            <Progress value={completionPct} className="h-2" />
          </div>
        )}
      </div>

      {/* ── Critical Path ────────────────────────────────────────────────── */}
      {intelligence.criticalPath.length > 0 && (
        <Card className="border-blue-100 bg-blue-50/40">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
              <CalendarClock className="w-4 h-4" />
              Action Order (Start These First)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <ol className="space-y-1">
              {intelligence.criticalPath.map((step, i) => (
                <li key={i} className="text-xs text-blue-800 flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-[10px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* ── Known Gotchas ────────────────────────────────────────────────── */}
      {intelligence.knownGotchas.length > 0 && (
        <Card className="border-red-100 bg-red-50/40">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2 text-red-800">
              <ShieldAlert className="w-4 h-4" />
              Common Refusal Triggers — Read Carefully
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-1.5">
            {intelligence.knownGotchas.map((g, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-red-800">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-500" />
                <span>{g}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Document list grouped by category ────────────────────────────── */}
      <div className="space-y-2">
        {Object.entries(byCategory)
          .sort(([a], [b]) => {
            const order = ['identity', 'financial', 'educational', 'employment', 'medical', 'legal', 'travel', 'supporting'];
            return order.indexOf(a) - order.indexOf(b);
          })
          .map(([category, docs]) => {
            const isOpen = openCategories.has(category);
            const categoryRequired = docs.filter((d) => d.isRequired);
            const categoryCovered = categoryRequired.filter((d) => isLikelyCovered(d, uploadedDocs));
            const hasCritical = docs.some((d) => d.urgencyLevel === 'critical' && !isLikelyCovered(d, uploadedDocs));

            return (
              <Collapsible key={category} open={isOpen} onOpenChange={() => toggleCategory(category)}>
                <CollapsibleTrigger className="w-full">
                  <div className={cn(
                    'flex items-center justify-between px-4 py-2.5 rounded-lg border transition-colors',
                    isOpen ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100 hover:bg-gray-50',
                    hasCritical && 'border-l-4 border-l-red-400'
                  )}>
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm font-semibold text-gray-800">
                        {CATEGORY_LABELS[category] || `📎 ${category}`}
                      </span>
                      {hasCritical && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-red-100 text-red-700 border border-red-200">
                          critical
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {categoryCovered.length}/{categoryRequired.length} ready
                      </span>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="mt-1 space-y-1.5 pl-2">
                    {docs.map((req) => {
                      const covered = isLikelyCovered(req, uploadedDocs);
                      const urgency = URGENCY_CONFIG[req.urgencyLevel] || URGENCY_CONFIG.low;

                      return (
                        <div
                          key={req.id}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-lg border text-sm transition-colors',
                            covered
                              ? 'bg-green-50 border-green-200'
                              : req.urgencyLevel === 'critical'
                              ? 'bg-red-50/60 border-red-200'
                              : 'bg-white border-gray-200'
                          )}
                        >
                          {/* Status icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {covered ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : req.estimatedDays > 0 ? (
                              <Clock className={cn('w-4 h-4', getDaysClass(req.estimatedDays))} />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={cn('font-semibold', covered ? 'text-green-800 line-through' : 'text-gray-900')}>
                                  {req.name}
                                </span>
                                {!req.isRequired && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    optional
                                  </Badge>
                                )}
                                <Badge className={cn('text-[10px] px-1.5 py-0 border', urgency.class)}>
                                  {urgency.label}
                                </Badge>
                                {req.estimatedDays > 0 && !covered && (
                                  <span className={cn('text-xs font-medium', getDaysClass(req.estimatedDays))}>
                                    {getDaysLabel(req.estimatedDays)} to obtain
                                  </span>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {req.canAIGenerate && !covered && req.aiDocType && (
                                  <Button
                                    size="sm"
                                    onClick={() => onSelectAIDocType(req.aiDocType!)}
                                    className="h-6 px-2 text-[10px] bg-[#0F2557] hover:bg-[#0a1d42]"
                                  >
                                    <Wand2 className="w-3 h-3 mr-1" />
                                    Generate
                                  </Button>
                                )}
                                {req.officialSource && (
                                  <TooltipProvider delayDuration={200}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <a
                                          href={req.officialSource.startsWith('http') ? req.officialSource : `https://${req.officialSource}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-500 hover:text-blue-700"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs">{req.officialSource}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                              {req.description}
                            </p>

                            {/* Country-specific notes */}
                            {req.notes && !covered && (
                              <div className="mt-1.5 flex items-start gap-1.5 p-2 rounded bg-amber-50 border border-amber-100">
                                <Info className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 leading-relaxed">{req.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
      </div>
    </div>
  );
}
