// TypeScript interfaces for Immigration Dashboard
// Based on Prisma schema from backend

export interface ImmigrationCase {
  id: string;
  organizationId: string;
  assignedProfessionalId: string | null;
  applicantId: string | null;
  referenceNumber: string;
  status: 'open' | 'in_progress' | 'submitted' | 'approved' | 'refused' | 'closed';
  visaType: string | null;
  originCountry: string | null;
  destinationCountry: string | null;
  title: string;
  notes: string | null;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  submissionDeadline: string | null;
  submittedAt: string | null;
  decisionAt: string | null;
  outcome: string | null;
  createdAt: string;
  updatedAt: string;
  assignedProfessional?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  applicant?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  _count?: {
    caseDocuments: number;
    tasks: number;
    messages: number;
    checklists: number;
  };
}

export interface CaseDocument {
  id: string;
  caseId: string;
  organizationId: string;
  uploadedById: string;
  name: string;
  category: string | null;
  fileUrl: string;
  fileSize: string | null;
  fileType: string | null;
  status: 'pending_review' | 'approved' | 'rejected' | 'expired';
  expiryDate: string | null;
  notes: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface CaseTask {
  id: string;
  caseId: string;
  organizationId: string;
  assignedToId: string | null;
  createdById: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface CaseMessage {
  id: string;
  caseId: string;
  organizationId: string;
  senderId: string;
  content: string;
  isInternal: boolean;
  readAt: string | null;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface CaseStats {
  total: number;
  inProgress: number;
  submitted: number;
  approved: number;
  refused: number;
  urgent: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'starter' | 'professional' | 'agency';
  planStatus: 'trial' | 'active' | 'suspended' | 'cancelled' | 'expired';
  trialEndsAt: string | null;
  billingEmail: string | null;
  country: string | null;
  phone: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrgUser {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  organizationRole: 'org_admin' | 'professional' | 'applicant';
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateCaseInput {
  title: string;
  visaType: string;
  originCountry: string;
  destinationCountry: string;
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  assignedProfessionalId?: string;
  submissionDeadline?: string;
  notes?: string;
}

export interface CreateTaskInput {
  caseId: string;
  title: string;
  description?: string;
  assignedToId?: string;
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  dueDate?: string;
}

export interface SendMessageInput {
  caseId: string;
  content: string;
  isInternal?: boolean;
}

// ============================================
// MARKETPLACE INTAKE TYPES
// ============================================

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  caseType: string;
  icon?: string;
  estimatedTimeline?: string;
  isActive: boolean;
}

export interface CaseIntake {
  id: string;
  referenceNumber: string;
  serviceId: string;
  service: Service;
  status: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  applicantCountry: string;
  destinationCountry: string;
  urgencyLevel: string;
  description: string;
  submittedAt: string;
  expiresAt: string;
  convertedCaseId?: string;
}

export interface IntakeAssignment {
  id: string;
  intakeId: string;
  intake: CaseIntake;
  professionalId: string;
  status: string;
  attemptNumber: number;
  assignedAt: string;
  respondedAt?: string;
  declinedReason?: string;
  expiresAt: string;
}

export interface ProfessionalSpecialization {
  id: string;
  serviceId: string;
  service: Service;
  originCorridors: string[];
  destinationCorridors: string[];
  maxConcurrentLeads: number;
  isAcceptingLeads: boolean;
  yearsExperience?: number;
  bio?: string;
}

export interface ProfessionalProfile {
  id: string;
  displayName: string;
  title?: string;
  bio?: string;
  languages: string[];
  isPublic: boolean;
  isVerified: boolean;
  locationCity?: string;
  locationCountry?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}
