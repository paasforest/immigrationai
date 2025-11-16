import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { openaiService } from './openaiService';

export type EligibilityVerdict = 'likely' | 'needs_more_info' | 'unlikely';

export interface EligibilityInput {
  userId?: string;
  email?: string;
  country: string;
  visaType: string;
  ageRange?: string;
  relationshipStatus?: string;
  educationLevel?: string;
  workExperienceYears?: string;
  englishExam?: string;
  proofOfFunds?: string;
  homeTies?: string;
  previousRefusals?: string;
  travelHistory?: string;
  sponsorIncome?: string;
  notes?: string;
  supplementalAnswers?: Record<string, string>;
  tracking?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    referrer?: string;
    landingPage?: string;
    sessionId?: string;
  };
  ipAddress?: string;
}

export interface EligibilityResult {
  verdict: EligibilityVerdict;
  summary: string;
  confidence: number;
  riskFactors: string[];
  recommendedSteps: string[];
  recommendedDocuments: string[];
  countryLabel: string;
  visaTypeLabel: string;
}

type TrackingMeta = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_page?: string;
  session_id?: string;
};

const COUNTRY_LABELS: Record<string, string> = {
  uk: 'United Kingdom',
  usa: 'United States',
  canada: 'Canada',
  germany: 'Germany',
  ireland: 'Ireland',
  france: 'France',
  netherlands: 'Netherlands',
  uae: 'United Arab Emirates (UAE)',
  eu_schengen: 'Schengen Area',
};

const VISA_EXAMPLES: Record<string, string> = {
  uk_skilled_worker: 'UK Skilled Worker Visa',
  uk_student: 'UK Student (Tier 4/Graduate Route) Visa',
  uk_partner: 'UK Partner/Spouse Visa',
  uk_family_reunion: 'UK Family Reunion / Dependant Visa',
  uk_business_visit: 'UK Business / Standard Visitor Visa',
  uk_startup_innovator: 'UK Start-up / Innovator / Global Talent Visa',
  uk_visit: 'UK Standard Visitor Visa',
  uk_other: 'UK Visa (Other / Not Listed)',
  usa_b1b2: 'USA B1/B2 Visitor Visa',
  usa_f1: 'USA F-1 Student Visa',
  usa_h1b: 'USA H-1B Specialty Occupation Visa',
  usa_k1: 'USA K1 Fiancé(e) Visa',
  usa_family_reunification: 'USA Family-Sponsored Green Card',
  usa_employment_based: 'USA Employment-Based Immigrant Visa (EB Series)',
  usa_other: 'USA Visa (Other / Not Listed)',
  canada_study: 'Canada Study Permit',
  canada_express_entry: 'Canada Express Entry (FSW)',
  canada_work_permit: 'Canada Employer-Specific Work Permit',
  canada_spousal_sponsorship: 'Canada Spousal/Common-law Sponsorship',
  canada_visitor: 'Canada Visitor Visa (TRV)',
  canada_other: 'Canada Visa (Other / Not Listed)',
  germany_job_seeker: 'Germany Job Seeker Visa',
  germany_blue_card: 'Germany EU Blue Card',
  germany_student: 'Germany Student Visa',
  germany_family_reunion: 'Germany Family Reunion Visa',
  germany_business_visit: 'Germany Business / Schengen C Visa',
  germany_other: 'Germany Visa (Other / Not Listed)',
  ireland_critical_skills: 'Ireland Critical Skills Employment Permit',
  ireland_general_employment: 'Ireland General Employment Permit',
  ireland_student: 'Ireland Third Level Graduate/Student Visa',
  ireland_spouse_family: 'Ireland Spouse/Partner/Family Reunification Visa',
  ireland_business: 'Ireland Business / Start-up / Investor Visa',
  ireland_visit: 'Ireland Short Stay (C) Visa',
  ireland_other: 'Ireland Visa (Other / Not Listed)',
  schengen_short_stay: 'Schengen Short-Stay Visa (C)',
  schengen_business: 'Schengen Business Visa (C)',
  schengen_family: 'Schengen Family Reunification (D)',
  schengen_student: 'Schengen Student / Research Visa',
  schengen_other: 'Schengen Visa (Other / Not Listed)',
  uae_employment: 'UAE Employment Residence Visa',
  uae_family: 'UAE Family / Dependant Residence Visa',
  uae_investor: 'UAE Investor / Golden Visa',
  uae_visit: 'UAE Visit / Tourist Visa',
  uae_other: 'UAE Visa (Other / Not Listed)',
};

