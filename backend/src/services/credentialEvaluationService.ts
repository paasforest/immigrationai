/**
 * Credential Evaluation Matrix
 * -----------------------------
 * Maps: Origin Country + Destination Country + Profession Type
 * → Required evaluation body, documents, timelines, costs, official source
 *
 * Based on real evaluation body requirements as of 2025.
 */

export interface CredentialQuery {
  originCountry: string;    // e.g. "South Africa", "Nigeria", "Zimbabwe"
  destinationCountry: string; // e.g. "United Kingdom", "Germany"
  professionType: string;   // e.g. "nursing", "engineering", "medicine"
}

export interface EvaluationBody {
  name: string;
  acronym: string;
  website: string;
  description: string;
  estimatedFee: string;
  estimatedTimeline: string;
  documentsRequired: string[];
  notes: string;
  isRegulatory: boolean; // true = legally required (regulated profession), false = advisory
}

export interface CredentialEvaluationResult {
  professionType: string;
  destinationCountry: string;
  originCountry: string;
  evaluationBodies: EvaluationBody[];
  preEvaluationRequired: string | null; // e.g. "SAQA must be done first"
  additionalSteps: string[];
  refusalRiskNote: string;
  euFamilyMemberNote: string | null;
}

// ── Evaluation Body Master List ──────────────────────────────────────────────

