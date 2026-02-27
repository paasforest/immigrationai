/**
 * Case Intelligence Service
 * Powers:
 *   1. Document Cross-Validation — finds inconsistencies across all case documents
 *   2. Submission Readiness Score — 0-100 score with breakdown
 *   3. Rejection Analysis — route-aware refusal letter analysis
 *   4. Silent Eligibility Scoring — scores a lead profile against route rules
 */

import prisma from '../config/prisma';
import OpenAI from 'openai';
import { getVisaIntelligence, buildVisaContext } from './visaIntelligenceService';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface CrossValidationResult {
  passed: boolean;
  score: number; // 0-100 consistency score
  totalChecks: number;
  issuesFound: number;
  issues: CrossValidationIssue[];
  summary: string;
}

export interface CrossValidationIssue {
  severity: 'critical' | 'warning' | 'info';
  field: string;
  description: string;
  documentA: string;
  documentB: string;
  valueA: string;
  valueB: string;
  recommendation: string;
}

export interface ReadinessScore {
  score: number; // 0-100
  label: 'Not Ready' | 'Early Stage' | 'Getting There' | 'Almost Ready' | 'Ready to Submit';
  color: 'red' | 'orange' | 'amber' | 'yellow' | 'green';
  breakdown: ReadinessCategory[];
  blockers: string[];      // things that MUST be fixed before submitting
  warnings: string[];      // things that should be addressed
  nextActions: string[];   // ordered list of next steps
  estimatedDaysToReady: number;
}

export interface ReadinessCategory {
  name: string;
  score: number;
  maxScore: number;
  status: 'complete' | 'partial' | 'missing' | 'na';
  detail: string;
}

export interface RejectionAnalysis {
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  rootCauseSummary: string;
  officerConcerns: string[];
  missingEvidence: string[];
  riskFactors: string[];
  recommendedFixes: string[];
  nextSteps: string[];
  timeline: Array<{ step: string; dueBy: string }>;
  reapplicationChecklist: Array<{ item: string; status: 'required' | 'recommended'; details: string }>;
  knownPatternMatch: boolean; // true if we matched against known refusal patterns for this route
  routeSpecificWarnings: string[];
}

