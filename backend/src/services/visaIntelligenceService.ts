/**
 * Visa Intelligence Service
 * Single source of truth for all route-specific immigration knowledge.
 * Queries the visa_requirements database (seeded + admin-maintained).
 * All AI tools query here FIRST before calling GPT.
 */

import prisma from '../config/prisma';

export interface VisaIntelligenceResult {
  found: boolean;
  routeKey: string | null;
  originCountry: string;
  destinationCountry: string;
  visaType: string;
  summary: string | null;
  requirements: any[];
  financialThresholds: any | null;
  processingTime: any | null;
  knownGotchas: string[];
  criticalPath: string[];
  lastVerifiedAt: Date | null;
  daysStale: number;
  isFresh: boolean; // <60 days = fresh
}

/**
 * Normalize country names and visa types for DB lookup.
 * Handles variations like "UK" → "United Kingdom", "Skilled Worker" → "skilled_worker"
 */
function normalizeCountry(input: string): string {
  const map: Record<string, string> = {
    'uk': 'United Kingdom',
    'gb': 'United Kingdom',
    'great britain': 'United Kingdom',
    'britain': 'United Kingdom',
    'usa': 'United States',
    'us': 'United States',
    'america': 'United States',
    'uae': 'UAE',
    'emirates': 'UAE',
    'sa': 'South Africa',
    'south africa': 'South Africa',
    'nigeria': 'Nigeria',
    'ng': 'Nigeria',
    'ghana': 'Ghana',
    'gh': 'Ghana',
    'kenya': 'Kenya',
    'ke': 'Kenya',
    'canada': 'Canada',
    'ca': 'Canada',
    'australia': 'Australia',
    'au': 'Australia',
    'schengen': 'Schengen',
    'new zealand': 'New Zealand',
    'nz': 'New Zealand',
    'zimbabwe': 'Zimbabwe',
    'zw': 'Zimbabwe',
    'ethiopia': 'Ethiopia',
    'et': 'Ethiopia',
    'cameroon': 'Cameroon',
    'cm': 'Cameroon',
    'tanzania': 'Tanzania',
    'tz': 'Tanzania',
    'uganda': 'Uganda',
    'ug': 'Uganda',
  };
  const lower = input.toLowerCase().trim();
  return map[lower] || input.trim();
}

function normalizeVisaType(input: string): string {
  const map: Record<string, string> = {
    'skilled worker': 'Skilled Worker Visa',
    'skilled worker visa': 'Skilled Worker Visa',
    'uk skilled worker': 'Skilled Worker Visa',
    'student': 'Student Visa',
    'student visa': 'Student Visa',
    'uk student': 'Student Visa',
    'study permit': 'Study Permit',
    'study': 'Study Permit',
    'express entry': 'Express Entry',
    'express entry pr': 'Express Entry',
    'tourist': 'Tourist Visa',
    'visitor': 'Standard Visitor Visa',
    'standard visitor': 'Standard Visitor Visa',
    'standard visitor visa': 'Standard Visitor Visa',
    'f1': 'F-1 Student Visa',
    'f-1': 'F-1 Student Visa',
    'f1 student': 'F-1 Student Visa',
    'skilled independent': 'Skilled Migration',
    'skilled migration': 'Skilled Migration',
    'employment': 'Employment Visa',
    'employment visa': 'Employment Visa',
    'skilled migrant': 'Skilled Migrant Visa',
  };
  const lower = input.toLowerCase().trim();
  return map[lower] || input.trim();
}

/**
 * Primary lookup: get verified visa intelligence for a specific route.
 * Tries multiple matching strategies for best coverage.
 */
