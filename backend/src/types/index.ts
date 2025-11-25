// User Types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  company_name: string | null;
  subscription_plan: 'starter' | 'entry' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  fullName: string | null;
  companyName: string | null;
  subscriptionPlan: string;
  subscriptionStatus: string;
  createdAt: Date;
}

// Document Types
export interface Document {
  id: string;
  user_id: string;
  type: 'sop' | 'cover_letter' | 'review';
  title: string | null;
  input_data: any;
  generated_output: string | null;
  status: 'draft' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
}

// API Usage Types
export interface ApiUsage {
  id: string;
  user_id: string;
  feature: string;
  tokens_used: number | null;
  cost_usd: number;
  success: boolean;
  timestamp: Date;
}

// Subscription Types
export interface Subscription {
  id: string;
  user_id: string;
  plan: 'starter' | 'entry' | 'professional' | 'enterprise';
  stripe_subscription_id: string | null;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  current_period_end: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Checklist Types
export interface Checklist {
  id: string;
  country: string;
  visa_type: string;
  requirements: any;
  last_updated: Date;
}

// Input Types
export interface SOPInputData {
  fullName: string;
  countryOfResidence: string;
  targetCountry: string;
  purpose: string;
  motivation: string;
  institutionName?: string;
  courseOrPosition?: string;
  academicBackground?: string;
  workExperience?: string;
  futureGoals?: string;
}

export interface CoverLetterInputData {
  fullName: string;
  address: string;
  phone: string;
  email: string;
  embassyName: string;
  targetCountry: string;
  visaType: string;
  travelDates: string;
  purpose: string;
  additionalInfo?: string;
}

export interface ReviewSOPInputData {
  sopText: string;
  targetCountry?: string;
  purpose?: string;
}

export interface FinancialCalculatorInput {
  applicantName: string;
  targetCountry: string;
  visaType: string;
  availableFunds?: string;
  monthlyIncome?: string;
  annualIncome?: string;
  sourceOfFunds?: string;
  durationOfStay?: string;
  homeCountry?: string;
  tuitionFees?: string;
  livingCosts?: string;
  accommodationCosts?: string;
  otherExpenses?: string;
  sponsorName?: string;
  sponsorRelationship?: string;
  sponsorIncome?: string;
  dependents?: string;
}

export interface BankAnalyzerInput {
  applicantName: string;
  targetCountry: string;
  visaType: string;
  statementText?: string;
  accountBalance?: string;
  averageBalance?: string;
  minimumBalance?: string;
  accountType?: string;
  currency?: string;
  statementPeriod?: string;
  monthlyIncome?: string;
  monthlyExpenses?: string;
  largeDeposits?: string;
  sourceOfFunds?: string;
  homeCountry?: string;
}

export interface TiesAssessmentCategory {
  score: number;
  status: 'weak' | 'moderate' | 'strong' | 'excellent';
  notes: string[];
}

export interface TiesAssessment {
  overallScore: number;
  strengthLabel: 'weak' | 'moderate' | 'strong' | 'excellent';
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  nextSteps: string[];
  categories: {
    financial: TiesAssessmentCategory;
    employment: TiesAssessmentCategory;
    family: TiesAssessmentCategory;
    property: TiesAssessmentCategory;
    social: TiesAssessmentCategory;
    educational: TiesAssessmentCategory;
  };
  document: string;
}

export interface DocumentAuthenticityDocument {
  type: string;
  issuingCountry?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expirationDate?: string;
  referenceNumber?: string;
  verificationDetails?: string;
  concerns?: string;
}

export interface DocumentAuthenticityInput {
  applicantName: string;
  targetCountry: string;
  visaType: string;
  documents: DocumentAuthenticityDocument[];
  riskConcerns?: string;
  notes?: string;
}

export interface DocumentAuthenticityReport {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  redFlags: string[];
  requiredVerifications: string[];
  recommendations: string[];
  nextSteps: string[];
  documentChecks: Array<{
    type: string;
    score: number;
    status: 'pass' | 'review' | 'fail';
    issues: string[];
    verificationGuidance: string[];
  }>;
}

export interface ApplicationFormSection {
  title: string;
  fields: Array<{
    label: string;
    value: string;
  }>;
}

export interface ApplicationFormInput {
  applicantName: string;
  targetCountry: string;
  visaType: string;
  submissionType?: 'online' | 'paper' | 'portal' | 'unknown';
  formVersion?: string;
  sections: ApplicationFormSection[];
  attachments?: string[];
  concerns?: string;
}

export interface ApplicationFormCheck {
  field: string;
  status: 'complete' | 'missing' | 'inconsistent' | 'needs_review';
  details: string;
  recommendation: string;
}

export interface ApplicationFormReport {
  overallScore: number;
  completenessStatus: 'complete' | 'partial' | 'incomplete';
  summary: string;
  missingSections: string[];
  inconsistencies: string[];
  riskFactors: string[];
  recommendations: string[];
  nextSteps: string[];
  formChecks: ApplicationFormCheck[];
}

export interface VisaRejectionInput {
  applicantName: string;
  targetCountry: string;
  visaType: string;
  rejectionDate?: string;
  rejectionReason?: string;
  rejectionLetter?: string;
  previousAttempts?: number;
  documentsSubmitted?: string[];
  concerns?: string;
}

export interface VisaRejectionReport {
  rootCauseSummary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  officerConcerns: string[];
  missingEvidence: string[];
  riskFactors: string[];
  recommendedFixes: string[];
  nextSteps: string[];
  timeline: Array<{
    step: string;
    dueBy?: string;
  }>;
  reapplicationChecklist: Array<{
    item: string;
    status: 'required' | 'recommended';
    details: string;
  }>;
}

export interface ReapplicationStrategyInput {
  applicantName: string;
  targetCountry: string;
  visaType: string;
  desiredSubmissionDate?: string;
  priorityLevel?: 'normal' | 'urgent';
  correctedConcerns?: string[];
  improvementsSinceRefusal?: string;
  strategyFocus?: string;
  previousReport?: VisaRejectionReport;
}

export interface ReapplicationStrategyTimelineItem {
  phase: string;
  tasks: string[];
  dueDate?: string;
  owner?: string;
}

export interface ReapplicationStrategyReport {
  readinessScore: number;
  urgency: 'low' | 'medium' | 'high';
  keyMilestones: string[];
  checklist: Array<{
    item: string;
    status: 'complete' | 'in_progress' | 'not_started';
    impact: 'critical' | 'high' | 'medium';
    details: string;
  }>;
  strategyPillars: Array<{
    pillar: string;
    actions: string[];
  }>;
  timeline: ReapplicationStrategyTimelineItem[];
  riskMitigation: string[];
  submissionPlan: string[];
}

export interface ConsistencyCheckerDocument {
  type: string;
  content?: string;
  keyFields?: string;
}

export interface ConsistencyCheckerInput {
  applicantName: string;
  targetCountry: string;
  visaType: string;
  documents: ConsistencyCheckerDocument[];
  keyFields?: string[];
}

export interface ConsistencyIssue {
  field: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  document1: string;
  document2: string;
  description: string;
  recommendation: string;
}

export interface ConsistencyCheckerReport {
  consistencyScore: number;
  status: 'fully_consistent' | 'mostly_consistent' | 'partially_consistent' | 'inconsistent';
  criticalIssues: ConsistencyIssue[];
  inconsistencies: ConsistencyIssue[];
  strengths: string[];
  recommendations: string[];
  summary: string;
}

export interface StudentVisaPackageInput {
  applicantName: string;
  homeCountry: string;
  targetCountry: string;
  currentEducation?: string;
  institution?: string;
  program?: string;
  programDuration?: string;
  tuitionFees?: string;
  startDate?: string;
  availableFunds?: string;
  sourceOfFunds?: string;
  sponsorDetails?: string;
  previousDegrees?: string;
  academicAchievements?: string;
  englishTest?: string;
  testScores?: string;
  careerGoals?: string;
  whyThisProgram?: string;
}

export interface StudentVisaPackageReport {
  sop: string;
  financialLetter: string;
  checklist: {
    requiredDocuments: string[];
    countrySpecific: string[];
    verificationRequirements: string[];
  };
  timeline: {
    weeksBeforeStart: string[];
    deadlines: string[];
  };
  strengths: string[];
  recommendations: string[];
  summary: string;
}


