'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  GraduationCap,
  Home,
  Wallet,
  Plane,
  Globe,
  RefreshCw,
} from 'lucide-react';

export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';

export interface RiskFactor {
  key: string;
  label: string;
  riskLevel: RiskLevel;
  detail: string;
  toolLink?: string;
  toolLabel?: string;
  checklistHints?: string[];
}

export interface RiskProfile {
  factors: RiskFactor[];
  overallRisk: RiskLevel;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  credentialEvalBody?: {
    body: string;
    url: string;
    mandatory: boolean;
    note?: string;
  } | null;
  scoredAt: string;
}

function RiskBadge({ level }: { level: RiskLevel }) {
  switch (level) {
    case 'high':
      return (
        <Badge className="bg-red-100 text-red-700 border border-red-200 text-xs font-semibold">
          🔴 High Risk
        </Badge>
      );
    case 'medium':
      return (
        <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold">
          🟡 Medium
        </Badge>
      );
    case 'low':
      return (
        <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs font-semibold">
          🟢 Low
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-500 border border-gray-200 text-xs font-semibold">
          ⚪ Unknown
        </Badge>
      );
  }
}

function FactorIcon({ factorKey }: { factorKey: string }) {
  const iconClass = 'w-4 h-4 flex-shrink-0 mt-0.5';
  switch (factorKey) {
    case 'home_ties':           return <Home className={iconClass} />;
    case 'credential_evaluation': return <GraduationCap className={iconClass} />;
    case 'rejection_history':   return <ShieldAlert className={iconClass} />;
    case 'financial_sufficiency': return <Wallet className={iconClass} />;
    case 'travel_history':      return <Plane className={iconClass} />;
    case 'eu_free_movement':    return <Globe className={iconClass} />;
    default:                    return <AlertCircle className={iconClass} />;
  }
}

function OverallRiskBanner({ profile }: { profile: RiskProfile }) {
  const { overallRisk, highCount, mediumCount } = profile;

  if (overallRisk === 'high') {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-800">
            {highCount} high-risk factor{highCount > 1 ? 's' : ''} detected
          </p>
          <p className="text-xs text-red-600">
            Review the issues below before accepting. Use the linked tools to assess and build a stronger application.
          </p>
        </div>
      </div>
    );
  }

  if (overallRisk === 'medium') {
    return (
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            {mediumCount} factor{mediumCount > 1 ? 's' : ''} need attention
          </p>
          <p className="text-xs text-amber-600">
            This case is manageable but review the flagged areas below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-green-800">Profile looks clean</p>
        <p className="text-xs text-green-600">No significant risk flags detected from initial assessment.</p>
      </div>
    </div>
  );
}

interface LeadRiskPanelProps {
  riskProfile: RiskProfile;
}

export default function LeadRiskPanel({ riskProfile }: LeadRiskPanelProps) {
  const highAndMediumFactors = riskProfile.factors.filter(
    f => f.riskLevel === 'high' || f.riskLevel === 'medium'
  );
  const lowFactors = riskProfile.factors.filter(f => f.riskLevel === 'low');

  return (
    <div className="space-y-3">
      {/* Overall banner */}
      <OverallRiskBanner profile={riskProfile} />

      {/* Flagged factors */}
      {highAndMediumFactors.map(factor => (
        <div
          key={factor.key}
          className={`rounded-lg border p-4 space-y-2 ${
            factor.riskLevel === 'high'
              ? 'border-red-200 bg-red-50/50'
              : 'border-amber-200 bg-amber-50/50'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <FactorIcon factorKey={factor.key} />
              <span className="text-sm font-semibold text-gray-800">{factor.label}</span>
            </div>
            <RiskBadge level={factor.riskLevel} />
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">{factor.detail}</p>

          {/* Checklist hints */}
          {factor.checklistHints && factor.checklistHints.length > 0 && (
            <div className="pt-1">
              <p className="text-xs font-medium text-gray-500 mb-1">Documents to collect:</p>
              <ul className="space-y-0.5">
                {factor.checklistHints.map((hint, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tool link */}
          {factor.toolLink && factor.toolLabel && (
            <div className="pt-1">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-7 text-xs border-gray-300 hover:bg-white"
              >
                <Link href={factor.toolLink} target="_blank">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {factor.toolLabel}
                </Link>
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Low risk factors (collapsed summary) */}
      {lowFactors.length > 0 && (
        <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
          <p className="text-xs font-medium text-gray-500 mb-2">
            No issues detected ({lowFactors.length} factor{lowFactors.length > 1 ? 's' : ''})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {lowFactors.map(factor => (
              <div key={factor.key} className="flex items-center gap-1 text-xs text-gray-500">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span>{factor.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credential eval body */}
      {riskProfile.credentialEvalBody && (
        <div className="rounded-lg border border-blue-100 bg-blue-50/30 p-3 space-y-1">
          <p className="text-xs font-semibold text-blue-800">
            Credential Evaluation Body for this corridor
          </p>
          <p className="text-xs text-blue-700 font-medium">{riskProfile.credentialEvalBody.body}</p>
          {riskProfile.credentialEvalBody.note && (
            <p className="text-xs text-blue-600">{riskProfile.credentialEvalBody.note}</p>
          )}
          <a
            href={riskProfile.credentialEvalBody.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Visit official site
          </a>
        </div>
      )}

      {/* Scored at */}
      <p className="text-xs text-gray-400 text-right flex items-center justify-end gap-1">
        <RefreshCw className="w-3 h-3" />
        Risk assessed: {new Date(riskProfile.scoredAt).toLocaleString()}
      </p>
    </div>
  );
}