export interface EligibilityScoreResult {
  score: number; // 0-100
  verdict: 'strong' | 'possible' | 'borderline' | 'difficult' | 'unlikely';
  strengths: string[];
  concerns: string[];
  dealBreakers: string[];
  recommendedAction: 'proceed' | 'improve_profile' | 'consult_professional' | 'consider_alternative_route';
  routeFound: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. DOCUMENT CROSS-VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

export async function crossValidateDocuments(
  caseId: string,
  organizationId: string
): Promise<CrossValidationResult> {
  // Fetch all uploaded documents for this case
  const documents = await prisma.caseDocument.findMany({
    where: { caseId, organizationId },
    select: {
      id: true,
      name: true,
      fileType: true,
      category: true,
      status: true,
    },
  });

  // Fetch case details for route context
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    select: {
      title: true,
      visaType: true,
      originCountry: true,
      destinationCountry: true,
      applicant: { select: { fullName: true, email: true } },
    },
  });

  if (!caseData) {
    return {
      passed: false,
      score: 0,
      totalChecks: 0,
      issuesFound: 0,
      issues: [],
      summary: 'Case not found.',
    };
  }

  if (documents.length < 2) {
    return {
      passed: true,
      score: 100,
      totalChecks: 0,
      issuesFound: 0,
      issues: [],
      summary: `Only ${documents.length} document(s) uploaded. Cross-validation requires at least 2 documents. Upload more documents to enable validation.`,
    };
  }

  // Build document list for AI
  const docList = documents
    .map((d) => `• ${d.name} (type: ${d.fileType || d.category || 'unknown'}, status: ${d.status})`)
    .join('\n');

  const applicantName = caseData.applicant?.fullName || 'Unknown Applicant';

  const prompt = `You are an expert immigration document reviewer specializing in detecting inconsistencies that cause visa refusals.

CASE: ${caseData.title}
Applicant: ${applicantName}
Route: ${caseData.originCountry || 'Unknown'} → ${caseData.destinationCountry || 'Unknown'} | ${caseData.visaType || 'Unknown'}

UPLOADED DOCUMENTS:
${docList}

TASK: Based on the document types and names listed, identify:
1. Potential date inconsistencies (e.g. employment letter dated after visa application date)
2. Name spelling variations (e.g. "John Smith" vs "J. Smith" vs "Smith, John")
3. Address mismatches across documents
4. Financial figure inconsistencies
5. Reference number mismatches
6. Documents that may be missing based on the visa route
7. Documents that appear expired or too old for requirements

For each issue found, specify:
- severity: critical (will cause refusal) | warning (may cause concern) | info (minor note)
- which documents are involved
- what the inconsistency or concern is
- specific recommendation to fix it

Respond ONLY with valid JSON:
{
  "totalChecks": <number>,
  "issues": [
    {
      "severity": "critical"|"warning"|"info",
      "field": "dates|name|address|financial|reference|expiry|missing",
      "description": "clear description of the issue",
      "documentA": "document name",
      "documentB": "document name",
      "valueA": "value found in doc A",
      "valueB": "value found in doc B",
      "recommendation": "specific action to fix"
    }
  ],
  "summary": "2-3 sentence overall assessment"
}

Return only JSON. No markdown.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1500,
    });

    const raw = response.choices[0]?.message?.content || '{}';
    const cleaned = raw.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    const parsed = JSON.parse(cleaned);

    const issues: CrossValidationIssue[] = parsed.issues || [];
    const criticals = issues.filter((i) => i.severity === 'critical').length;
    const warnings = issues.filter((i) => i.severity === 'warning').length;

    // Score: start at 100, deduct per issue
    let score = 100;
    score -= criticals * 20;
    score -= warnings * 8;
    score = Math.max(0, score);

    return {
      passed: criticals === 0,
      score,
      totalChecks: parsed.totalChecks || issues.length,
      issuesFound: issues.length,
      issues,
      summary: parsed.summary || `Found ${issues.length} issue(s): ${criticals} critical, ${warnings} warnings.`,
    };
  } catch {
    return {
      passed: false,
      score: 0,
      totalChecks: 0,
      issuesFound: 1,
      issues: [
        {
          severity: 'info',
          field: 'system',
          description: 'Cross-validation service temporarily unavailable',
          documentA: '',
          documentB: '',
          valueA: '',
          valueB: '',
          recommendation: 'Please try again in a moment',
        },
      ],
      summary: 'Validation service error. Please try again.',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SUBMISSION READINESS SCORE
// ─────────────────────────────────────────────────────────────────────────────

function scoreLabel(score: number): ReadinessScore['label'] {
  if (score >= 90) return 'Ready to Submit';
  if (score >= 75) return 'Almost Ready';
  if (score >= 55) return 'Getting There';
  if (score >= 30) return 'Early Stage';
  return 'Not Ready';
}

function scoreColor(score: number): ReadinessScore['color'] {
  if (score >= 90) return 'green';
  if (score >= 75) return 'yellow';
  if (score >= 55) return 'amber';
  if (score >= 30) return 'orange';
  return 'red';
}

export async function calculateReadinessScore(
  caseId: string,
  organizationId: string
): Promise<ReadinessScore> {
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    select: {
      title: true,
      visaType: true,
      originCountry: true,
      destinationCountry: true,
      status: true,
      submissionDeadline: true,
      applicant: { select: { fullName: true } },
    },
  });

  if (!caseData) {
    return {
      score: 0,
      label: 'Not Ready',
      color: 'red',
      breakdown: [],
      blockers: ['Case not found'],
      warnings: [],
      nextActions: ['Check case configuration'],
      estimatedDaysToReady: 99,
    };
  }

  // Get uploaded documents
  const documents = await prisma.caseDocument.findMany({
    where: { caseId, organizationId },
    select: { name: true, fileType: true, category: true, status: true },
  });

  // Get task completion
  const tasks = await prisma.task.findMany({
    where: { caseId },
    select: { title: true, status: true, dueDate: true },
  });

  // Get checklist completion
  const checklist = await prisma.documentChecklist.findFirst({
    where: { caseId },
    include: { items: { select: { isCompleted: true, document: true } } },
  });

  // Get visa intelligence for this route
  const intel = await getVisaIntelligence(
    caseData.originCountry || '',
    caseData.destinationCountry || '',
    caseData.visaType || ''
  );

  // ── Category 1: Core Identity Docs (20 pts) ──
  const identityKeywords = ['passport', 'id ', 'identity', 'birth cert', 'national'];
  const hasIdentityDocs = documents.some((d) =>
    identityKeywords.some((kw) => d.name.toLowerCase().includes(kw))
  );
  const identityScore = hasIdentityDocs ? 20 : 0;
  const identityStatus: ReadinessCategory['status'] = hasIdentityDocs ? 'complete' : 'missing';

  // ── Category 2: Financial Proof (20 pts) ──
  const finKeywords = ['bank', 'financial', 'statement', 'funds', 'sponsor'];
  const hasFinancialDocs = documents.some((d) =>
    finKeywords.some((kw) => d.name.toLowerCase().includes(kw))
  );
  const financialScore = hasFinancialDocs ? 20 : 0;
  const financialStatus: ReadinessCategory['status'] = hasFinancialDocs ? 'complete' : 'missing';

  // ── Category 3: Route-Specific Required Docs (25 pts) ──
  let routeDocScore = 0;
  let routeDocStatus: ReadinessCategory['status'] = 'na';
  let routeDocDetail = 'No route data available';

  if (intel.found && intel.requirements.length > 0) {
    const criticalRequired = intel.requirements.filter(
      (r: any) => r.isRequired && r.urgencyLevel === 'critical' && !r.canAIGenerate
    );
    if (criticalRequired.length > 0) {
      const matched = criticalRequired.filter((req: any) =>
        documents.some((d) =>
          d.name.toLowerCase().includes(req.name.toLowerCase().split(' ')[0])
        )
      ).length;
      routeDocScore = Math.round((matched / criticalRequired.length) * 25);
      routeDocStatus = matched === criticalRequired.length ? 'complete' : matched > 0 ? 'partial' : 'missing';
      routeDocDetail = `${matched}/${criticalRequired.length} critical route documents present`;
    } else {
      routeDocScore = 20;
      routeDocStatus = 'complete';
      routeDocDetail = 'No critical client documents required for this route';
    }
  } else {
    routeDocScore = documents.length >= 3 ? 15 : documents.length * 5;
    routeDocStatus = documents.length >= 3 ? 'partial' : 'missing';
    routeDocDetail = `${documents.length} documents uploaded (route-specific rules not yet in database)`;
  }

  // ── Category 4: Supporting Documents (15 pts) ──
  const supportKeywords = ['sop', 'statement of purpose', 'cover letter', 'motivation', 'ties', 'itinerary'];
  const hasSupportDocs = documents.some((d) =>
    supportKeywords.some((kw) => d.name.toLowerCase().includes(kw))
  );
  const supportScore = hasSupportDocs ? 15 : 0;
  const supportStatus: ReadinessCategory['status'] = hasSupportDocs ? 'complete' : 'missing';

  // ── Category 5: Task Completion (10 pts) ──
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const taskScore = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 10) : 5;
  const taskStatus: ReadinessCategory['status'] =
    tasks.length === 0 ? 'na' : completedTasks === tasks.length ? 'complete' : 'partial';

  // ── Category 6: Checklist Completion (10 pts) ──
  let checklistScore = 5;
  let checklistStatus: ReadinessCategory['status'] = 'na';
  let checklistDetail = 'No checklist created yet';

  if (checklist && checklist.items.length > 0) {
    const completed = checklist.items.filter((i) => i.isCompleted).length;
    checklistScore = Math.round((completed / checklist.items.length) * 10);
    checklistStatus = completed === checklist.items.length ? 'complete' : 'partial';
    checklistDetail = `${completed}/${checklist.items.length} checklist items done`;
  }

  const totalScore = Math.min(
    100,
    identityScore + financialScore + routeDocScore + supportScore + taskScore + checklistScore
  );

  // Build blockers and warnings
  const blockers: string[] = [];
  const warnings: string[] = [];
  const nextActions: string[] = [];

  if (!hasIdentityDocs) {
    blockers.push('No identity/passport documents uploaded');
    nextActions.push('Upload valid passport (first priority)');
  }
  if (!hasFinancialDocs) {
    blockers.push('No financial proof documents uploaded');
    nextActions.push('Upload bank statements (minimum 3 months)');
  }
  if (intel.found && routeDocStatus === 'missing') {
    blockers.push(`Missing critical documents for ${intel.visaType} route`);
    nextActions.push('Review the Smart Pre-Doc Requirements panel in the Studio tab');
  }
  if (!hasSupportDocs) {
    warnings.push('No supporting documents (SOP, cover letter, etc.) generated or uploaded');
    nextActions.push('Use Document Studio to generate your SOP and cover letter');
  }
  if (taskStatus === 'partial') {
    warnings.push(`${tasks.length - completedTasks} open tasks pending`);
    nextActions.push('Complete all open tasks before submitting');
  }
  if (intel.found && intel.knownGotchas.length > 0) {
    warnings.push(`This route has ${intel.knownGotchas.length} known refusal triggers — review them`);
    nextActions.push('Read the Known Refusal Triggers in the Studio tab');
  }

  // Estimate days to ready
  let estimatedDays = 0;
  if (!hasIdentityDocs) estimatedDays += 1;
  if (!hasFinancialDocs) estimatedDays += 2;
  if (routeDocStatus === 'missing' && intel.found) {
    const maxDays = intel.requirements
      .filter((r: any) => r.isRequired && !r.canAIGenerate)
      .reduce((max: number, r: any) => Math.max(max, r.estimatedDays || 0), 0);
    estimatedDays += maxDays;
  }

  return {
    score: totalScore,
    label: scoreLabel(totalScore),
    color: scoreColor(totalScore),
    breakdown: [
      {
        name: 'Identity Documents',
        score: identityScore,
        maxScore: 20,
        status: identityStatus,
        detail: hasIdentityDocs ? 'Passport/ID present' : 'No passport or ID uploaded',
      },
      {
        name: 'Financial Proof',
        score: financialScore,
        maxScore: 20,
        status: financialStatus,
        detail: hasFinancialDocs ? 'Bank/financial documents present' : 'No financial documents uploaded',
      },
      {
        name: 'Route-Required Documents',
        score: routeDocScore,
        maxScore: 25,
        status: routeDocStatus,
        detail: routeDocDetail,
      },
      {
        name: 'Supporting Documents',
        score: supportScore,
        maxScore: 15,
        status: supportStatus,
        detail: hasSupportDocs ? 'SOP/cover letter present' : 'No supporting letters generated',
      },
      {
        name: 'Tasks Completed',
        score: taskScore,
        maxScore: 10,
        status: taskStatus,
        detail: tasks.length > 0 ? `${completedTasks}/${tasks.length} tasks done` : 'No tasks created',
      },
      {
        name: 'Checklist Progress',
        score: checklistScore,
        maxScore: 10,
        status: checklistStatus,
        detail: checklistDetail,
      },
    ],
    blockers,
    warnings,
    nextActions: nextActions.slice(0, 4),
    estimatedDaysToReady: estimatedDays,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ROUTE-AWARE REJECTION ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

export async function analyzeRejection(params: {
  applicantName: string;
  originCountry: string;
  targetCountry: string;
  visaType: string;
  rejectionDate?: string;
  rejectionReason?: string;
  rejectionLetter?: string;
  previousAttempts?: number;
  documentsSubmitted?: string[];
  concerns?: string;
}): Promise<RejectionAnalysis> {
  // Get route-specific intelligence
  const intel = await getVisaIntelligence(
    params.originCountry,
    params.targetCountry,
    params.visaType
  );
  const visaContext = buildVisaContext(intel);

  const docsList = (params.documentsSubmitted || []).map((d) => `• ${d}`).join('\n') || '• Not specified';

  const prompt = `You are a senior immigration lawyer who has reviewed thousands of visa refusal letters. You are analysing a specific refusal for a ${params.originCountry} national.

