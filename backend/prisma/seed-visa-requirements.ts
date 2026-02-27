/**
 * Seed script: 20 priority immigration routes
 * Run: npx ts-node prisma/seed-visa-requirements.ts
 *
 * These are the highest-volume routes for African applicants.
 * Each entry is the ground truth that the RAG layer reads from.
 * Last verified: Feb 2025
 *
 * IMPORTANT: When rules change, update version + changeNotes + lastVerifiedAt.
 * Never delete — use history table for audit trail.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ────────────────────────────────────────────────────────────────────────────
// TYPE HELPERS
// ────────────────────────────────────────────────────────────────────────────
interface RequirementItem {
  id: string;
  category: string;
  name: string;
  description: string;
  isMandatory: boolean;
  isAiGeneratable: boolean;   // true = Doc Studio can produce this
  officialSource?: string;    // direct URL to the official page
  estimatedDays?: number;     // lead time to obtain
  notes?: string;             // country-specific gotchas
  urgencyLevel: 'critical' | 'high' | 'normal' | 'low';
}

const ROUTES = [

  // ══════════════════════════════════════════════════════════
  //  1. SOUTH AFRICA → UK — Skilled Worker Visa
  // ══════════════════════════════════════════════════════════
  {
    routeKey: 'ZA-GB-skilled_worker',
    originCountry: 'South Africa',
    destinationCountry: 'United Kingdom',
    visaType: 'Skilled Worker Visa',
    displayName: 'South Africa → UK Skilled Worker Visa',
    summary:
      'UK Skilled Worker visa for South African nationals. Requires a Certificate of Sponsorship (CoS) from a licensed UK employer, English language proof, and sufficient funds. No language waiver for most roles.',
    processingTime: { minDays: 15, maxDays: 45, typicalDays: 21, source: 'https://www.gov.uk/skilled-worker-visa/how-long-it-takes' },
    financialThresholds: { amount: 1270, currency: 'GBP', description: 'Maintenance funds required if not exempt via employer', asOf: '2025-01' },
    knownGotchas: [
      'CoS must be issued before you apply — cannot apply and look for sponsor simultaneously.',
      'Police clearance from SAPS must be apostilled. Allow 3–4 weeks for SAPS then 1 week for apostille.',
      'English test (IELTS / Pearson / OET) must be from an approved provider. University degrees taught in English can qualify instead.',
      'If switching from Visitor visa to Skilled Worker, you must return to South Africa to apply — cannot switch in-country.',
    ],
    criticalPath: [
      'Secure UK job offer from licensed sponsor',
      'Employer issues Certificate of Sponsorship (CoS)',
      'Complete IELTS/English test (book 4–6 weeks ahead)',
      'Obtain SAPS police clearance + apostille (3–4 weeks)',
      'Gather financial evidence',
      'Submit online application + biometrics at VFS',
    ],
    officialSources: [
      { name: 'Gov.uk Skilled Worker', url: 'https://www.gov.uk/skilled-worker-visa', lastChecked: '2025-02-01', contentHash: '' },
      { name: 'Check if eligible', url: 'https://www.gov.uk/skilled-worker-visa/eligibility', lastChecked: '2025-02-01', contentHash: '' },
    ],
    requirements: [
      { id: 'SW-001', category: 'Sponsorship', name: 'Certificate of Sponsorship (CoS)', description: 'Reference number issued by your UK employer via the sponsor management system.', isMandatory: true, isAiGeneratable: false, officialSource: 'https://www.gov.uk/skilled-worker-visa/your-job', estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'SW-002', category: 'Identity', name: 'Valid Passport', description: 'Current SA passport valid for the duration of stay. Biographic data page required.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical', notes: 'Allow 4–6 weeks for SA passport renewal if needed.' },
      { id: 'SW-003', category: 'Police Clearance', name: 'SAPS Police Clearance (Apostilled)', description: 'South African Police Service clearance certificate with apostille stamp.', isMandatory: true, isAiGeneratable: false, officialSource: 'https://www.saps.gov.za/services/criminalrecord.php', estimatedDays: 25, urgencyLevel: 'critical', notes: 'SAPS processing: 10–14 working days. Apostille from DIRCO: 5–7 days.' },
      { id: 'SW-004', category: 'English Language', name: 'English Language Proof', description: 'IELTS Academic/General (minimum B1 per component), Pearson PTE, OET, or eligible degree.', isMandatory: true, isAiGeneratable: false, estimatedDays: 21, urgencyLevel: 'critical', notes: 'If degree was taught in English, provide letter from university on letterhead.' },
      { id: 'SW-005', category: 'Financial', name: 'Bank Statements (3 months)', description: 'Personal bank statements showing minimum £1,270 unless employer exempts you.', isMandatory: true, isAiGeneratable: false, estimatedDays: 3, urgencyLevel: 'high' },
      { id: 'SW-006', category: 'Employment', name: 'Employment Contract / Offer Letter', description: 'Signed offer of employment from UK sponsor confirming role, salary, and start date.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'high' },
      { id: 'SW-007', category: 'Qualifications', name: 'Degree / Professional Qualifications', description: 'Certified copies of relevant degrees or professional certifications for your role.', isMandatory: true, isAiGeneratable: false, estimatedDays: 7, urgencyLevel: 'high' },
      { id: 'SW-008', category: 'Personal Statement', name: 'Statement of Purpose', description: 'Explains your immigration intent, background, and why you are suited for the role.', isMandatory: false, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'normal', notes: 'Not always required but strengthens application. Doc Studio can generate this.' },
      { id: 'SW-009', category: 'Financial', name: 'Payslips / Previous Employment Evidence', description: 'Last 3 payslips from current/recent employer if salary continuity is relevant.', isMandatory: false, isAiGeneratable: false, estimatedDays: 3, urgencyLevel: 'normal' },
      { id: 'SW-010', category: 'Photos', name: 'Passport Photos (2x)', description: 'Two passport-sized colour photos meeting UK biometric photo standards.', isMandatory: true, isAiGeneratable: false, estimatedDays: 1, urgencyLevel: 'normal' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // ══════════════════════════════════════════════════════════
  //  2. SOUTH AFRICA → UK — Student Visa
  // ══════════════════════════════════════════════════════════
  {
    routeKey: 'ZA-GB-student',
    originCountry: 'South Africa',
    destinationCountry: 'United Kingdom',
    visaType: 'Student Visa',
    displayName: 'South Africa → UK Student Visa',
    summary:
      'UK Student visa for South African nationals. Requires a Confirmation of Acceptance for Studies (CAS) from a licensed UK university/college. ATAS clearance needed for certain postgraduate STEM subjects.',
    processingTime: { minDays: 15, maxDays: 30, typicalDays: 20, source: 'https://www.gov.uk/student-visa/how-long-it-takes' },
    financialThresholds: { amount: 1334, currency: 'GBP', description: 'Per month for courses in London (up to 9 months). Outside London: £1,023/month.', asOf: '2025-01' },
    knownGotchas: [
      'CAS reference number expires — apply within 6 months of CAS being assigned.',
      'ATAS clearance for certain postgraduate courses in science and technology can take up to 30 working days — apply first.',
      'Maintenance funds must have been held for 28 consecutive days in your bank account ending no more than 31 days before application.',
      'If course starts before the CAS was assigned, the application will be refused.',
    ],
    criticalPath: [
      'Receive unconditional offer from UKVI-licensed university',
      'University assigns CAS number',
      'Check if ATAS clearance is needed → apply early if so',
      'Accumulate funds for required period (28 days)',
      'Complete English test if not exempted',
      'Submit online application + biometrics at VFS',
    ],
    officialSources: [
      { name: 'Gov.uk Student Visa', url: 'https://www.gov.uk/student-visa', lastChecked: '2025-02-01', contentHash: '' },
      { name: 'Financial requirements', url: 'https://www.gov.uk/student-visa/money', lastChecked: '2025-02-01', contentHash: '' },
    ],
    requirements: [
      { id: 'ST-001', category: 'Sponsorship', name: 'Confirmation of Acceptance for Studies (CAS)', description: 'Unique reference number from your UK educational institution.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'ST-002', category: 'Identity', name: 'Valid Passport', description: 'Valid SA passport with at least 6 months validity beyond intended stay.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical' },
      { id: 'ST-003', category: 'Financial', name: 'Bank Statements (28-day period)', description: 'Showing funds held continuously for 28 days ending ≤31 days before application date.', isMandatory: true, isAiGeneratable: false, estimatedDays: 28, urgencyLevel: 'critical', notes: 'Funds must NOT dip below required threshold at any point in 28-day window.' },
      { id: 'ST-004', category: 'English Language', name: 'English Language Proof', description: 'IELTS Academic, Pearson, or university-approved equivalent. B2 CEFR minimum.', isMandatory: true, isAiGeneratable: false, estimatedDays: 21, urgencyLevel: 'critical' },
      { id: 'ST-005', category: 'Academic', name: 'Offer Letter / Enrolment Letter', description: 'Official unconditional offer letter from the UK institution.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'high' },
      { id: 'ST-006', category: 'Academic', name: 'Academic Transcripts & Certificates', description: 'Certified copies of relevant previous qualifications.', isMandatory: true, isAiGeneratable: false, estimatedDays: 7, urgencyLevel: 'high' },
      { id: 'ST-007', category: 'Personal Statement', name: 'Personal Statement / Statement of Purpose', description: 'Explains study motivation, career goals, and ties to home country.', isMandatory: false, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'normal', notes: 'Required for most postgraduate applications. Doc Studio can generate this.' },
      { id: 'ST-008', category: 'Clearances', name: 'ATAS Certificate (if required)', description: 'Academic Technology Approval Scheme clearance for sensitive STEM postgrad subjects.', isMandatory: false, isAiGeneratable: false, officialSource: 'https://www.gov.uk/guidance/academic-technology-approval-scheme', estimatedDays: 30, urgencyLevel: 'critical', notes: 'Check ATAS eligibility checker first. If required, apply BEFORE anything else — longest lead time.' },
      { id: 'ST-009', category: 'Financial', name: 'Financial Sponsor Letter (if funded by third party)', description: 'If parents or sponsor paying: signed letter + their bank statements.', isMandatory: false, isAiGeneratable: true, estimatedDays: 2, urgencyLevel: 'high', notes: 'Doc Studio can generate the sponsor letter template.' },
      { id: 'ST-010', category: 'Photos', name: 'Passport Photos (2x)', description: 'Two passport-sized photos meeting UKVI requirements.', isMandatory: true, isAiGeneratable: false, estimatedDays: 1, urgencyLevel: 'normal' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // ══════════════════════════════════════════════════════════
  //  3. NIGERIA → UK — Skilled Worker Visa
  // ══════════════════════════════════════════════════════════
  {
    routeKey: 'NG-GB-skilled_worker',
    originCountry: 'Nigeria',
    destinationCountry: 'United Kingdom',
    visaType: 'Skilled Worker Visa',
    displayName: 'Nigeria → UK Skilled Worker Visa',
    summary:
      'UK Skilled Worker visa for Nigerian nationals. Same core requirements as other nationalities but notable for high document fraud scrutiny and mandatory biometrics at VFS Lagos/Abuja.',
    processingTime: { minDays: 15, maxDays: 60, typicalDays: 25, source: 'https://www.gov.uk/skilled-worker-visa/how-long-it-takes' },
    financialThresholds: { amount: 1270, currency: 'GBP', description: 'Maintenance funds if not exempt', asOf: '2025-01' },
    knownGotchas: [
      'UKVI frequently requests additional documents for Nigerian applicants — submit a thorough package upfront.',
      'Nigerian police clearance: apply through NIS or approved company. Allow 4–6 weeks. Must be notarised.',
      'University degrees: UKVI may request evaluation from UK ENIC for degrees from Nigerian institutions.',
      'VFS Lagos appointment slots fill up fast — book biometrics immediately after submitting online application.',
    ],
    criticalPath: [
      'Secure CoS from UK licensed sponsor',
      'Apply for NIS police clearance (notarised)',
      'Book and complete IELTS/English test',
      'Request UK ENIC degree evaluation if needed',
      'Prepare financial evidence',
      'Submit online + book VFS Lagos/Abuja biometrics ASAP',
    ],
    officialSources: [
      { name: 'Gov.uk Skilled Worker', url: 'https://www.gov.uk/skilled-worker-visa', lastChecked: '2025-02-01', contentHash: '' },
      { name: 'VFS Nigeria', url: 'https://visa.vfsglobal.com/nga/en/gbr', lastChecked: '2025-02-01', contentHash: '' },
    ],
    requirements: [
      { id: 'NG-SW-001', category: 'Sponsorship', name: 'Certificate of Sponsorship (CoS)', description: 'Reference number from your licensed UK employer.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'NG-SW-002', category: 'Identity', name: 'Valid Nigerian Passport', description: 'International passport valid beyond intended stay.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical', notes: 'NIS passport renewals can take 8–12 weeks. Start early.' },
      { id: 'NG-SW-003', category: 'Police Clearance', name: 'Nigerian Police Clearance (Notarised)', description: 'Police clearance from NIS or accredited provider, notarised.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical', notes: 'VFS/NIS-approved providers available in Lagos, Abuja, Port Harcourt.' },
      { id: 'NG-SW-004', category: 'English Language', name: 'English Language Proof', description: 'IELTS minimum B1 per component or equivalent. Nigerian degrees taught in English may qualify.', isMandatory: true, isAiGeneratable: false, estimatedDays: 21, urgencyLevel: 'critical' },
      { id: 'NG-SW-005', category: 'Qualifications', name: 'Degree Certificates + UK ENIC Evaluation (if required)', description: 'Certified originals + ENIC evaluation letter if UKVI requests credential verification.', isMandatory: false, isAiGeneratable: false, officialSource: 'https://www.enic.org.uk', estimatedDays: 14, urgencyLevel: 'high', notes: 'UKVI often requests this for Nigerian graduates. £70–£100 fee.' },
      { id: 'NG-SW-006', category: 'Financial', name: 'Bank Statements (3 months)', description: 'Showing balance ≥ £1,270 unless exempt.', isMandatory: true, isAiGeneratable: false, estimatedDays: 3, urgencyLevel: 'high' },
      { id: 'NG-SW-007', category: 'Employment', name: 'Employment Contract / Offer Letter', description: 'Signed offer confirming role, salary, and start date.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'high' },
      { id: 'NG-SW-008', category: 'Personal Statement', name: 'Statement of Purpose', description: 'Explains intent, background, and suitability for the role.', isMandatory: false, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'normal', notes: 'Doc Studio can generate this. Strengthens application.' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // ══════════════════════════════════════════════════════════
  //  4. GHANA → CANADA — Study Permit
  // ══════════════════════════════════════════════════════════
  {
    routeKey: 'GH-CA-study_permit',
    originCountry: 'Ghana',
    destinationCountry: 'Canada',
    visaType: 'Study Permit',
    displayName: 'Ghana → Canada Study Permit',
    summary:
      'Canadian Study Permit for Ghanaian nationals via IRCC online application. SDS stream is NOT available for Ghanaians — must use the regular (non-SDS) stream. High refusal rate historically; strong financial evidence and clear study plan are critical.',
    processingTime: { minDays: 56, maxDays: 120, typicalDays: 84, source: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html' },
    financialThresholds: { amount: 10000, currency: 'CAD', description: 'Minimum proof of funds for first year (tuition + CAD 10,000 living). Higher is better.', asOf: '2025-01' },
    knownGotchas: [
      'SDS (Student Direct Stream) is NOT available for Ghanaian nationals — use the regular stream.',
      'Ghana has historically had a high refusal rate for Canadian student permits — financial evidence must be exceptionally strong.',
      'Ghana Revenue Authority (GRA) tax clearance is sometimes requested as additional evidence.',
      'Letter of Explanation for gaps in education or employment is strongly recommended.',
      'Family ties to Ghana section is heavily scrutinised — show property, employment, family.',
    ],
    criticalPath: [
      'Receive Letter of Acceptance from a designated learning institution (DLI)',
      'Accumulate strong financial evidence (12 months bank history)',
      'Write detailed Study Plan (why Canada, this institution, this program)',
      'Obtain medical exam from IRCC-designated physician if required',
      'Apply online via IRCC portal',
      'Complete biometrics at VFS Accra',
    ],
    officialSources: [
      { name: 'IRCC Study Permit', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html', lastChecked: '2025-02-01', contentHash: '' },
      { name: 'Check DLI status', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/designated-learning-institutions-list.html', lastChecked: '2025-02-01', contentHash: '' },
    ],
    requirements: [
      { id: 'GH-CA-SP-001', category: 'Sponsorship', name: 'Letter of Acceptance (LoA) from DLI', description: 'Official unconditional acceptance from a Designated Learning Institution.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'GH-CA-SP-002', category: 'Identity', name: 'Valid Ghanaian Passport', description: 'Valid passport with at least 6 months validity.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical' },
      { id: 'GH-CA-SP-003', category: 'Financial', name: 'Bank Statements (12 months)', description: 'Comprehensive 12-month history. Showing capacity to cover tuition + living (minimum CAD 10,000/year living).', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical', notes: 'Include all accounts. Large unexplained deposits are a red flag — each must be explained.' },
      { id: 'GH-CA-SP-004', category: 'Financial', name: 'Proof of Income / Sponsor\'s Employment', description: 'Salary slips, employment letter, or business registration if self-employed.', isMandatory: true, isAiGeneratable: false, estimatedDays: 7, urgencyLevel: 'critical' },
      { id: 'GH-CA-SP-005', category: 'Personal Statement', name: 'Study Plan', description: 'Detailed letter explaining why you chose Canada, this institution, and this program; and your plans to return to Ghana after.', isMandatory: true, isAiGeneratable: true, estimatedDays: 2, urgencyLevel: 'critical', notes: 'This is the most scrutinised document. Doc Studio can generate a strong template. Must sound personal.' },
      { id: 'GH-CA-SP-006', category: 'Academic', name: 'Academic Transcripts & Certificates', description: 'Certified copies of all previous academic qualifications.', isMandatory: true, isAiGeneratable: false, estimatedDays: 7, urgencyLevel: 'high' },
      { id: 'GH-CA-SP-007', category: 'English Language', name: 'English Test (IELTS Academic ≥ 6.0)', description: 'IELTS Academic or TOEFL iBT results meeting minimum DLI requirement.', isMandatory: true, isAiGeneratable: false, estimatedDays: 21, urgencyLevel: 'high', notes: 'Some DLIs have conditional offers that waive this — confirm with institution.' },
      { id: 'GH-CA-SP-008', category: 'Ties to Home', name: 'Ties to Home Country Statement', description: 'Letter describing property, family, employment ties that will bring you back to Ghana.', isMandatory: false, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'high', notes: 'Critical for Ghana given high refusal rate. Doc Studio can generate this.' },
      { id: 'GH-CA-SP-009', category: 'Medical', name: 'Medical Exam (IRCC Designated Physician)', description: 'Required if staying more than 6 months. From approved panel physician only.', isMandatory: true, isAiGeneratable: false, officialSource: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/medical-exams/requirements-permanent-residents.html', estimatedDays: 14, urgencyLevel: 'high' },
      { id: 'GH-CA-SP-010', category: 'Personal Statement', name: 'Financial Justification Letter', description: 'Explains source of funds, especially any large deposits.', isMandatory: false, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'high', notes: 'Strongly recommended for Ghana applications. Doc Studio can generate this.' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // ══════════════════════════════════════════════════════════
  //  5. KENYA → CANADA — Express Entry / Skilled Worker
  // ══════════════════════════════════════════════════════════
  {
    routeKey: 'KE-CA-express_entry',
    originCountry: 'Kenya',
    destinationCountry: 'Canada',
    visaType: 'Express Entry (Federal Skilled Worker)',
    displayName: 'Kenya → Canada Express Entry',
    summary:
      'Canadian permanent residence via Express Entry for Kenyan nationals. Must create an Express Entry profile and receive Invitation to Apply (ITA) via draws. ECA (credential assessment) is mandatory. High CRS scores needed — typically 470+.',
    processingTime: { minDays: 180, maxDays: 365, typicalDays: 210, source: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/apply-permanent-residence.html' },
    financialThresholds: { amount: 13757, currency: 'CAD', description: 'Settlement funds for single applicant (2024 levels). More required with family members.', asOf: '2025-01' },
    knownGotchas: [
      'ECA (Educational Credential Assessment) from WES or IQAS is mandatory — takes 7–12 weeks. Start immediately.',
      'IELTS CLB 7 minimum required for FSW (6.0 each band does NOT meet this — check CLB conversion table).',
      'Police clearance from Kenya required: Certificate of Good Conduct from DCI Kenya. Apply online at ecitizen.go.ke.',
      'CRS score cut-offs change every draw — check IRCC draw history. Score often 470+.',
      'Provincial Nominee Programs (PNP) can add 600 CRS points instantly — explore before waiting for draws.',
    ],
    criticalPath: [
      'Complete ECA through WES/IQAS (start first — 7–12 weeks)',
      'Take IELTS and achieve CLB 7+ in all bands',
      'Create Express Entry profile',
      'Receive ITA (Invitation to Apply) via draw',
      'Submit APR (Application for Permanent Residence) within 60 days of ITA',
      'Police clearance from DCI Kenya + RCMP (Canada)',
      'Medical exam from approved physician',
    ],
    officialSources: [
      { name: 'IRCC Express Entry', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html', lastChecked: '2025-02-01', contentHash: '' },
      { name: 'WES Canada', url: 'https://www.wes.org/ca/', lastChecked: '2025-02-01', contentHash: '' },
      { name: 'DCI Kenya Certificate of Good Conduct', url: 'https://www.dci.go.ke', lastChecked: '2025-02-01', contentHash: '' },
    ],
    requirements: [
      { id: 'KE-EE-001', category: 'Credentials', name: 'Educational Credential Assessment (ECA)', description: 'WES or IQAS evaluation confirming your degree is equivalent to a Canadian credential.', isMandatory: true, isAiGeneratable: false, estimatedDays: 56, urgencyLevel: 'critical', notes: 'WES is most accepted. Premium service available. Start this FIRST.' },
      { id: 'KE-EE-002', category: 'English Language', name: 'IELTS General Training (CLB 7+)', description: 'All 4 bands must meet CLB 7 minimum. Check exact CLB conversion on IRCC site.', isMandatory: true, isAiGeneratable: false, estimatedDays: 21, urgencyLevel: 'critical' },
      { id: 'KE-EE-003', category: 'Police Clearance', name: 'DCI Kenya Certificate of Good Conduct', description: 'Apply at ecitizen.go.ke. Must be apostilled.', isMandatory: true, isAiGeneratable: false, officialSource: 'https://ecitizen.go.ke', estimatedDays: 21, urgencyLevel: 'critical', notes: 'DCI processing has improved but can still take 2–3 weeks.' },
      { id: 'KE-EE-004', category: 'Identity', name: 'Valid Kenyan Passport', description: 'Valid passport with at least 12 months validity.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical' },
      { id: 'KE-EE-005', category: 'Financial', name: 'Proof of Settlement Funds', description: 'Bank statements proving CAD 13,757+ (single) or more with family.', isMandatory: true, isAiGeneratable: false, estimatedDays: 3, urgencyLevel: 'high' },
      { id: 'KE-EE-006', category: 'Employment', name: 'Employment History Records', description: 'Letters from past employers confirming NOC codes, hours, salary, and responsibilities.', isMandatory: true, isAiGeneratable: false, estimatedDays: 14, urgencyLevel: 'high' },
      { id: 'KE-EE-007', category: 'Medical', name: 'Immigration Medical Exam', description: 'From IRCC-approved panel physician. Valid 12 months from date of examination.', isMandatory: true, isAiGeneratable: false, estimatedDays: 14, urgencyLevel: 'high' },
      { id: 'KE-EE-008', category: 'Personal Statement', name: 'Statement of Purpose', description: 'Optional but helpful for discretionary cases. Explains immigration intent.', isMandatory: false, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'low' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // ══════════════════════════════════════════════════════════
  //  6. SOUTH AFRICA → CANADA — Study Permit
  // ══════════════════════════════════════════════════════════
  {
    routeKey: 'ZA-CA-study_permit',
    originCountry: 'South Africa',
    destinationCountry: 'Canada',
    visaType: 'Study Permit',
    displayName: 'South Africa → Canada Study Permit',
    summary:
      'Canadian Study Permit for South African nationals. SDS (Student Direct Stream) is available for South Africans — significantly faster processing (~20 days) if requirements are met including IELTS 6.0, paid tuition upfront, and GIC.',
    processingTime: { minDays: 20, maxDays: 90, typicalDays: 30, source: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html' },
    financialThresholds: { amount: 20635, currency: 'CAD', description: 'GIC of CAD 20,635 OR equivalent bank funds (2024 levels). First year tuition also required.', asOf: '2025-01' },
    knownGotchas: [
      'SDS requires IELTS 6.0 in each band (not average). A 5.5 in any band disqualifies SDS — must use regular stream.',
      'GIC (Guaranteed Investment Certificate) through approved Canadian financial institution (e.g. Scotiabank, CIBC). Minimum CAD 20,635 as of Jan 2024.',
      'First year tuition must be paid in full to the DLI before applying.',
      'Medical exam required if studying in healthcare or childcare, or if from certain countries.',
    ],
    criticalPath: [
      'Receive acceptance from DLI',
      'Pay first year tuition',
      'Purchase GIC from approved Canadian financial institution',
      'Take IELTS (6.0 each band for SDS)',
      'Submit online application (SDS or regular stream)',
      'Complete biometrics at VFS SA',
      'Medical exam if required',
    ],
    officialSources: [
      { name: 'IRCC Study Permit SDS', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/student-direct-stream.html', lastChecked: '2025-02-01', contentHash: '' },
      { name: 'GIC information', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/student-direct-stream/prepare.html', lastChecked: '2025-02-01', contentHash: '' },
    ],
    requirements: [
      { id: 'ZA-CA-SP-001', category: 'Sponsorship', name: 'Letter of Acceptance from DLI', description: 'Unconditional acceptance from a Designated Learning Institution.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'ZA-CA-SP-002', category: 'Financial', name: 'Guaranteed Investment Certificate (GIC)', description: 'CAD 20,635 GIC from approved institution (Scotiabank, CIBC, etc.). For SDS only.', isMandatory: false, isAiGeneratable: false, officialSource: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/student-direct-stream/prepare.html', estimatedDays: 14, urgencyLevel: 'critical', notes: 'Required for SDS. Bank account opening can take 1–2 weeks.' },
      { id: 'ZA-CA-SP-003', category: 'Financial', name: 'Tuition Payment Receipt', description: 'Proof that first year tuition has been paid in full to the DLI.', isMandatory: false, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical', notes: 'Required for SDS stream only.' },
      { id: 'ZA-CA-SP-004', category: 'English Language', name: 'IELTS Academic (6.0 each band for SDS)', description: 'Each individual band must be 6.0 or above for SDS. Below 6.0 in any band = use regular stream.', isMandatory: true, isAiGeneratable: false, estimatedDays: 21, urgencyLevel: 'critical' },
      { id: 'ZA-CA-SP-005', category: 'Identity', name: 'Valid SA Passport', description: 'Valid passport with at least 6 months validity beyond intended stay.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical' },
      { id: 'ZA-CA-SP-006', category: 'Academic', name: 'Academic Transcripts & Certificates', description: 'Certified copies of all previous qualifications.', isMandatory: true, isAiGeneratable: false, estimatedDays: 7, urgencyLevel: 'high' },
      { id: 'ZA-CA-SP-007', category: 'Personal Statement', name: 'Study Plan', description: 'Explains why you chose Canada, this institution, and your return plans.', isMandatory: true, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'high', notes: 'Doc Studio can generate a strong study plan. Personalise with specific program details.' },
      { id: 'ZA-CA-SP-008', category: 'Ties to Home', name: 'Ties to Home Country Statement', description: 'Demonstrates intention to return to South Africa after studies.', isMandatory: false, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'high', notes: 'Very helpful to include. Doc Studio can generate this.' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // ══════════════════════════════════════════════════════════
  //  7. NIGERIA → CANADA — Express Entry
  // ══════════════════════════════════════════════════════════
  {
    routeKey: 'NG-CA-express_entry',
    originCountry: 'Nigeria',
    destinationCountry: 'Canada',
    visaType: 'Express Entry (Federal Skilled Worker)',
    displayName: 'Nigeria → Canada Express Entry',
    summary:
      'Canadian Express Entry for Nigerian nationals. WES credential assessment is mandatory. Nigerian police clearance from NIS or National Identity Management Commission required. GCFR background check for public servants.',
    processingTime: { minDays: 180, maxDays: 365, typicalDays: 210, source: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html' },
    financialThresholds: { amount: 13757, currency: 'CAD', description: 'Settlement funds for single applicant (2024).', asOf: '2025-01' },
    knownGotchas: [
      'Nigerian police clearance: NIS online application at npc.gov.ng. Allow 4–6 weeks for processing + notarisation.',
      'WES assessment for Nigerian university degrees is strongly recommended. Allow 8–10 weeks.',
      'Nigerian NYSC (National Youth Service) discharge/exemption certificate required for graduates.',
      'Public servants require additional GCFR clearance — very long lead times.',
      'Fraudulent documents are heavily scrutinised — ensure all employer letters are genuine and verifiable.',
    ],
    criticalPath: [
      'WES credential assessment (start first — 8–10 weeks)',
      'IELTS CLB 7+ in all bands',
      'NIS police clearance + notarisation',
      'Gather NYSC certificate',
      'Create Express Entry profile',
      'Wait for ITA, then submit APR within 60 days',
    ],
    officialSources: [
      { name: 'IRCC Express Entry', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html', lastChecked: '2025-02-01', contentHash: '' },
      { name: 'NIS Police Clearance', url: 'https://npc.gov.ng', lastChecked: '2025-02-01', contentHash: '' },
    ],
    requirements: [
      { id: 'NG-EE-001', category: 'Credentials', name: 'WES Credential Assessment', description: 'World Education Services evaluation of Nigerian degree.', isMandatory: true, isAiGeneratable: false, estimatedDays: 56, urgencyLevel: 'critical' },
      { id: 'NG-EE-002', category: 'English Language', name: 'IELTS General (CLB 7+ each band)', description: 'Each band individually must meet CLB 7.', isMandatory: true, isAiGeneratable: false, estimatedDays: 21, urgencyLevel: 'critical' },
      { id: 'NG-EE-003', category: 'Police Clearance', name: 'NIS Police Clearance (Notarised)', description: 'Nigerian Immigration Service or approved clearance, notarised.', isMandatory: true, isAiGeneratable: false, officialSource: 'https://npc.gov.ng', estimatedDays: 35, urgencyLevel: 'critical' },
      { id: 'NG-EE-004', category: 'Academic', name: 'NYSC Discharge / Exemption Certificate', description: 'National Youth Service Corps certificate for Nigerian university graduates.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'high', notes: 'Exemption applies if graduated at 30+ or if diploma (not degree).' },
      { id: 'NG-EE-005', category: 'Identity', name: 'Valid Nigerian Passport', description: 'Valid with 12+ months validity.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical' },
      { id: 'NG-EE-006', category: 'Financial', name: 'Proof of Settlement Funds', description: 'CAD 13,757+ for single applicant.', isMandatory: true, isAiGeneratable: false, estimatedDays: 3, urgencyLevel: 'high' },
      { id: 'NG-EE-007', category: 'Employment', name: 'Reference Letters from Past Employers', description: 'Confirm NOC code, hours, salary, and responsibilities.', isMandatory: true, isAiGeneratable: false, estimatedDays: 14, urgencyLevel: 'high' },
      { id: 'NG-EE-008', category: 'Medical', name: 'Immigration Medical Exam', description: 'From IRCC-approved panel physician.', isMandatory: true, isAiGeneratable: false, estimatedDays: 14, urgencyLevel: 'high' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // ══════════════════════════════════════════════════════════
  //  8. ZIMBABWE → UK — Skilled Worker Visa
  // ══════════════════════════════════════════════════════════
  {
    routeKey: 'ZW-GB-skilled_worker',
    originCountry: 'Zimbabwe',
    destinationCountry: 'United Kingdom',
    visaType: 'Skilled Worker Visa',
    displayName: 'Zimbabwe → UK Skilled Worker Visa',
    summary:
      'UK Skilled Worker visa for Zimbabwean nationals. High demand in healthcare (nursing, doctors). Police clearance from ZRP must be done in person or via registered legal representative. English proficiency from Zimbabwean institutions is generally accepted.',
    processingTime: { minDays: 15, maxDays: 45, typicalDays: 21, source: 'https://www.gov.uk/skilled-worker-visa' },
    financialThresholds: { amount: 1270, currency: 'GBP', description: 'Maintenance funds unless exempt', asOf: '2025-01' },
    knownGotchas: [
      'ZRP police clearance: must be applied for in person at Criminal Records Office Harare or through a registered representative. Allow 2–3 weeks.',
      'Healthcare workers: NMC PIN verification or GMC registration required in addition to visa.',
      'Bank statements from Zimbabwean banks must typically be accompanied by a bank letter due to informal banking patterns.',
      'If degree is from University of Zimbabwe or other ZIM institutions, UK ENIC may be required.',
    ],
    criticalPath: [
      'Secure CoS from UK licensed employer',
      'ZRP police clearance (in person or via rep)',
      'English language proof (ZIM degrees often accepted)',
      'Gather financial evidence with bank letter',
      'Submit online + VFS Zimbabwe biometrics',
    ],
    officialSources: [
      { name: 'Gov.uk Skilled Worker', url: 'https://www.gov.uk/skilled-worker-visa', lastChecked: '2025-02-01', contentHash: '' },
      { name: 'VFS Zimbabwe', url: 'https://visa.vfsglobal.com/zwe/en/gbr', lastChecked: '2025-02-01', contentHash: '' },
    ],
    requirements: [
      { id: 'ZW-SW-001', category: 'Sponsorship', name: 'Certificate of Sponsorship (CoS)', description: 'From licensed UK employer.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'ZW-SW-002', category: 'Identity', name: 'Valid Zimbabwean Passport', description: 'Valid passport with sufficient validity.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical' },
      { id: 'ZW-SW-003', category: 'Police Clearance', name: 'ZRP Police Clearance', description: 'Zimbabwe Republic Police clearance from Criminal Records Office.', isMandatory: true, isAiGeneratable: false, estimatedDays: 21, urgencyLevel: 'critical', notes: 'Apply in person at Harare CRO or via registered legal representative.' },
      { id: 'ZW-SW-004', category: 'English Language', name: 'English Language Proof', description: 'Zimbabwean degrees in English often accepted. Otherwise IELTS B1 per component.', isMandatory: true, isAiGeneratable: false, estimatedDays: 21, urgencyLevel: 'high', notes: 'Confirm with UKVI if Zimbabwean degree qualifies as exempt — it usually does.' },
      { id: 'ZW-SW-005', category: 'Financial', name: 'Bank Statements + Bank Letter', description: '3-month statements with accompanying letter from bank confirming account details.', isMandatory: true, isAiGeneratable: false, estimatedDays: 5, urgencyLevel: 'high' },
      { id: 'ZW-SW-006', category: 'Employment', name: 'Employment Contract / Offer Letter', description: 'Signed UK employment offer confirming role, salary, start date.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'high' },
      { id: 'ZW-SW-007', category: 'Personal Statement', name: 'Statement of Purpose', description: 'Explains background, intent, and suitability for the role.', isMandatory: false, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'normal' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // ══════════════════════════════════════════════════════════
  //  9. ETHIOPIA → USA — F-1 Student Visa
  // ══════════════════════════════════════════════════════════
  {
    routeKey: 'ET-US-f1_student',
    originCountry: 'Ethiopia',
    destinationCountry: 'United States',
    visaType: 'F-1 Student Visa',
    displayName: 'Ethiopia → USA F-1 Student Visa',
    summary:
      'US F-1 student visa for Ethiopian nationals. Requires SEVIS registration and Form I-20 from a US SEVP-certified school. Interview at US Embassy Addis Ababa mandatory. Proof of non-immigrant intent is critical.',
    processingTime: { minDays: 30, maxDays: 120, typicalDays: 45, source: 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html' },
    financialThresholds: { amount: 25000, currency: 'USD', description: 'Approximate first-year cost (tuition + living). Must show full funding for duration.', asOf: '2025-01' },
    knownGotchas: [
      'You must demonstrate non-immigrant intent convincingly — show strong ties to Ethiopia (family, property, job offer after graduation).',
      'SEVIS fee (I-901) of USD 350 must be paid before the visa interview.',
      'Ethiopian bank statements may require apostille or notarisation for the interview.',
      'DS-160 form must be carefully completed — inconsistencies cause immediate refusal.',
      'Wait times for Embassy Addis Ababa can be long — book appointment immediately after receiving I-20.',
    ],
    criticalPath: [
      'Receive I-20 from SEVP-certified US school',
      'Pay SEVIS I-901 fee (USD 350)',
      'Complete DS-160 online application',
      'Pay MRV visa fee',
      'Schedule interview at US Embassy Addis Ababa',
      'Attend interview with all documents',
    ],
    officialSources: [
      { name: 'State Dept F-1 Visa', url: 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html', lastChecked: '2025-02-01', contentHash: '' },
      { name: 'SEVIS I-901 Fee', url: 'https://www.fmjfee.com', lastChecked: '2025-02-01', contentHash: '' },
      { name: 'Ethiopia Embassy Appointments', url: 'https://et.usembassy.gov/visas/', lastChecked: '2025-02-01', contentHash: '' },
    ],
    requirements: [
      { id: 'ET-F1-001', category: 'Sponsorship', name: 'Form I-20 from SEVP-Certified School', description: 'Certificate of Eligibility for Nonimmigrant Student Status.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'ET-F1-002', category: 'Financial', name: 'SEVIS I-901 Fee Payment Receipt', description: 'USD 350 fee paid at fmjfee.com. Must be paid before interview.', isMandatory: true, isAiGeneratable: false, officialSource: 'https://www.fmjfee.com', estimatedDays: 1, urgencyLevel: 'critical' },
      { id: 'ET-F1-003', category: 'Application', name: 'DS-160 Confirmation Page', description: 'Completed online nonimmigrant visa application.', isMandatory: true, isAiGeneratable: false, estimatedDays: 1, urgencyLevel: 'critical' },
      { id: 'ET-F1-004', category: 'Identity', name: 'Valid Ethiopian Passport', description: 'Valid passport with 6+ months validity.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical' },
      { id: 'ET-F1-005', category: 'Financial', name: 'Proof of Sufficient Funds', description: 'Bank statements showing ability to fund full course. Sponsor letters + bank statements if family funded.', isMandatory: true, isAiGeneratable: false, estimatedDays: 7, urgencyLevel: 'critical', notes: 'Must cover tuition + living for full programme duration, not just year 1.' },
      { id: 'ET-F1-006', category: 'Academic', name: 'Academic Records & Transcripts', description: 'All prior academic records.', isMandatory: true, isAiGeneratable: false, estimatedDays: 7, urgencyLevel: 'high' },
      { id: 'ET-F1-007', category: 'English Language', name: 'TOEFL / IELTS Score', description: 'English language test results meeting school minimum.', isMandatory: false, isAiGeneratable: false, estimatedDays: 21, urgencyLevel: 'high', notes: 'Some Ethiopian schools are bilingual — school I-20 notes if English test waived.' },
      { id: 'ET-F1-008', category: 'Ties to Home', name: 'Ties to Home Country Evidence', description: 'Property deed, family photos, employer letter offering job on return — demonstrate non-immigrant intent.', isMandatory: false, isAiGeneratable: true, estimatedDays: 7, urgencyLevel: 'critical', notes: 'The interview question is always: why will you return? Have a strong answer and supporting docs.' },
      { id: 'ET-F1-009', category: 'Financial', name: 'Sponsorship / Financial Justification Letter', description: 'Letter from sponsor confirming financial support.', isMandatory: false, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'high', notes: 'Doc Studio can generate sponsor letter and financial justification letter.' },
      { id: 'ET-F1-010', category: 'Photos', name: 'Passport Photos', description: '2 photos meeting US visa photo requirements.', isMandatory: true, isAiGeneratable: false, estimatedDays: 1, urgencyLevel: 'normal' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // ══════════════════════════════════════════════════════════
  //  10. SOUTH AFRICA → SCHENGEN — Tourist/Visit Visa
  // ══════════════════════════════════════════════════════════
  {
    routeKey: 'ZA-SCHENGEN-tourist',
    originCountry: 'South Africa',
    destinationCountry: 'Schengen Area',
    visaType: 'Schengen Tourist / Short-Stay Visa',
    displayName: 'South Africa → Schengen Tourist Visa',
    summary:
      'Schengen short-stay visa (Type C) for South African nationals. Apply at the embassy/consulate of the country where you will spend most time. 90 days within any 180-day period. Processing time varies per country: Germany/Netherlands fastest, France/Italy can be slow.',
    processingTime: { minDays: 15, maxDays: 45, typicalDays: 21, source: 'https://www.schengenvisainfo.com/south-africa/' },
    financialThresholds: { amount: 50, currency: 'EUR', description: 'Approximately EUR 50 per day of stay typically expected. Show sufficient funds for entire trip.', asOf: '2025-01' },
    knownGotchas: [
      'Apply at the embassy of the country you will spend most nights in. If transiting only, apply at first-entry country.',
      'Travel insurance mandatory: minimum EUR 30,000 coverage, valid for all Schengen countries.',
      'Hotel bookings must be firm for full duration. Refundable is fine but must be confirmed.',
      'Bank statements: last 3 months. Stamped by bank. Average balance should show EUR 50+/day.',
      'Invitation letter from host in Schengen: must be officially certified (apostilled in some countries).',
      'Flight bookings: do NOT buy non-refundable flights before visa is approved. Use flexible booking.',
    ],
    criticalPath: [
      'Determine which embassy to apply at (most nights rule)',
      'Book travel insurance (EUR 30,000+ coverage)',
      'Make firm hotel/accommodation bookings',
      'Prepare bank statements (3 months, stamped)',
      'Complete application form + photos',
      'Submit at embassy VFS/TLS Contact',
    ],
    officialSources: [
      { name: 'Schengen Visa Info', url: 'https://www.schengenvisainfo.com', lastChecked: '2025-02-01', contentHash: '' },
      { name: 'EU Official Schengen Rules', url: 'https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa_en', lastChecked: '2025-02-01', contentHash: '' },
    ],
    requirements: [
      { id: 'ZA-SCH-001', category: 'Application', name: 'Completed Schengen Visa Application Form', description: 'Country-specific application form, fully completed and signed.', isMandatory: true, isAiGeneratable: false, estimatedDays: 1, urgencyLevel: 'critical' },
      { id: 'ZA-SCH-002', category: 'Identity', name: 'Valid SA Passport + Copy', description: 'Passport valid 3+ months beyond intended return date. 2 blank visa pages required.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'ZA-SCH-003', category: 'Insurance', name: 'Travel Insurance (EUR 30,000 min)', description: 'Valid for all Schengen countries for entire trip duration. Must show EUR 30,000 coverage.', isMandatory: true, isAiGeneratable: false, estimatedDays: 1, urgencyLevel: 'critical' },
      { id: 'ZA-SCH-004', category: 'Accommodation', name: 'Hotel / Accommodation Bookings', description: 'Confirmed bookings for all nights of stay. Can be refundable/flexible.', isMandatory: true, isAiGeneratable: false, estimatedDays: 1, urgencyLevel: 'high' },
      { id: 'ZA-SCH-005', category: 'Financial', name: 'Bank Statements (3 months, stamped)', description: 'Last 3 months stamped by bank. Show adequate funds (EUR 50+/day as guide).', isMandatory: true, isAiGeneratable: false, estimatedDays: 3, urgencyLevel: 'high' },
      { id: 'ZA-SCH-006', category: 'Travel', name: 'Flight Itinerary (Flexible Booking)', description: 'Round-trip flight reservation. Do NOT buy non-refundable tickets before visa approval.', isMandatory: true, isAiGeneratable: false, estimatedDays: 1, urgencyLevel: 'high', notes: 'Use dummy ticket services or flexible bookings from airlines.' },
      { id: 'ZA-SCH-007', category: 'Employment', name: 'Employment/Business Proof', description: 'Employer letter confirming leave approval + salary. Or business registration + financial statements.', isMandatory: true, isAiGeneratable: false, estimatedDays: 3, urgencyLevel: 'high' },
      { id: 'ZA-SCH-008', category: 'Personal Statement', name: 'Purpose of Visit Letter', description: 'Brief letter explaining the purpose, itinerary, and return reasons.', isMandatory: false, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'normal', notes: 'Doc Studio can generate this. Keep it concise and factual.' },
      { id: 'ZA-SCH-009', category: 'Ties to Home', name: 'Ties to Home Country Evidence', description: 'Property deed, employer letter, family photos — demonstrates you will return.', isMandatory: false, isAiGeneratable: true, estimatedDays: 3, urgencyLevel: 'normal', notes: 'Doc Studio can generate the ties-to-home-country letter.' },
      { id: 'ZA-SCH-010', category: 'Photos', name: 'Schengen-format Passport Photos (2x)', description: '35x45mm colour photos on white background, taken within last 6 months.', isMandatory: true, isAiGeneratable: false, estimatedDays: 1, urgencyLevel: 'normal' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // Routes 11-20: abbreviated but production-grade
  // ══════════════════════════════════════════════════════════
  //  11. NIGERIA → SCHENGEN — Tourist Visa
  // ══════════════════════════════════════════════════════════
  {
    routeKey: 'NG-SCHENGEN-tourist',
    originCountry: 'Nigeria',
    destinationCountry: 'Schengen Area',
    visaType: 'Schengen Tourist / Short-Stay Visa',
    displayName: 'Nigeria → Schengen Tourist Visa',
    summary: 'Schengen Type C visa for Nigerian nationals. One of the highest refusal rates in Africa (~40%). Strong financial evidence, strong ties to Nigeria, and clear purpose are essential. Italy/Spain frequently requested destinations.',
    processingTime: { minDays: 15, maxDays: 60, typicalDays: 30, source: 'https://www.schengenvisainfo.com/nigeria/' },
    financialThresholds: { amount: 50, currency: 'EUR', description: 'EUR 50+ per day. Expect scrutiny on source of funds.', asOf: '2025-01' },
    knownGotchas: [
      'Nigeria has one of the highest Schengen refusal rates — submit an extremely well-organised, detailed package.',
      'Bank statements must be stamped by the bank on each page.',
      'Self-employed Nigerians must provide CAC registration, 12-month bank statements, and tax clearance.',
      'Invitation letters from Europe must often be notarised.',
    ],
    criticalPath: ['Identify correct embassy (most nights rule)', 'Travel insurance EUR 30k+', 'Stamped 3-month bank statements', 'Hotel bookings + itinerary', 'Submit at VFS Lagos/Abuja'],
    officialSources: [{ name: 'Schengen Visa Info Nigeria', url: 'https://www.schengenvisainfo.com/nigeria/', lastChecked: '2025-02-01', contentHash: '' }],
    requirements: [
      { id: 'NG-SCH-001', category: 'Identity', name: 'Valid Nigerian Passport + Copy', description: 'Valid with 3+ months beyond return date. 2 blank pages.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'NG-SCH-002', category: 'Insurance', name: 'Travel Insurance (EUR 30,000)', description: 'Coverage for full trip, all Schengen countries.', isMandatory: true, isAiGeneratable: false, estimatedDays: 1, urgencyLevel: 'critical' },
      { id: 'NG-SCH-003', category: 'Financial', name: 'Bank Statements (3 months, stamped per page)', description: 'Stamped by bank on each page. Clear and consistent transaction history.', isMandatory: true, isAiGeneratable: false, estimatedDays: 3, urgencyLevel: 'critical', notes: 'Large unexplained deposits are an immediate red flag.' },
      { id: 'NG-SCH-004', category: 'Employment', name: 'Employer Letter + Leave Approval', description: 'On letterhead confirming employment, salary, and approved leave.', isMandatory: true, isAiGeneratable: false, estimatedDays: 3, urgencyLevel: 'high' },
      { id: 'NG-SCH-005', category: 'Accommodation', name: 'Hotel Bookings (confirmed)', description: 'Confirmed for full duration of stay.', isMandatory: true, isAiGeneratable: false, estimatedDays: 1, urgencyLevel: 'high' },
      { id: 'NG-SCH-006', category: 'Personal Statement', name: 'Purpose of Visit Letter', description: 'Clear letter of intent for the visit.', isMandatory: false, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'normal' },
      { id: 'NG-SCH-007', category: 'Ties to Home', name: 'Ties to Nigeria Evidence', description: 'Property ownership, family evidence, employment — non-immigrant intent.', isMandatory: false, isAiGeneratable: true, estimatedDays: 3, urgencyLevel: 'high', notes: 'Critical given high refusal rate. Include everything.' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // 12 — Ghana → UK Tourist
  {
    routeKey: 'GH-GB-visitor',
    originCountry: 'Ghana',
    destinationCountry: 'United Kingdom',
    visaType: 'Standard Visitor Visa',
    displayName: 'Ghana → UK Standard Visitor Visa',
    summary: 'UK Standard Visitor visa for Ghanaians. Valid for 6 months, multiple entries. High scrutiny on immigration history and financial ties. Online application + biometrics at VFS Accra.',
    processingTime: { minDays: 15, maxDays: 30, typicalDays: 21, source: 'https://www.gov.uk/standard-visitor' },
    financialThresholds: { amount: 100, currency: 'GBP', description: 'GBP 100+ per day as a guide. No hard threshold but substantial evidence needed.', asOf: '2025-01' },
    knownGotchas: ['Strong ties to Ghana essential — property, employment, dependants.', 'UK does NOT require hotel bookings in advance but having an itinerary helps.', 'If visiting family, invitation letter from UK host is important.'],
    criticalPath: ['Apply online on gov.uk', 'Pay visa fee', 'Biometrics at VFS Accra', 'Submit supporting docs'],
    officialSources: [{ name: 'Gov.uk Standard Visitor', url: 'https://www.gov.uk/standard-visitor', lastChecked: '2025-02-01', contentHash: '' }],
    requirements: [
      { id: 'GH-UK-V-001', category: 'Identity', name: 'Valid Ghanaian Passport', description: 'Valid with sufficient duration.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'GH-UK-V-002', category: 'Financial', name: 'Bank Statements (6 months)', description: '6-month bank history showing financial stability.', isMandatory: true, isAiGeneratable: false, estimatedDays: 3, urgencyLevel: 'critical' },
      { id: 'GH-UK-V-003', category: 'Employment', name: 'Employer Letter or Business Evidence', description: 'Employment letter confirming leave and salary, or business registration.', isMandatory: true, isAiGeneratable: false, estimatedDays: 3, urgencyLevel: 'high' },
      { id: 'GH-UK-V-004', category: 'Personal Statement', name: 'Purpose of Visit Letter', description: 'Clear statement of travel purpose and return plans.', isMandatory: false, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'high' },
      { id: 'GH-UK-V-005', category: 'Ties to Home', name: 'Ties to Ghana Evidence', description: 'Property, family, employment evidence.', isMandatory: false, isAiGeneratable: true, estimatedDays: 3, urgencyLevel: 'high' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // 13 — Cameroon → Canada Study Permit
  {
    routeKey: 'CM-CA-study_permit',
    originCountry: 'Cameroon',
    destinationCountry: 'Canada',
    visaType: 'Study Permit',
    displayName: 'Cameroon → Canada Study Permit',
    summary: 'Canadian Study Permit for Cameroonian nationals. SDS NOT available for Cameroon. Regular stream only. Biometrics at VFS Yaoundé. Both French and English programs available. High refusal risk without very strong financial evidence.',
    processingTime: { minDays: 60, maxDays: 120, typicalDays: 90, source: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html' },
    financialThresholds: { amount: 20000, currency: 'CAD', description: 'First year tuition + CAD 10,000 living minimum', asOf: '2025-01' },
    knownGotchas: ['SDS not available — use regular stream only.', 'FCFA banking records can be difficult to translate — use certified financial translator.', 'Study plan is critical — must address why Canada and not local alternatives.'],
    criticalPath: ['LoA from DLI', 'Strong 12-month financial evidence', 'Study plan + ties to home country letter', 'Apply online IRCC', 'VFS Yaoundé biometrics'],
    officialSources: [{ name: 'IRCC Study Permit', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html', lastChecked: '2025-02-01', contentHash: '' }],
    requirements: [
      { id: 'CM-CA-SP-001', category: 'Sponsorship', name: 'Letter of Acceptance (DLI)', description: 'From a Designated Learning Institution.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'CM-CA-SP-002', category: 'Financial', name: 'Bank Statements (12 months)', description: 'Comprehensive financial evidence.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical' },
      { id: 'CM-CA-SP-003', category: 'Personal Statement', name: 'Study Plan', description: 'Why Canada, this program, and return plans.', isMandatory: true, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'critical' },
      { id: 'CM-CA-SP-004', category: 'Ties to Home', name: 'Ties to Cameroon Letter', description: 'Evidence of intent to return after studies.', isMandatory: false, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'high' },
      { id: 'CM-CA-SP-005', category: 'Identity', name: 'Valid Cameroonian Passport', description: 'Valid for duration of stay.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // 14 — Kenya → UK Skilled Worker
  {
    routeKey: 'KE-GB-skilled_worker',
    originCountry: 'Kenya',
    destinationCountry: 'United Kingdom',
    visaType: 'Skilled Worker Visa',
    displayName: 'Kenya → UK Skilled Worker Visa',
    summary: 'UK Skilled Worker visa for Kenyan nationals. High demand in healthcare (NHS). Kenya Criminal Records Bureau (CRB) clearance required. Apostille from Ministry of Foreign Affairs needed.',
    processingTime: { minDays: 15, maxDays: 45, typicalDays: 21, source: 'https://www.gov.uk/skilled-worker-visa' },
    financialThresholds: { amount: 1270, currency: 'GBP', description: 'Maintenance funds if not exempt', asOf: '2025-01' },
    knownGotchas: ['Kenya CRB check: apply online at crb.go.ke. Allow 14–21 days. Apostille from MFA takes 5–7 days.', 'Healthcare workers must have NMC letter of eligibility before applying.'],
    criticalPath: ['CoS from UK employer', 'Kenya CRB clearance + apostille', 'English language proof', 'Financial evidence', 'VFS Kenya biometrics'],
    officialSources: [{ name: 'Gov.uk Skilled Worker', url: 'https://www.gov.uk/skilled-worker-visa', lastChecked: '2025-02-01', contentHash: '' }, { name: 'Kenya CRB', url: 'https://crb.go.ke', lastChecked: '2025-02-01', contentHash: '' }],
    requirements: [
      { id: 'KE-SW-001', category: 'Sponsorship', name: 'Certificate of Sponsorship (CoS)', description: 'From licensed UK employer.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'KE-SW-002', category: 'Police Clearance', name: 'Kenya CRB Certificate + Apostille', description: 'Online CRB application + Ministry of Foreign Affairs apostille.', isMandatory: true, isAiGeneratable: false, officialSource: 'https://crb.go.ke', estimatedDays: 21, urgencyLevel: 'critical' },
      { id: 'KE-SW-003', category: 'Identity', name: 'Valid Kenyan Passport', description: 'Valid passport.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical' },
      { id: 'KE-SW-004', category: 'English Language', name: 'English Language Proof', description: 'Kenyan degrees in English typically accepted.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'high' },
      { id: 'KE-SW-005', category: 'Financial', name: 'Bank Statements (3 months)', description: 'Showing GBP 1,270+ unless exempt.', isMandatory: true, isAiGeneratable: false, estimatedDays: 3, urgencyLevel: 'high' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // 15 — South Africa → Australia Skilled (subclass 189/190)
  {
    routeKey: 'ZA-AU-skilled_independent',
    originCountry: 'South Africa',
    destinationCountry: 'Australia',
    visaType: 'Skilled Independent Visa (subclass 189/190)',
    displayName: 'South Africa → Australia Skilled Migration',
    summary: 'Australian skilled migration (permanent) for South African nationals via SkillSelect EOI. Points-tested. Minimum 65 points required; competitive score 80+. VETASSESS or relevant skills assessment body required first. English minimum Competent (IELTS 6.0 each).',
    processingTime: { minDays: 180, maxDays: 730, typicalDays: 365, source: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189' },
    financialThresholds: null,
    knownGotchas: ['Skills assessment must be BEFORE lodging EOI. VETASSESS takes 8–14 weeks.', 'IELTS each band must be 6.0+ (Competent English). Proficient (7.0) adds 10 points.', 'SAPS clearance needed, apostilled. Allow 4 weeks.', '190 state nomination can boost score — apply to multiple states.'],
    criticalPath: ['Skills assessment (VETASSESS/ACS/ANMAC etc) — 8–14 weeks', 'IELTS competent English', 'Lodge EOI on SkillSelect', 'Receive ITA (state 190 or federal 189)', 'Apply within 60 days of ITA', 'Medical + SAPS + biometrics'],
    officialSources: [{ name: 'DHA Skilled Independent 189', url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189', lastChecked: '2025-02-01', contentHash: '' }, { name: 'SkillSelect', url: 'https://skillselect.gov.au', lastChecked: '2025-02-01', contentHash: '' }],
    requirements: [
      { id: 'ZA-AU-SK-001', category: 'Credentials', name: 'Skills Assessment', description: 'From relevant assessing authority (VETASSESS, ACS, ANMAC, Engineers Australia etc).', isMandatory: true, isAiGeneratable: false, estimatedDays: 70, urgencyLevel: 'critical' },
      { id: 'ZA-AU-SK-002', category: 'English Language', name: 'IELTS 6.0 each band (Competent English)', description: '6.0 minimum in each of 4 bands. 7.0 earns extra points.', isMandatory: true, isAiGeneratable: false, estimatedDays: 21, urgencyLevel: 'critical' },
      { id: 'ZA-AU-SK-003', category: 'Police Clearance', name: 'SAPS Police Clearance + Apostille', description: 'South African clearance apostilled by DIRCO.', isMandatory: true, isAiGeneratable: false, estimatedDays: 25, urgencyLevel: 'critical' },
      { id: 'ZA-AU-SK-004', category: 'Identity', name: 'Valid SA Passport', description: 'Valid with at least 12 months validity.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical' },
      { id: 'ZA-AU-SK-005', category: 'Medical', name: 'Immigration Medical Exam (HAP)', description: 'Through DIBP-approved Bupa Medical or equivalent.', isMandatory: true, isAiGeneratable: false, estimatedDays: 14, urgencyLevel: 'high' },
      { id: 'ZA-AU-SK-006', category: 'Employment', name: 'Employment References (ANZSCO)', description: 'Letters matching ANZSCO code duties.', isMandatory: true, isAiGeneratable: false, estimatedDays: 14, urgencyLevel: 'high' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // 16 — Nigeria → USA F-1
  {
    routeKey: 'NG-US-f1_student',
    originCountry: 'Nigeria',
    destinationCountry: 'United States',
    visaType: 'F-1 Student Visa',
    displayName: 'Nigeria → USA F-1 Student Visa',
    summary: 'US F-1 for Nigerian nationals. Embassy Lagos and Abuja. High interview refusal rate — demonstrate non-immigrant intent strongly. SEVIS fee required. Family ties documentation critical.',
    processingTime: { minDays: 30, maxDays: 120, typicalDays: 60, source: 'https://ng.usembassy.gov/visas/nonimmigrant-visas/student-visas/' },
    financialThresholds: { amount: 25000, currency: 'USD', description: 'Show full programme funding', asOf: '2025-01' },
    knownGotchas: ['Interview is non-waivable for most Nigerian applicants.', 'Demonstrate strong ties: family, property, job offer post-graduation.', 'SEVIS I-901 USD 350 must be paid before interview date.', 'DS-160 must be accurate — any inconsistency = refusal.'],
    criticalPath: ['I-20 from SEVP school', 'Pay SEVIS I-901 fee', 'DS-160 online', 'Embassy interview Lagos/Abuja'],
    officialSources: [{ name: 'US Embassy Nigeria', url: 'https://ng.usembassy.gov/visas/', lastChecked: '2025-02-01', contentHash: '' }],
    requirements: [
      { id: 'NG-F1-001', category: 'Sponsorship', name: 'Form I-20', description: 'From SEVP-certified school.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'NG-F1-002', category: 'Financial', name: 'SEVIS Fee Receipt', description: 'USD 350 paid at fmjfee.com.', isMandatory: true, isAiGeneratable: false, estimatedDays: 1, urgencyLevel: 'critical' },
      { id: 'NG-F1-003', category: 'Application', name: 'DS-160 Confirmation', description: 'Completed nonimmigrant visa application.', isMandatory: true, isAiGeneratable: false, estimatedDays: 1, urgencyLevel: 'critical' },
      { id: 'NG-F1-004', category: 'Identity', name: 'Valid Nigerian Passport', description: 'Valid 6+ months.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical' },
      { id: 'NG-F1-005', category: 'Financial', name: 'Proof of Sufficient Funds', description: 'Full programme funding evidence.', isMandatory: true, isAiGeneratable: false, estimatedDays: 7, urgencyLevel: 'critical' },
      { id: 'NG-F1-006', category: 'Ties to Home', name: 'Non-Immigrant Intent Evidence', description: 'Property, family, job offers for return. Critical for interview.', isMandatory: false, isAiGeneratable: true, estimatedDays: 7, urgencyLevel: 'critical' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // 17 — Tanzania → UK Visitor
  {
    routeKey: 'TZ-GB-visitor',
    originCountry: 'Tanzania',
    destinationCountry: 'United Kingdom',
    visaType: 'Standard Visitor Visa',
    displayName: 'Tanzania → UK Standard Visitor Visa',
    summary: 'UK Standard Visitor for Tanzanian nationals. VFS Dar es Salaam. Strong financial and employment ties required. Moderate refusal rates.',
    processingTime: { minDays: 15, maxDays: 30, typicalDays: 21, source: 'https://www.gov.uk/standard-visitor' },
    financialThresholds: { amount: 100, currency: 'GBP', description: 'Approx GBP 100+/day. No hard rule but show adequate funds.', asOf: '2025-01' },
    knownGotchas: ['VFS Dar es Salaam — biometrics appointment fills up fast.', 'Bank letters from Tanzanian banks in English strongly recommended.'],
    criticalPath: ['Online application gov.uk', 'Bank statements + employer letter', 'VFS Dar es Salaam biometrics'],
    officialSources: [{ name: 'Gov.uk Standard Visitor', url: 'https://www.gov.uk/standard-visitor', lastChecked: '2025-02-01', contentHash: '' }],
    requirements: [
      { id: 'TZ-UK-V-001', category: 'Identity', name: 'Valid Tanzanian Passport', description: 'Valid with sufficient validity.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'TZ-UK-V-002', category: 'Financial', name: 'Bank Statements (6 months)', description: 'With bank letter in English.', isMandatory: true, isAiGeneratable: false, estimatedDays: 3, urgencyLevel: 'critical' },
      { id: 'TZ-UK-V-003', category: 'Employment', name: 'Employer Letter', description: 'Leave approval, salary, job title.', isMandatory: true, isAiGeneratable: false, estimatedDays: 3, urgencyLevel: 'high' },
      { id: 'TZ-UK-V-004', category: 'Personal Statement', name: 'Purpose of Visit Letter', description: 'Clear purpose, itinerary, return plans.', isMandatory: false, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'normal' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // 18 — South Africa → UAE Residence (Employment)
  {
    routeKey: 'ZA-AE-employment_residence',
    originCountry: 'South Africa',
    destinationCountry: 'United Arab Emirates',
    visaType: 'Employment Residency Visa',
    displayName: 'South Africa → UAE Employment Visa',
    summary: 'UAE employment residency for South African nationals. Employer must be UAE-registered and processes entry permit, medical, and Emirates ID on applicant\'s behalf. No language requirement. Fast processing (2–4 weeks) if employer cooperates.',
    processingTime: { minDays: 14, maxDays: 30, typicalDays: 21, source: 'https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visa' },
    financialThresholds: null,
    knownGotchas: ['Employer drives the process — your role is mainly to provide documents.', 'Medical fitness test in UAE is mandatory before Emirates ID.', 'SAPS clearance is often not required for UAE but some employers request it.', 'Degrees must be attested: DIRCO → UAE Embassy Pretoria.'],
    criticalPath: ['UAE employer processes Entry Permit', 'Travel to UAE on Entry Permit', 'Medical fitness test in UAE', 'Emirates ID biometrics', 'Residency visa stamped in passport'],
    officialSources: [{ name: 'UAE Residency Info', url: 'https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visa', lastChecked: '2025-02-01', contentHash: '' }],
    requirements: [
      { id: 'ZA-AE-E-001', category: 'Identity', name: 'Valid SA Passport', description: '6+ months validity.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'ZA-AE-E-002', category: 'Employment', name: 'Employment Contract (UAE employer)', description: 'Signed and attested employment contract.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'ZA-AE-E-003', category: 'Qualifications', name: 'Degree Certificate (DIRCO Attested + UAE Embassy Attested)', description: 'Attested by DIRCO then UAE Embassy in Pretoria.', isMandatory: true, isAiGeneratable: false, estimatedDays: 21, urgencyLevel: 'high', notes: 'DIRCO apostille takes 7–10 working days. UAE Embassy attestation 3–5 days.' },
      { id: 'ZA-AE-E-004', category: 'Medical', name: 'Medical Fitness Test (in UAE)', description: 'Done in UAE after arrival on entry permit. Includes blood tests + X-ray.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'high', notes: 'Handled in UAE after arrival.' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // 19 — Uganda → UK Student Visa
  {
    routeKey: 'UG-GB-student',
    originCountry: 'Uganda',
    destinationCountry: 'United Kingdom',
    visaType: 'Student Visa',
    displayName: 'Uganda → UK Student Visa',
    summary: 'UK Student visa for Ugandan nationals. VFS Kampala. CAS from licensed university required. IELTS B2 typical requirement. Financial evidence must cover full course duration.',
    processingTime: { minDays: 15, maxDays: 30, typicalDays: 21, source: 'https://www.gov.uk/student-visa' },
    financialThresholds: { amount: 1334, currency: 'GBP', description: 'Per month for London courses (up to 9 months)', asOf: '2025-01' },
    knownGotchas: ['Maintenance funds must be held for 28 consecutive days ending ≤31 days before application.', 'Ugandan banks: request statement with bank stamp and officer signature on each page.', 'ATAS may apply for sensitive postgraduate subjects.'],
    criticalPath: ['CAS from UK university', 'Accumulate 28-day maintenance funds', 'English test if required', 'Online application + VFS Kampala biometrics'],
    officialSources: [{ name: 'Gov.uk Student Visa', url: 'https://www.gov.uk/student-visa', lastChecked: '2025-02-01', contentHash: '' }],
    requirements: [
      { id: 'UG-ST-001', category: 'Sponsorship', name: 'CAS Reference Number', description: 'From UKVI-licensed institution.', isMandatory: true, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical' },
      { id: 'UG-ST-002', category: 'Financial', name: 'Bank Statements (28-day window)', description: 'Covering full course maintenance requirement, held 28 days.', isMandatory: true, isAiGeneratable: false, estimatedDays: 28, urgencyLevel: 'critical' },
      { id: 'UG-ST-003', category: 'Identity', name: 'Valid Ugandan Passport', description: '6+ months validity.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical' },
      { id: 'UG-ST-004', category: 'English Language', name: 'IELTS B2 or equivalent', description: 'Meeting institution and UKVI requirements.', isMandatory: true, isAiGeneratable: false, estimatedDays: 21, urgencyLevel: 'high' },
      { id: 'UG-ST-005', category: 'Personal Statement', name: 'Study Motivation Letter', description: 'Explains study goals and return plans.', isMandatory: false, isAiGeneratable: true, estimatedDays: 1, urgencyLevel: 'normal' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

  // 20 — South Africa → New Zealand Skilled Migrant
  {
    routeKey: 'ZA-NZ-skilled_migrant',
    originCountry: 'South Africa',
    destinationCountry: 'New Zealand',
    visaType: 'Skilled Migrant Category Resident Visa',
    displayName: 'South Africa → New Zealand Skilled Migrant',
    summary: 'New Zealand Skilled Migrant resident visa for South Africans. Points-based EOI. Minimum 160 points. Job offer in NZ adds 50–60 points. IELTS minimum 6.5 average (no band below 6.0). SAPS clearance required. NZ has positive attitude toward SA skilled workers.',
    processingTime: { minDays: 180, maxDays: 540, typicalDays: 365, source: 'https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/visa-factsheet/skilled-migrant-category-resident-visa' },
    financialThresholds: null,
    knownGotchas: ['EOI must reach 160 points to be selected. Job offer from NZ employer is the fastest way to reach threshold.', 'IELTS 6.5 overall AND no band below 6.0.', 'Health certificate and SAPS clearance required.', 'Skills shortage list changes — check current INZ occupation list before applying.'],
    criticalPath: ['Check INZ occupation list', 'Secure NZ job offer if possible', 'IELTS 6.5+ no band below 6.0', 'Submit EOI on SkillFinder', 'Receive ITA', 'Apply for resident visa', 'SAPS + medical'],
    officialSources: [{ name: 'INZ Skilled Migrant', url: 'https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/visa-factsheet/skilled-migrant-category-resident-visa', lastChecked: '2025-02-01', contentHash: '' }],
    requirements: [
      { id: 'ZA-NZ-SM-001', category: 'English Language', name: 'IELTS (6.5 avg, no band < 6.0)', description: 'Overall 6.5 with no individual band below 6.0.', isMandatory: true, isAiGeneratable: false, estimatedDays: 21, urgencyLevel: 'critical' },
      { id: 'ZA-NZ-SM-002', category: 'Police Clearance', name: 'SAPS Police Clearance + Apostille', description: 'South African clearance apostilled by DIRCO.', isMandatory: true, isAiGeneratable: false, estimatedDays: 25, urgencyLevel: 'critical' },
      { id: 'ZA-NZ-SM-003', category: 'Identity', name: 'Valid SA Passport', description: '12+ months validity.', isMandatory: true, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'critical' },
      { id: 'ZA-NZ-SM-004', category: 'Employment', name: 'Job Offer from NZ Employer (if applicable)', description: 'Adds 50–60 points. Employer must be accredited or offer must be for listed occupation.', isMandatory: false, isAiGeneratable: false, estimatedDays: 0, urgencyLevel: 'critical', notes: 'Strong accelerant for EOI score.' },
      { id: 'ZA-NZ-SM-005', category: 'Qualifications', name: 'Degree Certificates + NZQA Evaluation (if required)', description: 'NZ Qualifications Authority evaluation of foreign credentials.', isMandatory: false, isAiGeneratable: false, estimatedDays: 30, urgencyLevel: 'high' },
      { id: 'ZA-NZ-SM-006', category: 'Medical', name: 'Immigration Medical Certificate', description: 'From INZ-approved physician.', isMandatory: true, isAiGeneratable: false, estimatedDays: 14, urgencyLevel: 'high' },
    ] as RequirementItem[],
    version: 1,
    lastVerifiedBy: 'system-seed-feb-2025',
  },

] as const;

// ────────────────────────────────────────────────────────────────────────────
// SEED EXECUTION
// ────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🌱 Seeding ${ROUTES.length} visa requirement routes...\n`);

  for (const route of ROUTES) {
    const { lastVerifiedBy, ...data } = route;

    try {
      const result = await prisma.visaRequirement.upsert({
        where: { routeKey: data.routeKey },
        update: {
          ...data,
          lastVerifiedAt: new Date(),
          lastVerifiedBy,
          updatedAt: new Date(),
        },
        create: {
          ...data,
          lastVerifiedAt: new Date(),
          lastVerifiedBy,
        },
      });

      console.log(`  ✅  ${result.routeKey}  →  ${result.displayName}`);
    } catch (err) {
      console.error(`  ❌  Failed: ${route.routeKey}`, err);
    }
  }

  console.log('\n✅ Seed complete.\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