const BODIES: Record<string, EvaluationBody> = {
  UK_ENIC: {
    name: 'UK ENIC (formerly UK NARIC)',
    acronym: 'ENIC',
    website: 'https://www.enic.org.uk',
    description: 'The official UK agency for recognising international qualifications. Required by most UK employers, universities, and UKVI for skilled worker visas.',
    estimatedFee: '£60–£195 depending on service level',
    estimatedTimeline: '5–15 business days (standard); 2 days (priority)',
    documentsRequired: [
      'Official transcripts (originals or certified copies)',
      'Degree/diploma certificate (with certified translation if not in English)',
      'Proof of identity (passport)',
      'Institution accreditation evidence (if asked)',
    ],
    notes: 'ENIC statement is often required alongside specific regulatory body registration. Get a "Statement of Comparability" for immigration purposes.',
    isRegulatory: false,
  },
  UK_GMC: {
    name: 'General Medical Council',
    acronym: 'GMC',
    website: 'https://www.gmc-uk.org',
    description: 'Regulatory body for all doctors practising in the UK. International medical graduates must pass PLAB or hold a specialist qualification equivalent.',
    estimatedFee: '£255 (PLAB 1) + £863 (PLAB 2)',
    estimatedTimeline: '3–12 months (including PLAB exams)',
    documentsRequired: [
      'Medical degree certificate',
      'Official transcripts',
      'Certificate of Good Standing from home country medical council',
      'English language proof (IELTS Academic 7.5 / OET grade B)',
      'Passport',
    ],
    notes: 'All medical degrees from countries outside the EEA must go through PLAB unless the applicant has a specialist qualification accepted by the GMC.',
    isRegulatory: true,
  },
  UK_NMC: {
    name: 'Nursing & Midwifery Council',
    acronym: 'NMC',
    website: 'https://www.nmc.org.uk',
    description: 'Regulatory body for nurses and midwives in the UK.',
    estimatedFee: '£140 (application fee)',
    estimatedTimeline: '3–6 months',
    documentsRequired: [
      'Nursing qualification certificate',
      'Transcripts/academic record',
      'Certificate of current good standing from home country nursing council',
      'IELTS Academic 7.0 or OET grade B',
      'Passport photo ID',
      'Occupational health clearance',
    ],
    notes: 'NMC requires Objective Structured Clinical Examination (OSCE) for most internationally qualified nurses.',
    isRegulatory: true,
  },
  UK_HCPC: {
    name: 'Health & Care Professions Council',
    acronym: 'HCPC',
    website: 'https://www.hcpc-uk.org',
    description: 'Regulates 15 health professions including physiotherapy, radiography, occupational therapy, social work.',
    estimatedFee: '£540 (registration)',
    estimatedTimeline: '4–8 months',
    documentsRequired: [
      'Qualification certificate',
      'Transcripts',
      'Good standing letter from home regulator',
      'English language proof',
      'Portfolio of practice evidence (may be required)',
    ],
    notes: 'HCPC assesses the qualification against UK standards. May require additional training or supervised practice if qualification is not equivalent.',
    isRegulatory: true,
  },
  SAQA: {
    name: 'South African Qualifications Authority',
    acronym: 'SAQA',
    website: 'https://www.saqa.org.za',
    description: 'SA national body for evaluating foreign qualifications OR for certifying South African qualifications for overseas recognition. If a South African applicant needs their SA degree recognised abroad, SAQA provides a "Foreign Qualifications Evaluation" certificate which is then submitted to the destination country\'s body.',
    estimatedFee: 'R200–R1,400',
    estimatedTimeline: '3–6 months',
    documentsRequired: [
      'Certified copy of qualification certificate',
      'Academic transcripts (official)',
      'Proof of identity (SA ID or passport)',
      'Proof of registration with relevant professional body (if applicable)',
    ],
    notes: 'For South African applicants going overseas: many destination country bodies (e.g. ENIC, WES) will accept a SAQA evaluation as the first step.',
    isRegulatory: false,
  },
  WES: {
    name: 'World Education Services',
    acronym: 'WES',
    website: 'https://www.wes.org',
    description: 'Major North American credential evaluation body. Used for Canadian Express Entry, provincial nominations, and US immigration/employment.',
    estimatedFee: 'CAD $235–$400 (Canada) / USD $205 (USA)',
    estimatedTimeline: '7–20 business days (standard); 3–5 days (rush)',
    documentsRequired: [
      'Official transcripts sent directly from institution',
      'Degree/diploma certificate',
      'Identity document',
      'Completed WES application form',
    ],
    notes: 'For Canada Express Entry, a WES Educational Credential Assessment (ECA) is mandatory. SA applicants should get a "WES ECA" for both IRCC and OINP purposes.',
    isRegulatory: false,
  },
  NUFFIC: {
    name: 'EP-Nuffic (Netherlands)',
    acronym: 'Nuffic',
    website: 'https://www.nuffic.nl/en',
    description: 'Dutch organisation for internationalisation of education. Evaluates foreign qualifications for Netherlands employers, professional registration, and immigration.',
    estimatedFee: '€100–€300',
    estimatedTimeline: '4–8 weeks',
    documentsRequired: [
      'Degree/diploma certificate (with certified Dutch translation if not in English/Dutch)',
      'Academic transcripts',
      'Proof of identity',
      'Accreditation proof of institution',
    ],
    notes: 'For EU family member residence applications, credential evaluation is separate from immigration — it is typically needed for employment, not for the residence permit itself.',
    isRegulatory: false,
  },
  ANABIN: {
    name: 'anabin Database / KMK',
    acronym: 'anabin/KMK',
    website: 'https://anabin.kmk.org',
    description: 'German federal database of foreign qualifications maintained by the Conference of Ministers of Education (KMK). For regulated professions, the Landesprüfungsamt (State Examination Office) handles individual assessments.',
    estimatedFee: '€100–€600 (varies by state and profession)',
    estimatedTimeline: '3–6 months',
    documentsRequired: [
      'Degree/diploma certificate',
      'Transcripts (with certified German translation)',
      'CV/work history',
      'Identity document',
      'For regulated professions: professional body registration from home country',
    ],
    notes: 'First check anabin.kmk.org to see if the institution and degree are already rated H+ (fully equivalent) or H+/- (partially equivalent). If H-, a full assessment is needed. For doctors: Approbation from Landesprüfungsamt. For engineers: NARIC assessment or direct recognition by state engineering chamber.',
    isRegulatory: false,
  },
  ENGINEERS_AUSTRALIA: {
    name: 'Engineers Australia',
    acronym: 'EA',
    website: 'https://www.engineersaustralia.org.au',
    description: 'Assesses engineering qualifications for Australian skilled migration (Skills Assessment for subclass 189, 190, 491). Required for engineers on the MLTSSL/STSOL lists.',
    estimatedFee: 'AUD $1,000–$1,650',
    estimatedTimeline: '10–16 weeks',
    documentsRequired: [
      'Degree certificate',
      'Academic transcripts',
      'Resume/CV',
      'Employment references (for experienced engineers)',
      'CDR (Competency Demonstration Report) if degree not from Washington Accord signatory',
    ],
    notes: 'South Africa is NOT a Washington Accord signatory — SA engineers must submit a CDR. Zimbabwe also requires CDR. This adds ~3 months to the process.',
    isRegulatory: true,
  },
  AMC: {
    name: 'Australian Medical Council',
    acronym: 'AMC',
    website: 'https://www.amc.org.au',
    description: 'Assesses overseas-trained doctors for registration with AHPRA (Australian Health Practitioner Regulation Agency).',
    estimatedFee: 'AUD $1,000–$3,500',
    estimatedTimeline: '6–18 months (including exams)',
    documentsRequired: [
      'Medical degree',
      'Transcripts',
      'Current certificate of good standing from home medical council (e.g. HPCSA for SA doctors)',
      'English proficiency (OET or IELTS)',
      'Internship completion certificate',
    ],
    notes: 'SA doctors must first obtain a Certificate of Good Standing from the Health Professions Council of South Africa (HPCSA) before applying to AMC.',
    isRegulatory: true,
  },
  HPCSA: {
    name: 'Health Professions Council of South Africa',
    acronym: 'HPCSA',
    website: 'https://www.hpcsa.co.za',
    description: 'Required as a PRE-STEP for South African health professionals applying overseas. Certificate of Good Standing from HPCSA is required by GMC (UK), AMC (Australia), and most other destination country health regulators.',
    estimatedFee: 'R500–R2,000',
    estimatedTimeline: '4–8 weeks',
    documentsRequired: [
      'SA ID / Passport',
      'Proof of HPCSA registration',
      'Completed application form',
    ],
    notes: 'Certificate of Good Standing is typically valid for 6 months. Apply for this BEFORE applying to the destination country body.',
    isRegulatory: false,
  },
  SANC: {
    name: 'South African Nursing Council',
    acronym: 'SANC',
    website: 'https://www.sanc.co.za',
    description: 'Required pre-step for South African nurses applying to UK NMC or other overseas nursing regulators.',
    estimatedFee: 'R500',
    estimatedTimeline: '2–4 weeks',
    documentsRequired: [
      'SA ID / Passport',
      'Proof of SANC registration',
      'Application form',
    ],
    notes: 'Certificate of Current Good Standing from SANC is required by UK NMC, Australian AHPRA, and others. Get this first.',
    isRegulatory: false,
  },
};