${visaContext}

REFUSAL DETAILS:
Applicant: ${params.applicantName}
Origin Country: ${params.originCountry}
Target Country: ${params.targetCountry}
Visa Type: ${params.visaType}
Refusal Date: ${params.rejectionDate || 'Not specified'}
Stated Refusal Reason: ${params.rejectionReason || 'Not provided'}
Previous Attempts: ${params.previousAttempts || 0}
Documents Submitted at Time of Refusal:
${docsList}

Refusal Letter Content:
${params.rejectionLetter || 'Not provided — work from stated reason'}

Applicant's Concerns: ${params.concerns || 'None specified'}

ANALYSIS INSTRUCTIONS:
1. Cross-reference the refusal against the VERIFIED RULES above — if a known gotcha from the DB matches the refusal reason, flag it as knownPatternMatch=true
2. Identify the real concerns (beyond what was written — officers often use standard phrases that mask the actual concern)
3. For a ${params.originCountry} applicant, apply known country-specific scrutiny factors
4. Be direct and honest — if the case is unlikely to succeed without major profile changes, say so
5. Provide a specific, time-ordered action plan

Return ONLY valid JSON:
{
  "severity": "low"|"medium"|"high"|"critical",
  "confidence": 0.0-1.0,
  "rootCauseSummary": "Direct 3-4 sentence summary addressing the applicant",
  "officerConcerns": ["real concern 1", "real concern 2"],
  "missingEvidence": ["specific missing item 1"],
  "riskFactors": ["risk factor specific to this applicant profile"],
  "recommendedFixes": ["specific, actionable fix 1"],
  "nextSteps": ["immediate action 1 — do this week", "action 2"],
  "timeline": [
    { "step": "Order police clearance", "dueBy": "This week" },
    { "step": "Strengthen bank statements", "dueBy": "4 weeks" }
  ],
  "reapplicationChecklist": [
    { "item": "Statement of Purpose addressing refusal reason", "status": "required", "details": "Specifically address the officer concern about X" }
  ],
  "knownPatternMatch": true|false,
  "routeSpecificWarnings": ["${params.originCountry}-specific warning 1"]
}

