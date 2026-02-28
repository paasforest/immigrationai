/**
 * Home Ties Strength Scorer
 * --------------------------
 * Scores an applicant's ties to their home country to predict refusal risk.
 * Used for tourist, visitor, student and short-stay visa applications.
 *
 * Scoring model based on real embassy assessment criteria:
 * UK: Appendix V / genuine visitor rule
 * Schengen: Article 14 & 21 of the Schengen Borders Code
 * US: INA Section 214(b) non-immigrant intent
 */

export interface HomeTiesInput {
  // Employment
  employmentStatus: 'employed_full_time' | 'employed_part_time' | 'self_employed' | 'student' | 'unemployed' | 'retired';
  employmentDuration: 'over_3_years' | '1_to_3_years' | 'under_1_year' | 'new_job' | 'not_applicable';
  monthlyIncome: 'over_3x_trip_cost' | '2x_to_3x' | '1x_to_2x' | 'under_1x' | 'unknown';

  // Property & residence
  propertyOwnership: 'owns_property' | 'long_term_renting' | 'family_home' | 'no_fixed_address';

  // Family ties
  familyInHomeCountry: 'spouse_children_left_behind' | 'parents_siblings' | 'extended_family_only' | 'none';

  // Financial ties
  financialCommitments: 'mortgage_or_bond' | 'vehicle_loan_or_business' | 'small_obligations' | 'none';

  // Bank account profile
  bankAccountProfile: 'regular_salary_6_months' | 'some_savings' | 'lump_sum_recently' | 'minimal';

  // Travel history
  priorTravelHistory: 'multiple_prior_visas' | 'one_or_two_prior' | 'none_but_clean_record' | 'no_history';

  // Destination & visa type
  visaType: 'tourist' | 'visitor' | 'business' | 'student' | 'other';
  destinationCountry: string;
}