// ── Lookup Matrix ─────────────────────────────────────────────────────────────

type ProfessionKey = 'medicine' | 'nursing' | 'midwifery' | 'engineering' | 'teaching' | 'law' | 'accounting' | 'architecture' | 'social_work' | 'physiotherapy' | 'pharmacy' | 'general';

const DESTINATION_PROFESSION_MAP: Record<string, Record<ProfessionKey, string[]>> = {
  'united kingdom': {
    medicine:       ['HPCSA', 'UK_GMC'],
    nursing:        ['SANC', 'UK_NMC'],
    midwifery:      ['SANC', 'UK_NMC'],
    engineering:    ['UK_ENIC'],
    teaching:       ['UK_ENIC'],
    law:            ['UK_ENIC'],
    accounting:     ['UK_ENIC'],
    architecture:   ['UK_ENIC'],
    social_work:    ['UK_HCPC'],
    physiotherapy:  ['UK_HCPC'],
    pharmacy:       ['UK_HCPC'],
    general:        ['UK_ENIC'],
  },
  'netherlands': {
    medicine:       ['HPCSA', 'NUFFIC'],
    nursing:        ['SANC', 'NUFFIC'],
    midwifery:      ['SANC', 'NUFFIC'],
    engineering:    ['NUFFIC'],
    teaching:       ['NUFFIC'],
    law:            ['NUFFIC'],
    accounting:     ['NUFFIC'],
    architecture:   ['NUFFIC'],
    social_work:    ['NUFFIC'],
    physiotherapy:  ['NUFFIC'],
    pharmacy:       ['NUFFIC'],
    general:        ['NUFFIC'],
  },
  'germany': {
    medicine:       ['HPCSA', 'ANABIN'],
    nursing:        ['SANC', 'ANABIN'],
    midwifery:      ['SANC', 'ANABIN'],
    engineering:    ['ANABIN'],
    teaching:       ['ANABIN'],
    law:            ['ANABIN'],
    accounting:     ['ANABIN'],
    architecture:   ['ANABIN'],
    social_work:    ['ANABIN'],
    physiotherapy:  ['ANABIN'],
    pharmacy:       ['ANABIN'],
    general:        ['ANABIN'],
  },
  'canada': {
    medicine:       ['HPCSA', 'WES'],
    nursing:        ['SANC', 'WES'],
    midwifery:      ['SANC', 'WES'],
    engineering:    ['WES'],
    teaching:       ['WES'],
    law:            ['WES'],
    accounting:     ['WES'],
    architecture:   ['WES'],
    social_work:    ['WES'],
    physiotherapy:  ['WES'],
    pharmacy:       ['WES'],
    general:        ['WES'],
  },
  'australia': {
    medicine:       ['HPCSA', 'AMC'],
    nursing:        ['SANC', 'ENGINEERS_AUSTRALIA'],
    midwifery:      ['SANC', 'ENGINEERS_AUSTRALIA'],
    engineering:    ['ENGINEERS_AUSTRALIA'],
    teaching:       ['UK_ENIC'], // AITSL for Australia but using generic
    law:            ['UK_ENIC'],
    accounting:     ['WES'],
    architecture:   ['UK_ENIC'],
    social_work:    ['UK_ENIC'],
    physiotherapy:  ['UK_ENIC'],
    pharmacy:       ['UK_ENIC'],
    general:        ['UK_ENIC'],
  },
};