Return only JSON. No markdown.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const raw = response.choices[0]?.message?.content || '{}';
  const cleaned = raw.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
  return JSON.parse(cleaned) as RejectionAnalysis;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SILENT ELIGIBILITY SCORING
// ─────────────────────────────────────────────────────────────────────────────

export async function scoreSilentEligibility(params: {
  originCountry: string;
  destinationCountry: string;
  visaType: string;
  educationLevel?: string;
  workExperienceYears?: number;
  englishScore?: string;
  proofOfFunds?: string;
  previousRefusals?: number;
  age?: number;
  jobOffer?: boolean;
  sponsorAvailable?: boolean;
}): Promise<EligibilityScoreResult> {
  const intel = await getVisaIntelligence(
    params.originCountry,
    params.destinationCountry,
    params.visaType
  );

  // Base score
  let score = 50;
  const strengths: string[] = [];
  const concerns: string[] = [];
  const dealBreakers: string[] = [];

  if (intel.found) {
    // Financial check
    const ft = intel.financialThresholds as any;
    if (ft && params.proofOfFunds) {
      const fundsMap: Record<string, number> = {
        'yes_sufficient': 100,
        'yes_but_low': 60,
        'no': 0,
        'sponsor_available': 85,
      };
      const fundScore = fundsMap[params.proofOfFunds] ?? 50;
      if (fundScore >= 85) { score += 10; strengths.push(`Financial proof meets ${ft.currency} ${ft.amount?.toLocaleString()} threshold`); }
      else if (fundScore < 50) { score -= 20; concerns.push(`Insufficient funds — ${ft.currency} ${ft.amount?.toLocaleString()} required`); }
    }

    // Check for known gotchas
    if (intel.knownGotchas.length > 0 && (params.previousRefusals || 0) > 0) {
      score -= 15;
      concerns.push(`Previous refusal on this route — high scrutiny from UKVI/IRCC`);
    }
  }

  // Education
  const eduMap: Record<string, number> = {
    'phd': 20, 'masters': 15, 'bachelors': 10, 'diploma': 5, 'secondary': 0,
  };
  const eduBoost = eduMap[(params.educationLevel || '').toLowerCase()] ?? 5;
  score += eduBoost;
  if (eduBoost >= 10) strengths.push(`${params.educationLevel} degree strengthens eligibility`);

  // Work experience
  const exp = params.workExperienceYears || 0;
  if (exp >= 5) { score += 10; strengths.push(`${exp} years work experience`); }
  else if (exp >= 2) { score += 5; }
  else { concerns.push('Limited work experience for skilled visa routes'); }

  // Previous refusals — serious negative signal
  const refusals = params.previousRefusals || 0;
  if (refusals >= 2) { score -= 20; dealBreakers.push(`${refusals} previous refusals — significant risk factor`); }
  else if (refusals === 1) { score -= 10; concerns.push('1 previous refusal — must be addressed in reapplication'); }
  else { strengths.push('No previous visa refusals'); }

  // Job offer / sponsor
  if (params.jobOffer) { score += 15; strengths.push('Job offer from licensed employer'); }
  if (params.sponsorAvailable) { score += 10; strengths.push('Sponsor available'); }

  // Clamp
  score = Math.min(100, Math.max(0, score));

  // Verdict
  let verdict: EligibilityScoreResult['verdict'];
  let recommendedAction: EligibilityScoreResult['recommendedAction'];
  if (score >= 80) { verdict = 'strong'; recommendedAction = 'proceed'; }
  else if (score >= 65) { verdict = 'possible'; recommendedAction = 'proceed'; }
  else if (score >= 50) { verdict = 'borderline'; recommendedAction = 'improve_profile'; }
  else if (score >= 35) { verdict = 'difficult'; recommendedAction = 'consult_professional'; }
  else { verdict = 'unlikely'; recommendedAction = 'consider_alternative_route'; }

  return {
    score,
    verdict,
    strengths,
    concerns,
    dealBreakers,
    recommendedAction,
    routeFound: intel.found,
  };
}
