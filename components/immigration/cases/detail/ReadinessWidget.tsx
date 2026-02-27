'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ReadinessCategory {
  name: string;
  score: number;
  maxScore: number;
  status: 'complete' | 'partial' | 'missing' | 'na';
  detail: string;
}

interface ReadinessData {
  score: number;
  label: string;
  color: 'red' | 'orange' | 'amber' | 'yellow' | 'green';
  breakdown: ReadinessCategory[];
  blockers: string[];
  warnings: string[];
  nextActions: string[];
  estimatedDaysToReady: number;
}

interface ReadinessWidgetProps {
  caseId: string;
}

const COLOR_MAP = {
  red: { ring: 'text-red-500', bg: 'bg-red-50', badge: 'bg-red-100 text-red-800', bar: 'bg-red-500' },
  orange: { ring: 'text-orange-500', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500' },
  amber: { ring: 'text-amber-500', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' },
  yellow: { ring: 'text-yellow-600', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-500' },
  green: { ring: 'text-green-500', bg: 'bg-green-50', badge: 'bg-green-100 text-green-800', bar: 'bg-green-500' },
};

const STATUS_ICON = {
  complete: <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
  partial: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
  missing: <XCircle className="w-3.5 h-3.5 text-red-500" />,
  na: <span className="w-3.5 h-3.5 text-gray-400 text-xs">—</span>,
};

export default function ReadinessWidget({ caseId }: ReadinessWidgetProps) {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/readiness-score`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'Failed to load');
      }
    } catch {
      setError('Could not load readiness score');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  if (loading && !data) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Loader className="w-4 h-4 animate-spin" />
        <span>Calculating readiness…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Button variant="ghost" size="sm" onClick={fetchScore} className="text-gray-500 text-xs">
        <TrendingUp className="w-3.5 h-3.5 mr-1" />
        Check Readiness
      </Button>
    );
  }

  const colors = COLOR_MAP[data.color] || COLOR_MAP.red;
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (data.score / 100) * circumference;

  return (
    <div className="flex flex-col gap-1">
      {/* Compact inline view */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colors.bg} border-gray-200 hover:shadow-sm transition-all`}
      >
        {/* SVG donut */}
        <svg width="40" height="40" viewBox="0 0 40 40" className="flex-shrink-0">
          <circle cx="20" cy="20" r="18" fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-700 ${colors.bar.replace('bg-', 'stroke-')}`}
            transform="rotate(-90 20 20)"
          />
          <text x="20" y="24" textAnchor="middle" fontSize="10" fontWeight="700" className={colors.ring.replace('text-', 'fill-')}>
            {data.score}
          </text>
        </svg>

        <div className="text-left min-w-0">
          <div className="text-xs font-semibold text-gray-700 leading-none">{data.label}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {data.blockers.length > 0
              ? `${data.blockers.length} blocker${data.blockers.length > 1 ? 's' : ''}`
              : data.warnings.length > 0
              ? `${data.warnings.length} warning${data.warnings.length > 1 ? 's' : ''}`
              : 'Looking good ✓'}
          </div>
        </div>

        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />}
      </button>

      {/* Expanded panel */}
      {expanded && (
        <Card className="border-gray-200 shadow-md w-72">
          <CardContent className="p-3 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Readiness Breakdown</span>
              <Badge className={`text-[10px] px-1.5 py-0.5 ${colors.badge}`}>{data.score}/100</Badge>
            </div>

            {/* Category bars */}
            <div className="space-y-1.5">
              {data.breakdown.map((cat) => (
                <TooltipProvider key={cat.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        {STATUS_ICON[cat.status]}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[10px] text-gray-600 truncate">{cat.name}</span>
                            <span className="text-[10px] text-gray-400 ml-1 flex-shrink-0">{cat.score}/{cat.maxScore}</span>
                          </div>
                          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
                              style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs max-w-48">
                      {cat.detail}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            {/* Blockers */}
            {data.blockers.length > 0 && (
              <div className="bg-red-50 rounded-md p-2">
                <div className="text-[10px] font-bold text-red-700 mb-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Blockers
                </div>
                {data.blockers.map((b, i) => (
                  <div key={i} className="text-[10px] text-red-600">• {b}</div>
                ))}
              </div>
            )}

            {/* Next actions */}
            {data.nextActions.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-gray-600 mb-1">Next Steps</div>
                {data.nextActions.map((a, i) => (
                  <div key={i} className="text-[10px] text-gray-500 flex gap-1">
                    <span className="text-gray-300">{i + 1}.</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            )}

            {data.estimatedDaysToReady > 0 && (
              <div className="text-[10px] text-gray-400 border-t pt-2">
                Est. {data.estimatedDaysToReady} day{data.estimatedDaysToReady > 1 ? 's' : ''} to submission-ready
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={fetchScore}
              disabled={loading}
              className="w-full text-[10px] h-6"
            >
              {loading ? <Loader className="w-3 h-3 animate-spin mr-1" /> : null}
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
