/**
 * Risk Profile Service
 * ─────────────────────
 * Produces a structured, factor-level risk assessment from intake data.
 * This replaces the single-number eligibility score with an actionable
 * pre-diagnosis panel that professionals see before accepting a lead.
 *
 * Risk factors assessed:
 *   1. Home Ties           — derived from applicant profile signals in description
 *   2. Credential Evaluation — based on origin → destination corridor
 *   3. Financial Sufficiency — signals from description / urgency
 *   4. Rejection History     — signals from description keywords
 *   5. Travel History        — signals from description keywords
 *   6. Visa Type Risk        — route-level refusal rate proxy
 */

import { getCorridorEvaluationBody } from '../data/credentialData';

export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';

export interface RiskFactor {
  key: string;           // machine-readable key
  label: string;         // display label
  riskLevel: RiskLevel;
  detail: string;        // one-line explanation shown to the professional
  toolLink?: string;     // dashboard route to the relevant tool
  toolLabel?: string;    // CTA label for the tool
  checklistHints?: string[]; // document checklist items to auto-add
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

/**
 * Detect simple signals from free-text description.
 * Returns a record of boolean flags.
 */
function detectSignals(description: string): Record<string, boolean> {
  const text = description.toLowerCase();
  return {
    hasRejection: /\b(refus|reject|denied|denial|refused|rejection)\b/.test(text),
    hasEmployment: /\b(employ|work|job|salary|company|employer|contract)\b/.test(text),
    hasProperty: /\b(house|property|mortgage|bond|rent|own)\b/.test(text),
    hasFamily: /\b(wife|husband|spouse|child|children|parent|family|married)\b/.test(text),
    hasStudy: /\b(stud|university|degree|qualification|school|college)\b/.test(text),
    hasTravel: /\b(travel|visa|passport|schengen|previously|visited)\b/.test(text),
    hasFinancials: /\b(fund|bank|statement|savings|afford|sponsor)\b/.test(text),
    hasPreviousVisa: /\b(previous|prior|before|last time|already|granted|approved)\b/.test(text),
    hasEUFreeMovement: /\b(eu citizen|dutch|german|french|spanish|italian|portuguese|eu spouse|free movement|article 21|family member of eu)\b/.test(text),
    hasQualification: /\b(degree|qualification|diploma|certificate|bachelor|master|phd|postgrad|naric|enic|saqa|wes|anabin)\b/.test(text),
    hasHomeTiesWeakness: /\b(unemployed|no job|no property|no family|no ties|no savings|minimal|struggle|broke|debt)\b/.test(text),
  };
}

/**
 * Map urgency level to a travel timeline signal.
 */
function urgencyToTimeline(urgencyLevel: string): 'immediate' | 'soon' | 'planned' {
  switch (urgencyLevel) {
    case 'emergency': return 'immediate';
    case 'urgent': return 'immediate';
    case 'soon': return 'soon';
    default: return 'planned';
  }
}

/**
 * Build a risk profile from intake fields.
 */
export function buildRiskProfile(params: {
  applicantCountry: string;
  destinationCountry: string;
  serviceType: string;      // caseType from ServiceCatalog
  urgencyLevel: string;
  description: string;
}): RiskProfile {
  const { applicantCountry, destinationCountry, serviceType, urgencyLevel, description } = params;
  const signals = detectSignals(description);
  const timeline = urgencyToTimeline(urgencyLevel);
  const factors: RiskFactor[] = [];

  // ── 1. Home Ties ────────────────────────────────────────────────────────────
  {
    let riskLevel: RiskLevel;
    let detail: string;
    const checklistHints: string[] = [];

    const isShortStay = ['tourist', 'visitor', 'business', 'schengen'].some(t =>
      serviceType.toLowerCase().includes(t) || destinationCountry.toLowerCase().includes('schengen')
    );

    if (signals.hasHomeTiesWeakness) {
      riskLevel = 'high';
      detail = 'Description contains signals of weak home ties (unemployment, no property, no family). Embassies scrutinise these cases.';
      checklistHints.push(
        'Employment letter on company letterhead confirming ongoing employment',
        '3–6 months bank statements showing regular salary income',
        'Proof of property ownership or long-term lease agreement',
        'Evidence of family members remaining in home country',
      );
    } else if (isShortStay && !signals.hasEmployment && !signals.hasProperty) {
      riskLevel = 'medium';
      detail = 'Short-stay visa. No strong employment or property signals detected — home ties documentation may be thin.';
      checklistHints.push(
        'Employment letter confirming leave approval and return-to-work date',
        '3 months bank statements',
        'Return travel ticket',
      );
    } else if (signals.hasEmployment || signals.hasProperty || signals.hasFamily) {
      riskLevel = 'low';
      detail = 'Employment, property or family tie signals detected. Standard documentation required.';
    } else {
      riskLevel = 'unknown';
      detail = 'Insufficient information to assess home ties. Run the Home Ties tool after collecting client details.';
      checklistHints.push('Run Home Ties Score tool to assess and generate document list');
    }

    factors.push({
      key: 'home_ties',
      label: 'Home Ties',
      riskLevel,
      detail,
      toolLink: '/dashboard/immigration/tools/home-ties',
      toolLabel: 'Run Home Ties Score',
      checklistHints,
    });
  }

  // ── 2. Credential Evaluation ───────────────────────────────────────────────
  {
    const needsCredentialEval =
      signals.hasQualification ||
      signals.hasStudy ||
      ['work_permit', 'skilled_worker', 'critical_skills', 'blue_card', 'express_entry',
       'study_permit', 'student'].some(t => serviceType.toLowerCase().includes(t));

    const evalBody = getCorridorEvaluationBody(applicantCountry, destinationCountry);

    let riskLevel: RiskLevel;
    let detail: string;
    const checklistHints: string[] = [];

    if (needsCredentialEval && evalBody) {
      riskLevel = evalBody.mandatory ? 'high' : 'medium';
      detail = `Qualification evaluation likely needed via ${evalBody.body}. ${evalBody.note || ''}`;
      checklistHints.push(
        `${evalBody.body} evaluation certificate`,
        'Official academic transcripts (certified translations if not in English)',
        'Original degree certificates',
      );
      if (applicantCountry.toLowerCase().includes('nigeria')) {
        checklistHints.push('NYSC discharge/exemption certificate (attested)');
      }
    } else if (needsCredentialEval) {
      riskLevel = 'medium';
      detail = 'Qualification evaluation may be needed. Check destination country requirements.';
      checklistHints.push('Certified copies of academic qualifications', 'Official transcripts');
    } else {
      riskLevel = 'low';
      detail = 'No qualification evaluation signals detected for this service type.';
    }

    factors.push({
      key: 'credential_evaluation',
      label: 'Credential Evaluation',
      riskLevel,
      detail,
      toolLink: '/dashboard/immigration/tools/credential-evaluation',
      toolLabel: 'Check Credential Evaluation',
      checklistHints,
    });
  }

  // ── 3. Rejection History ───────────────────────────────────────────────────
  {
    let riskLevel: RiskLevel;
    let detail: string;
    const checklistHints: string[] = [];

    if (signals.hasRejection) {
      riskLevel = 'high';
      detail = 'Previous refusal mentioned. Run Rejection Analysis to identify root cause and build a stronger application.';
      checklistHints.push(
        'Copy of previous refusal letter(s)',
        'Rejection Analysis report (run tool)',
        'Cover letter addressing each refusal reason',
      );
    } else {
      riskLevel = 'low';
      detail = 'No prior refusal signals detected.';
    }

    factors.push({
      key: 'rejection_history',
      label: 'Rejection History',
      riskLevel,
      detail,
      toolLink: '/dashboard/immigration/tools/rejection-analysis',
      toolLabel: 'Run Rejection Analysis',
      checklistHints,
    });
  }

  // ── 4. Financial Sufficiency ───────────────────────────────────────────────
  {
    let riskLevel: RiskLevel;
    let detail: string;
    const checklistHints: string[] = [];

    if (timeline === 'immediate' && !signals.hasFinancials) {
      riskLevel = 'medium';
      detail = 'Urgent/emergency case with no financial signals. Financial documentation may need to be expedited.';
      checklistHints.push('Bank statements (last 3 months minimum)', 'Proof of funds letter from bank');
    } else if (signals.hasFinancials) {
      riskLevel = 'low';
      detail = 'Financial references detected in description. Standard bank statement requirement applies.';
      checklistHints.push('Bank statements (last 3–6 months)');
    } else {
      riskLevel = 'unknown';
      detail = 'Financial details not confirmed. Collect bank statements and confirm funding source.';
      checklistHints.push('3–6 months bank statements', 'Confirmation of funding source');
    }

    factors.push({
      key: 'financial_sufficiency',
      label: 'Financial Sufficiency',
      riskLevel,
      detail,
      checklistHints,
    });
  }

  // ── 5. Travel History ──────────────────────────────────────────────────────
  {
    let riskLevel: RiskLevel;
    let detail: string;
    const checklistHints: string[] = [];

    if (signals.hasPreviousVisa) {
      riskLevel = 'low';
      detail = 'Prior visa/travel history mentioned — positive signal for embassies.';
      checklistHints.push('Copy of previous visa grants (passport pages)');
    } else if (!signals.hasTravel) {
      riskLevel = 'medium';
      detail = 'No prior travel history signals. First-time applicants face higher scrutiny — include detailed itinerary and proof of purpose.';
      checklistHints.push(
        'Detailed trip itinerary',
        'Confirmed return ticket',
        'Hotel/accommodation booking',
        'Invitation letter (if applicable)',
      );
    } else {
      riskLevel = 'low';
      detail = 'Travel references detected.';
    }

    factors.push({
      key: 'travel_history',
      label: 'Travel History',
      riskLevel,
      detail,
      checklistHints,
    });
  }

  // ── 6. EU Free Movement Flag ───────────────────────────────────────────────
  if (signals.hasEUFreeMovement) {
    factors.push({
      key: 'eu_free_movement',
      label: 'EU Free Movement Route',
      riskLevel: 'medium',
      detail: 'EU free movement signals detected (non-EU spouse/family member of EU citizen). This is a different legal route from standard immigration — governed by Directive 2004/38/EC, not national immigration law. Different documentary requirements apply.',
      checklistHints: [
        "EU citizen sponsor's passport or ID card",
        'Proof of EU citizen exercising free movement rights (residence in host country)',
        'Marriage certificate (certified translation if required)',
        'Evidence of genuine relationship (photos, communication, joint documents)',
        'EEA Family Permit application form (for UK, use form EEA(FM))',
      ],
    });
  }

  // ── Calculate overall risk ─────────────────────────────────────────────────
  const highCount = factors.filter(f => f.riskLevel === 'high').length;
  const mediumCount = factors.filter(f => f.riskLevel === 'medium').length;
  const lowCount = factors.filter(f => f.riskLevel === 'low').length;

  let overallRisk: RiskLevel;
  if (highCount >= 2) overallRisk = 'high';
  else if (highCount === 1 || mediumCount >= 2) overallRisk = 'medium';
  else overallRisk = 'low';

  const credentialEvalBody = getCorridorEvaluationBody(applicantCountry, destinationCountry);

  return {
    factors,
    overallRisk,
    highCount,
    mediumCount,
    lowCount,
    credentialEvalBody,
    scoredAt: new Date().toISOString(),
  };
}