function formatLabel(value: string, dictionary: Record<string, string>): string {
  return dictionary[value] || value
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function sanitizeText(value?: string, maxLength: number = 1000): string | undefined {
  if (!value) return undefined;
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
}

class EligibilityService {
  private buildPrompt(input: EligibilityInput): string {
    const countryLabel = formatLabel(input.country, COUNTRY_LABELS);
    const visaTypeLabel = formatLabel(input.visaType, VISA_EXAMPLES);

    const focusAreas = [
      'financial sufficiency and proof of funds',
      'relationship evidence and genuineness (if applicable)',
      'employment history & skill match',
      'previous immigration history or refusals',
      'ties to home country to mitigate overstay risk',
      'language proficiency and education comparability',
    ];

    const applicantProfile = {
      country: countryLabel,
      visaType: visaTypeLabel,
      ageRange: input.ageRange || 'not provided',
      relationshipStatus: input.relationshipStatus || 'not provided',
      educationLevel: input.educationLevel || 'not provided',
      workExperienceYears: input.workExperienceYears || 'not provided',
      englishExam: input.englishExam || 'not provided',
      proofOfFunds: input.proofOfFunds || 'not provided',
      homeTies: input.homeTies || 'not provided',
      previousRefusals: input.previousRefusals || 'not provided',
      travelHistory: input.travelHistory || 'not provided',
      sponsorIncome: input.sponsorIncome || 'not provided',
      notes: sanitizeText(input.notes, 600) || 'n/a',
    };

    const supplementalSection = input.supplementalAnswers && Object.keys(input.supplementalAnswers).length > 0
      ? `\nRoute-specific notes:\n${JSON.stringify(input.supplementalAnswers, null, 2)}`
      : '';

    return `
You are ImmigrationAI's senior immigration strategist. Speak directly to the applicant as "you" and reference ImmigrationAI's guidance.
Assume you are reviewing this case inside ImmigrationAI's platform for ${countryLabel}.
Assess the following profile for the ${visaTypeLabel}.

Focus on: ${focusAreas.join(', ')}.

Return ONLY valid JSON with this schema:
{
  "verdict": "likely" | "needs_more_info" | "unlikely",
  "confidence": 0.0-1.0,
  "summary": "Professional tone overview referencing real policy, addressing the applicant as 'you'",
  "risk_factors": ["bullet list of professional risk notes written to 'you'"],
  "recommended_steps": ["clear, actionable steps ImmigrationAI suggests you take next"],
  "recommended_documents": ["documents you should prepare next"]
}

Applicant Profile:
${JSON.stringify(applicantProfile, null, 2)}
${supplementalSection}
`;
  }

  private parseResponse(content: string): EligibilityResult {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;

    try {
      const parsed = JSON.parse(jsonString);

      if (!parsed.verdict || !parsed.summary) {
        throw new Error('Missing required fields');
      }

      return {
        verdict: (parsed.verdict as EligibilityVerdict) || 'needs_more_info',
        summary: parsed.summary,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.55,
        riskFactors: Array.isArray(parsed.risk_factors) ? parsed.risk_factors : [],
        recommendedSteps: Array.isArray(parsed.recommended_steps) ? parsed.recommended_steps : [],
        recommendedDocuments: Array.isArray(parsed.recommended_documents) ? parsed.recommended_documents : [],
        countryLabel: '',
        visaTypeLabel: '',
      };
    } catch (error) {
      console.warn('Failed to parse eligibility response, returning fallback.', error);
      return {
        verdict: 'needs_more_info',
        summary: 'We need a consultant to review this profile manually before advising.',
        confidence: 0.4,
        riskFactors: ['Automated analysis could not parse the details provided.'],
        recommendedSteps: [
          'Upload supporting documents for manual review.',
          'Schedule a consultation with an immigration advisor.',
        ],
        recommendedDocuments: [
          'Passport copy',
          'Proof of funds',
          'Travel history',
        ],
        countryLabel: '',
        visaTypeLabel: '',
      };
    }
  }

  private normalizeTracking(tracking?: EligibilityInput['tracking']): TrackingMeta {
    if (!tracking) return {};
    return {
      utm_source: tracking.utm_source,
      utm_medium: tracking.utm_medium,
      utm_campaign: tracking.utm_campaign,
      utm_content: tracking.utm_content,
      utm_term: tracking.utm_term,
      referrer: tracking.referrer,
      landing_page: tracking.landingPage,
      session_id: tracking.sessionId,
    };
  }

  async assessEligibility(input: EligibilityInput): Promise<EligibilityResult> {
    if (!input.country || !input.visaType) {
      throw new AppError('Country and visa type are required', 400);
    }

    const prompt = this.buildPrompt(input);
    const { content } = await openaiService.callOpenAI(
      prompt,
      900,
      0.3,
      undefined,
      input.userId,
      'eligibility_check'
    );

    const parsed = this.parseResponse(content);
    const countryLabel = formatLabel(input.country, COUNTRY_LABELS);
    const visaTypeLabel = formatLabel(input.visaType, VISA_EXAMPLES);
    parsed.countryLabel = countryLabel;
    parsed.visaTypeLabel = visaTypeLabel;

    const trackingMeta = this.normalizeTracking(input.tracking);

    await query(
      `INSERT INTO eligibility_checks (
        user_id, email, country, visa_type, answers, verdict, confidence, summary, risk_notes,
        recommended_documents, recommended_steps, should_follow_up,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        session_id, referrer, landing_page, ip_address
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, $21
      )`,
      [
        input.userId || null,
        input.email || null,
        countryLabel,
        visaTypeLabel,
        JSON.stringify(input),
        parsed.verdict,
        parsed.confidence,
        parsed.summary,
        parsed.riskFactors.join('\n'),
        JSON.stringify(parsed.recommendedDocuments || []),
        JSON.stringify(parsed.recommendedSteps || []),
        parsed.verdict !== 'unlikely',
        trackingMeta.utm_source || null,
        trackingMeta.utm_medium || null,
        trackingMeta.utm_campaign || null,
        trackingMeta.utm_content || null,
        trackingMeta.utm_term || null,
        trackingMeta.session_id || null,
        trackingMeta.referrer || null,
        trackingMeta.landing_page || null,
        input.ipAddress || null,
      ]
    );

    return parsed;
  }

  async getEligibilityAnalytics() {
    const totalsResult = await query(
      `SELECT 
         COUNT(*) AS total_checks,
         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') AS last_24h,
         AVG(confidence) AS avg_confidence
       FROM eligibility_checks`
    );

    const topCountries = await query(
      `SELECT country, COUNT(*) AS checks
       FROM eligibility_checks
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY country
       ORDER BY checks DESC
       LIMIT 5`
    );

    const topVisaTypes = await query(
      `SELECT visa_type, COUNT(*) AS checks
       FROM eligibility_checks
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY visa_type
       ORDER BY checks DESC
       LIMIT 5`
    );

    const recentChecks = await query(
      `SELECT 
         country, visa_type, verdict, confidence, created_at, summary
       FROM eligibility_checks
       ORDER BY created_at DESC
       LIMIT 8`
    );

    return {
      totals: {
        totalChecks: parseInt(totalsResult.rows[0]?.total_checks || '0', 10),
        last24h: parseInt(totalsResult.rows[0]?.last_24h || '0', 10),
        avgConfidence: parseFloat(totalsResult.rows[0]?.avg_confidence || '0'),
      },
      topCountries: topCountries.rows.map((row) => ({
        country: row.country,
        checks: Number(row.checks),
      })),
      topVisaTypes: topVisaTypes.rows.map((row) => ({
        visaType: row.visa_type,
        checks: Number(row.checks),
      })),
      recent: recentChecks.rows.map((row) => ({
        country: row.country,
        visaType: row.visa_type,
        verdict: row.verdict,
        confidence: Number(row.confidence || 0),
        summary: row.summary,
        createdAt: row.created_at,
      })),
    };
  }
}

export const eligibilityService = new EligibilityService();