// Normalise destination country to key
function normalizeDestination(dest: string): string {
  const d = dest.toLowerCase().trim();
  if (d.includes('uk') || d.includes('united kingdom') || d.includes('britain') || d.includes('england')) return 'united kingdom';
  if (d.includes('netherlands') || d.includes('holland') || d.includes('dutch')) return 'netherlands';
  if (d.includes('german')) return 'germany';
  if (d.includes('canada')) return 'canada';
  if (d.includes('australia')) return 'australia';
  return d;
}

// Normalise profession to key
function normalizeProfession(prof: string): ProfessionKey {
  const p = prof.toLowerCase().trim();
  if (p.includes('doctor') || p.includes('medic') || p.includes('physician') || p.includes('surgeon')) return 'medicine';
  if (p.includes('nurs')) return 'nursing';
  if (p.includes('midwif')) return 'midwifery';
  if (p.includes('engineer') || p.includes('techni')) return 'engineering';
  if (p.includes('teach') || p.includes('educat')) return 'teaching';
  if (p.includes('law') || p.includes('legal') || p.includes('solicit') || p.includes('barrister')) return 'law';
  if (p.includes('account') || p.includes('finance') || p.includes('audit')) return 'accounting';
  if (p.includes('architect')) return 'architecture';
  if (p.includes('social work') || p.includes('social care')) return 'social_work';
  if (p.includes('physio') || p.includes('occupational')) return 'physiotherapy';
  if (p.includes('pharm')) return 'pharmacy';
  return 'general';
}

// Check if origin is from Southern/Central Africa
function isSouthernAfrica(origin: string): boolean {
  const o = origin.toLowerCase();
  return ['south africa', 'zimbabwe', 'zambia', 'mozambique', 'namibia', 'botswana', 'malawi', 'lesotho', 'eswatini', 'swaziland'].some(c => o.includes(c));
}

