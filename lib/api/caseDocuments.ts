import { apiClient, ApiResponse } from './client';

export interface CaseDocumentChecklist {
  visaType: string;
  destinationCountry: string;
  clientUploads: Array<{
    name: string;
    required: boolean;
    description: string;
    category: 'client_upload';
  }>;
  systemGenerated: Array<{
    name: string;
    required: boolean;
    description: string;
    category: 'system_generated';
    type?: string;
  }>;
  processingTime: string;
  keyRequirements: string[];
}

export interface CaseDocument {
  id: string;
  type: string;
  title: string;
  status: string;
  source: string;
  category: 'client' | 'system';
  created_at: string;
  updated_at?: string;
  name?: string;
  uploaded_at?: string;
}

export interface GenerateCaseDocumentRequest {
  caseId: string;
  documentType: 'sop' | 'cover_letter';
  inputData: any;
}

export interface CaseDocumentsResponse {
  checklist: CaseDocumentChecklist;
  existingDocuments: CaseDocument[];
  uploadedDocuments: CaseDocument[];
  case: {
    id: string;
    applicantName: string;
    destinationCountry: string;
    visaType: string;
  };
}

export interface EligibilityReport {
  caseId: string;
  applicantName: string;
  destinationCountry: string;
  visaType: string;
  keyRequirements: string[];
  processingTime: string;
  requiredDocuments: {
    clientUploads: any[];
    systemGenerated: any[];
  };
  recommendations: string[];
  nextSteps: string[];
}

export const caseDocumentsApi = {
  // Generate document for a case
  async generateDocument(data: GenerateCaseDocumentRequest): Promise<ApiResponse<{ id: string; content: string; tokensUsed: number; type: string }>> {
    return apiClient.post(`/case-documents/case/${data.caseId}/generate`, data);
  },

  // Get document checklist for a case
  async getDocumentChecklist(caseId: string): Promise<ApiResponse<CaseDocumentsResponse>> {
    return apiClient.get(`/case-documents/case/${caseId}/checklist`);
  },

  // Get all documents for a case (both generated and uploaded)
  async getAllDocuments(caseId: string, source?: 'client' | 'system' | 'all'): Promise<ApiResponse<{ documents: CaseDocument[] }>> {
    const query = source ? `?source=${source}` : '';
    return apiClient.get(`/case-documents/case/${caseId}/all-documents${query}`);
  },

  // Get eligibility report for a case
  async getEligibilityReport(caseId: string): Promise<ApiResponse<EligibilityReport>> {
    return apiClient.get(`/case-documents/case/${caseId}/eligibility-report`);
  },
};