export async function getVisaIntelligence(
  originCountry: string,
  destinationCountry: string,
  visaType: string
): Promise<VisaIntelligenceResult> {
  const origin = normalizeCountry(originCountry);
  const destination = normalizeCountry(destinationCountry);
  const visa = normalizeVisaType(visaType);

  let record = null;

  // Strategy 1: Exact match on all three
  record = await prisma.visaRequirement.findFirst({
    where: {
      originCountry: { equals: origin, mode: 'insensitive' },
      destinationCountry: { equals: destination, mode: 'insensitive' },
      visaType: { equals: visa, mode: 'insensitive' },
      isActive: true,
    },
  });

  // Strategy 2: Fuzzy on visaType (contains)
  if (!record) {
    record = await prisma.visaRequirement.findFirst({
      where: {
        originCountry: { equals: origin, mode: 'insensitive' },
        destinationCountry: { equals: destination, mode: 'insensitive' },
        visaType: { contains: visa.split(' ')[0], mode: 'insensitive' },
        isActive: true,
      },
    });
  }

  // Strategy 3: Partial match – destination + visaType only (best we can do)
  if (!record) {
    record = await prisma.visaRequirement.findFirst({
      where: {
        destinationCountry: { equals: destination, mode: 'insensitive' },
        visaType: { contains: visa.split(' ')[0], mode: 'insensitive' },
        isActive: true,
      },
    });
  }

  const notFound: VisaIntelligenceResult = {
    found: false,
    routeKey: null,
    originCountry: origin,
    destinationCountry: destination,
    visaType: visa,
    summary: null,
    requirements: [],
    financialThresholds: null,
    processingTime: null,
    knownGotchas: [],
    criticalPath: [],
    lastVerifiedAt: null,
    daysStale: 999,
    isFresh: false,
  };

  if (!record) return notFound;

  const daysStale = Math.floor(
    (Date.now() - new Date(record.lastVerifiedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    found: true,
    routeKey: record.routeKey,
    originCountry: record.originCountry,
    destinationCountry: record.destinationCountry,
    visaType: record.visaType,
    summary: record.summary,
    requirements: (record.requirements as any[]) || [],
    financialThresholds: record.financialThresholds,
    processingTime: record.processingTime,
    knownGotchas: (record.knownGotchas as string[]) || [],
    criticalPath: (record.criticalPath as string[]) || [],
    lastVerifiedAt: record.lastVerifiedAt,
    daysStale,
    isFresh: daysStale < 60,
  };
}

/**
 * Build a concise context string to inject into AI prompts.
 * Keeps token usage low while giving the model the key facts.
 */
export function buildVisaContext(intel: VisaIntelligenceResult): string {
  if (!intel.found) {
    return `No verified rules found in database for ${intel.originCountry} → ${intel.destinationCountry} ${intel.visaType}. Use your best knowledge but clearly state you are working from general knowledge, not verified current rules.`;
  }

  const ft = intel.financialThresholds as any;
  const pt = intel.processingTime as any;

  const parts = [
    `=== VERIFIED VISA INTELLIGENCE (DB-backed, verified ${intel.daysStale} days ago) ===`,
    `Route: ${intel.originCountry} → ${intel.destinationCountry} | ${intel.visaType}`,
    intel.summary ? `Summary: ${intel.summary}` : '',
    ft ? `Financial Threshold: ${ft.currency} ${ft.amount?.toLocaleString()} (${ft.description || ''})` : '',
    pt ? `Processing Time: ${pt.typicalDays || pt.minDays + '-' + pt.maxDays} days` : '',
    intel.requirements.length > 0
      ? `Required Documents (${intel.requirements.length}):\n` +
        intel.requirements
          .slice(0, 12)
          .map((r: any) => `  - ${r.name} [${r.urgencyLevel || 'required'}] ${r.estimatedDays ? `(~${r.estimatedDays} days to obtain)` : ''} ${r.notes ? `→ ${r.notes}` : ''}`)
          .join('\n')
      : '',
    intel.knownGotchas.length > 0
      ? `Known Refusal Triggers:\n` + intel.knownGotchas.map((g) => `  ⚠ ${g}`).join('\n')
      : '',
    intel.criticalPath.length > 0
      ? `Critical Path:\n` + intel.criticalPath.map((s, i) => `  ${i + 1}. ${s}`).join('\n')
      : '',
    intel.isFresh ? '' : `⚠ Note: This data is ${intel.daysStale} days old. Verify with official sources.`,
    '=== END VERIFIED INTELLIGENCE ===',
  ];

  return parts.filter(Boolean).join('\n');
}

/**
 * Get all active routes for a destination country.
 * Used by eligibility engine to find best-matching route.
 */
export async function getRoutesByDestination(destinationCountry: string): Promise<any[]> {
  const destination = normalizeCountry(destinationCountry);
  return prisma.visaRequirement.findMany({
    where: {
      destinationCountry: { equals: destination, mode: 'insensitive' },
      isActive: true,
    },
    select: {
      routeKey: true,
      visaType: true,
      displayName: true,
      summary: true,
      financialThresholds: true,
      processingTime: true,
      requirements: true,
      knownGotchas: true,
    },
  });
}

/**
 * Get financial threshold for a specific route.
 * Used by readiness score to check if client meets financial requirements.
 */
export async function getFinancialThreshold(
  originCountry: string,
  destinationCountry: string,
  visaType: string
): Promise<{ amount: number; currency: string; description: string } | null> {
  const intel = await getVisaIntelligence(originCountry, destinationCountry, visaType);
  if (!intel.found || !intel.financialThresholds) return null;
  const ft = intel.financialThresholds as any;
  return {
    amount: ft.amount || 0,
    currency: ft.currency || 'USD',
    description: ft.description || '',
  };
}