export interface HomeTiesResult {
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

const MAX_SCORE = 24;

// ─── Visa-Type Weight Profiles ────────────────────────────────────────────────
// Each key maps to weights (0–1) applied per factor.
// Total weights across all 8 factors should sum to 1.0.
// Factors: employment_status, employment_duration, financial_means,
//          property, family, financial_commitments, bank_profile, travel_history
export type VisaWeightProfile = {
  employment_status: number;
  employment_duration: number;
  financial_means: number;
  property: number;
  family: number;
  financial_commitments: number;
  bank_profile: number;
  travel_history: number;
};

export const VISA_TYPE_WEIGHTS: Record<string, VisaWeightProfile> = {
  // Schengen short-stay tourist / business — embassies heavily weight employment & finances
  tourist: {
    employment_status:    0.18,
    employment_duration:  0.15,
    financial_means:      0.18,
    property:             0.10,
    family:               0.10,
    financial_commitments:0.09,
    bank_profile:         0.12,
    travel_history:       0.08,
  },
  // Standard visitor (UK Appendix V) — employment letter + return motive critical
  visitor: {
    employment_status:    0.20,
    employment_duration:  0.16,
    financial_means:      0.14,
    property:             0.10,
    family:               0.12,
    financial_commitments:0.08,
    bank_profile:         0.12,
    travel_history:       0.08,
  },
  // Business short-stay — financial means + employment are key
  business: {
    employment_status:    0.18,
    employment_duration:  0.12,
    financial_means:      0.20,
    property:             0.08,
    family:               0.10,
    financial_commitments:0.10,
    bank_profile:         0.14,
    travel_history:       0.08,
  },
  // Student visa — financial means & family ties matter, employment less so
  student: {
    employment_status:    0.08,
    employment_duration:  0.06,
    financial_means:      0.22,
    property:             0.10,
    family:               0.18,
    financial_commitments:0.08,
    bank_profile:         0.16,
    travel_history:       0.12,
  },
  // UK Family visa — family ties are the dominant factor
  family: {
    employment_status:    0.10,
    employment_duration:  0.08,
    financial_means:      0.12,
    property:             0.10,
    family:               0.30,
    financial_commitments:0.08,
    bank_profile:         0.12,
    travel_history:       0.10,
  },
  // US B1/B2 — strong non-immigrant intent required, all factors weighted, travel history important
  us_b1b2: {
    employment_status:    0.18,
    employment_duration:  0.14,
    financial_means:      0.14,
    property:             0.12,
    family:               0.12,
    financial_commitments:0.10,
    bank_profile:         0.10,
    travel_history:       0.10,
  },
  // Canada TRV / visitor — similar to UK visitor but travel history more important
  canada_visitor: {
    employment_status:    0.18,
    employment_duration:  0.12,
    financial_means:      0.16,
    property:             0.10,
    family:               0.12,
    financial_commitments:0.08,
    bank_profile:         0.12,
    travel_history:       0.12,
  },
  // Generic fallback — equal weighting
  other: {
    employment_status:    0.125,
    employment_duration:  0.125,
    financial_means:      0.125,
    property:             0.125,
    family:               0.125,
    financial_commitments:0.125,
    bank_profile:         0.125,
    travel_history:       0.125,
  },
};

/**
 * Resolve which weight profile applies for a given visa type string.
 * The input visa type can be a free-form string from the intake form.
 */
export function resolveWeightProfile(visaType: string): VisaWeightProfile {
  const v = visaType.toLowerCase();
  if (v.includes('tourist') || v.includes('schengen')) return VISA_TYPE_WEIGHTS.tourist;
  if (v.includes('visitor') || v.includes('visit')) return VISA_TYPE_WEIGHTS.visitor;
  if (v.includes('business')) return VISA_TYPE_WEIGHTS.business;
  if (v.includes('student') || v.includes('study')) return VISA_TYPE_WEIGHTS.student;
  if (v.includes('family') || v.includes('spouse') || v.includes('partner')) return VISA_TYPE_WEIGHTS.family;
  if (v.includes('b1') || v.includes('b2') || v.includes('b-1') || v.includes('b-2')) return VISA_TYPE_WEIGHTS.us_b1b2;
  if (v.includes('canada') && (v.includes('visitor') || v.includes('trv'))) return VISA_TYPE_WEIGHTS.canada_visitor;
  return VISA_TYPE_WEIGHTS.other;
}

export function scoreHomeTies(input: HomeTiesInput): HomeTiesResult {
  const breakdown: { category: string; score: number; max: number; label: string }[] = [];

  // Resolve weight profile for this visa type
  const weights = resolveWeightProfile(input.visaType);

  // ── 1. Employment Status (max 3) ──────────────────────────────────────────
  let empScore = 0;
  let empLabel = '';
  switch (input.employmentStatus) {
    case 'employed_full_time':  empScore = 3; empLabel = 'Employed full-time'; break;
    case 'self_employed':       empScore = 3; empLabel = 'Self-employed / business owner'; break;
    case 'employed_part_time':  empScore = 2; empLabel = 'Employed part-time'; break;
    case 'retired':             empScore = 2; empLabel = 'Retired (pension income)'; break;
    case 'student':             empScore = 1; empLabel = 'Student'; break;
    case 'unemployed':          empScore = 0; empLabel = 'Currently unemployed'; break;
  }
  breakdown.push({ category: 'Employment Status', score: empScore, max: 3, label: empLabel });

  // ── 2. Employment Duration (max 3) ────────────────────────────────────────
  let durScore = 0;
  let durLabel = '';
  switch (input.employmentDuration) {
    case 'over_3_years':    durScore = 3; durLabel = '3+ years in current role'; break;
    case '1_to_3_years':    durScore = 2; durLabel = '1–3 years in current role'; break;
    case 'under_1_year':    durScore = 1; durLabel = 'Less than 1 year in role'; break;
    case 'new_job':         durScore = 0; durLabel = 'New job / recent change'; break;
    case 'not_applicable':  durScore = 1; durLabel = 'Not applicable'; break;
  }
  breakdown.push({ category: 'Employment Duration', score: durScore, max: 3, label: durLabel });

  // ── 3. Financial Means (max 3) ────────────────────────────────────────────
  let incScore = 0;
  let incLabel = '';
  switch (input.monthlyIncome) {
    case 'over_3x_trip_cost': incScore = 3; incLabel = 'Income well exceeds trip cost (3x+)'; break;
    case '2x_to_3x':          incScore = 2; incLabel = 'Income comfortably covers trip (2–3x)'; break;
    case '1x_to_2x':          incScore = 1; incLabel = 'Income barely covers trip cost'; break;
    case 'under_1x':          incScore = 0; incLabel = 'Income insufficient for trip'; break;
    case 'unknown':           incScore = 1; incLabel = 'Financial means not confirmed'; break;
  }
  breakdown.push({ category: 'Financial Means', score: incScore, max: 3, label: incLabel });

  // ── 4. Property & Residence (max 3) ───────────────────────────────────────
  let propScore = 0;
  let propLabel = '';
  switch (input.propertyOwnership) {
    case 'owns_property':       propScore = 3; propLabel = 'Owns property in home country'; break;
    case 'family_home':         propScore = 2; propLabel = 'Living in family-owned home'; break;
    case 'long_term_renting':   propScore = 1; propLabel = 'Long-term rental (stable address)'; break;
    case 'no_fixed_address':    propScore = 0; propLabel = 'No fixed address'; break;
  }
  breakdown.push({ category: 'Property / Residence', score: propScore, max: 3, label: propLabel });

  // ── 5. Family Ties (max 3) ────────────────────────────────────────────────
  let famScore = 0;
  let famLabel = '';
  switch (input.familyInHomeCountry) {
    case 'spouse_children_left_behind': famScore = 3; famLabel = 'Spouse/children remaining at home'; break;
    case 'parents_siblings':            famScore = 2; famLabel = 'Parents/siblings in home country'; break;
    case 'extended_family_only':        famScore = 1; famLabel = 'Extended family only'; break;
    case 'none':                        famScore = 0; famLabel = 'No family ties in home country'; break;
  }
  breakdown.push({ category: 'Family Ties', score: famScore, max: 3, label: famLabel });

  // ── 6. Financial Commitments / Obligations (max 3) ────────────────────────
  let finScore = 0;
  let finLabel = '';
  switch (input.financialCommitments) {
    case 'mortgage_or_bond':         finScore = 3; finLabel = 'Mortgage / property bond / business loan'; break;
    case 'vehicle_loan_or_business': finScore = 2; finLabel = 'Vehicle finance or active business'; break;
    case 'small_obligations':        finScore = 1; finLabel = 'Small financial obligations'; break;
    case 'none':                     finScore = 0; finLabel = 'No ongoing financial commitments'; break;
  }
  breakdown.push({ category: 'Financial Commitments', score: finScore, max: 3, label: finLabel });

  // ── 7. Bank Account Profile (max 3) ───────────────────────────────────────
  let bankScore = 0;
  let bankLabel = '';
  switch (input.bankAccountProfile) {
    case 'regular_salary_6_months': bankScore = 3; bankLabel = 'Regular salary deposits (6+ months)'; break;
    case 'some_savings':            bankScore = 2; bankLabel = 'Some consistent savings'; break;
    case 'lump_sum_recently':       bankScore = 0; bankLabel = 'Lump sum recently deposited (red flag)'; break;
    case 'minimal':                 bankScore = 0; bankLabel = 'Minimal or inconsistent balance'; break;
  }
  breakdown.push({ category: 'Bank Account Profile', score: bankScore, max: 3, label: bankLabel });

  // ── 8. Prior Travel History (max 3) ───────────────────────────────────────
  let travelScore = 0;
  let travelLabel = '';
  switch (input.priorTravelHistory) {
    case 'multiple_prior_visas':    travelScore = 3; travelLabel = 'Multiple prior visas / travel stamps'; break;
    case 'one_or_two_prior':        travelScore = 2; travelLabel = '1–2 prior visa grants'; break;
    case 'none_but_clean_record':   travelScore = 1; travelLabel = 'No prior travel, clean record'; break;
    case 'no_history':              travelScore = 0; travelLabel = 'No travel history'; break;
  }
  breakdown.push({ category: 'Prior Travel History', score: travelScore, max: 3, label: travelLabel });

  // ── Calculate totals with visa-type weighting ─────────────────────────────
  // Each factor's raw score (0-3) is normalised to 0-1, then weighted.
  const factorWeights = [
    weights.employment_status,
    weights.employment_duration,
    weights.financial_means,
    weights.property,
    weights.family,
    weights.financial_commitments,
    weights.bank_profile,
    weights.travel_history,
  ];

  const weightedScore = breakdown.reduce((sum, b, i) => {
    const normalised = b.max > 0 ? b.score / b.max : 0;
    return sum + normalised * (factorWeights[i] ?? 0.125);
  }, 0);

  const percentage = Math.round(weightedScore * 100);

  // Retain raw totalScore for backwards compatibility
  const totalScore = breakdown.reduce((sum, b) => sum + b.score, 0);

  let rating: HomeTiesResult['rating'];
  let riskLevel: HomeTiesResult['riskLevel'];
  if (percentage >= 80)      { rating = 'very_strong'; riskLevel = 'very_low'; }
  else if (percentage >= 60) { rating = 'strong';      riskLevel = 'low'; }
  else if (percentage >= 40) { rating = 'moderate';    riskLevel = 'medium'; }
  else                       { rating = 'weak';        riskLevel = 'high'; }

  // ── Strengths & Weaknesses ─────────────────────────────────────────────────
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  for (const b of breakdown) {
    const pct = b.max > 0 ? b.score / b.max : 0;
    if (pct >= 0.67) {
      strengths.push(`${b.category}: ${b.label}`);
    } else if (pct < 0.34) {
      weaknesses.push(`${b.category}: ${b.label}`);
    }
  }

  // Context-specific recommendations
  if (empScore === 0) {
    recommendations.push('Obtain a formal letter from employer (or previous employer) confirming employment status and salary — this is the single most important document.');
  }
  if (durScore <= 1) {
    recommendations.push('Employment duration is short. Include a contract showing start date + confirmation of ongoing employment after the travel period.');
  }
  if (bankScore === 0 && input.bankAccountProfile === 'lump_sum_recently') {
    recommendations.push('⚠️ A lump sum deposited shortly before application is a major red flag for embassies. Ideally use 3–6 months of statements showing regular income instead.');
  }
  if (bankScore === 0) {
    recommendations.push('Provide 3–6 months of bank statements showing consistent income. Avoid presenting accounts with sparse history.');
  }
  if (propScore === 0) {
    recommendations.push('If possible, provide utility bills, lease agreements, or a letter from a family member confirming the applicant\'s permanent address in the home country.');
  }
  if (famScore === 0) {
    recommendations.push('If the applicant has any family remaining in the home country, include evidence of this (birth certificates, IDs of dependants left behind).');
  }
  if (finScore === 0) {
    recommendations.push('Financial commitments (mortgage, vehicle, business) demonstrate reason to return. If applicable, include bond/loan statements.');
  }
  if (travelScore === 0) {
    recommendations.push('First-time travellers face higher scrutiny. Consider including a detailed trip itinerary, confirmed return ticket, and hotel booking to offset the lack of travel history.');
  }
  if (incScore <= 1) {
    recommendations.push('Ensure the applicant\'s monthly income clearly covers travel costs. Include payslips for the last 3 months. If funds are from savings, explain the source.');
  }

  // Destination-specific note
  let summaryNote = '';
  const dest = input.destinationCountry.toLowerCase();
  if (dest.includes('uk') || dest.includes('united kingdom') || dest.includes('britain')) {
    summaryNote = `UK Visitor Visa (Appendix V): The Home Office assesses "genuine intention to leave." Key documents: employer letter on letterhead confirming leave approval, 3–6 months bank statements, confirmed return travel. A score of ${percentage}% indicates ${riskLevel} refusal risk under UK rules.`;
  } else if (['france','germany','netherlands','italy','spain','schengen','belgium','austria','switzerland','portugal'].some(c => dest.includes(c))) {
    summaryNote = `Schengen Short-Stay (Type C): Embassies assess "sufficient means of subsistence" and "intention to leave territory." Proof of accommodation, return ticket, and financial means are mandatory. Score of ${percentage}% — ${riskLevel} refusal risk.`;
  } else if (dest.includes('canada')) {
    summaryNote = `Canada Visitor / TRV: IRCC assesses ties to home country under IRPA Section 20(1)(b). Strong employment and financial ties are critical. Score of ${percentage}% — ${riskLevel} refusal risk.`;
  } else if (dest.includes('australia')) {
    summaryNote = `Australia Visitor (Subclass 600): Home Affairs assesses "genuine temporary entrant" intent. Employment letter + financial evidence are key. Score of ${percentage}% — ${riskLevel} refusal risk.`;
  } else if (dest.includes('usa') || dest.includes('united states') || dest.includes('america')) {
    summaryNote = `US B-1/B-2 Visa: Under INA 214(b), the burden is on the applicant to prove non-immigrant intent. All applicants are presumed to intend to immigrate until proven otherwise. Score of ${percentage}% — ${riskLevel} refusal risk.`;
  } else {
    summaryNote = `Home ties score of ${percentage}% indicates ${riskLevel} refusal risk. Strengthen any weak categories before submission.`;
  }

  return {
    score: totalScore,
    maxScore: MAX_SCORE,
    percentage,
    rating,
    riskLevel,
    breakdown,
    recommendations,
    strengths,
    weaknesses,
    summaryNote,
  };
}