export function lookupCredentialEvaluation(query: CredentialQuery): CredentialEvaluationResult {
  const destKey = normalizeDestination(query.destinationCountry);
  const profKey = normalizeProfession(query.professionType);

  const bodyKeys = DESTINATION_PROFESSION_MAP[destKey]?.[profKey]
    || DESTINATION_PROFESSION_MAP[destKey]?.['general']
    || ['UK_ENIC']; // fallback

  const evaluationBodies = bodyKeys.map(k => BODIES[k]).filter(Boolean);

  // Pre-evaluation note for Southern African applicants
  let preEvaluationRequired: string | null = null;
  if (isSouthernAfrica(query.originCountry)) {
    const profLower = query.professionType.toLowerCase();
    if (profLower.includes('doctor') || profLower.includes('medic') || profLower.includes('physio') || profLower.includes('pharm')) {
      preEvaluationRequired = 'HPCSA Certificate of Good Standing required FIRST (Health Professions Council of SA) — apply at www.hpcsa.co.za before submitting to destination country body.';
    } else if (profLower.includes('nurs') || profLower.includes('midwif')) {
      preEvaluationRequired = 'SANC Certificate of Current Good Standing required FIRST (SA Nursing Council) — apply at www.sanc.co.za before submitting to destination country body.';
    }
  }

  // Additional steps
  const additionalSteps: string[] = [];
  if (destKey === 'united kingdom') {
    additionalSteps.push('English proficiency: IELTS Academic 6.5+ (or equivalent OET) required for most regulated professions and Skilled Worker visas.');
    additionalSteps.push('DBS check (Disclosure and Barring Service) required for roles working with children or vulnerable adults.');
  }
  if (destKey === 'germany') {
    additionalSteps.push('Certified German translation of all documents required (Staatlich anerkannte Übersetzer).');
    additionalSteps.push('German language certificate (B2/C1) typically required for regulated professions.');
  }
  if (destKey === 'netherlands') {
    additionalSteps.push('Civic integration exam (inburgering) required within 3 years of arrival for most non-EU immigrants.');
    additionalSteps.push('DigiD (Dutch digital identity) must be registered upon arrival to access government services.');
  }
  if (destKey === 'canada') {
    additionalSteps.push('Provincial nominee programs may have their own body requirements. Check provincial licensing body in target province.');
    additionalSteps.push('IELTS/CELPIP score of 7+ (CLB 9) required for Express Entry.');
  }
  if (destKey === 'australia') {
    additionalSteps.push('Skills assessment from the relevant body must be completed BEFORE lodging a Points-Based visa application.');
    additionalSteps.push('English proficiency: IELTS 6.0–7.0+ depending on visa subclass.');
  }

  const refusalRiskNote = evaluationBodies.some(b => b.isRegulatory)
    ? `⚠️ ${query.professionType} is a REGULATED profession in ${query.destinationCountry}. Without the required registration, the applicant cannot legally practise — this will result in visa refusal if the sponsoring employer cannot confirm role eligibility.`
    : `This profession is generally not regulated in ${query.destinationCountry}, but credential evaluation is still strongly recommended for skilled worker visa applications to demonstrate qualification equivalency.`;

  // EU family member note
  let euFamilyMemberNote: string | null = null;
  const euDests = ['netherlands', 'germany', 'france', 'belgium', 'austria', 'spain', 'italy', 'portugal', 'sweden', 'ireland'];
  if (euDests.includes(destKey)) {
    euFamilyMemberNote = `If the applicant is travelling as a family member of an EU/EEA citizen (spouse, child, dependent), they may apply under EU Directive 2004/38/EC (Free Movement Directive) rather than standard immigration rules. Credential evaluation is still required for EMPLOYMENT but the RESIDENCE PERMIT application follows different rules with stronger rights. Flag this case accordingly.`;
  }

  return {
    professionType: query.professionType,
    destinationCountry: query.destinationCountry,
    originCountry: query.originCountry,
    evaluationBodies,
    preEvaluationRequired,
    additionalSteps,
    refusalRiskNote,
    euFamilyMemberNote,
  };
}

// ── List of all supported destination countries ───────────────────────────────
export const SUPPORTED_EVALUATION_DESTINATIONS = [
  'United Kingdom',
  'Netherlands',
  'Germany',
  'Canada',
  'Australia',
];

export const PROFESSION_OPTIONS = [
  { value: 'medicine', label: 'Doctor / Physician / Surgeon' },
  { value: 'nursing', label: 'Nurse' },
  { value: 'midwifery', label: 'Midwife' },
  { value: 'engineering', label: 'Engineer' },
  { value: 'teaching', label: 'Teacher / Educator' },
  { value: 'law', label: 'Lawyer / Legal Professional' },
  { value: 'accounting', label: 'Accountant / Auditor / Finance' },
  { value: 'architecture', label: 'Architect' },
  { value: 'social_work', label: 'Social Worker' },
  { value: 'physiotherapy', label: 'Physiotherapist / Occupational Therapist' },
  { value: 'pharmacy', label: 'Pharmacist' },
  { value: 'general', label: 'Other / General Qualification' },
];
