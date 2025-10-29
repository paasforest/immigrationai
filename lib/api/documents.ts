import { apiClient, ApiResponse } from './client';

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

export interface Document {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GenerateDocumentResponse {
  id: string;
  content: string;
  tokensUsed: number;
  type: string;
}

export interface ReviewResponse {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  structureAnalysis?: string;
  languageAnalysis?: string;
  contentAnalysis?: string;
  summary?: string;
}

export const documentsApi = {
  // Generate Statement of Purpose
  async generateSOP(data: SOPInputData): Promise<ApiResponse<GenerateDocumentResponse>> {
    return apiClient.post<GenerateDocumentResponse>('/api/documents/generate-sop', data);
  },

  // Generate Cover Letter
  async generateCoverLetter(
    data: CoverLetterInputData
  ): Promise<ApiResponse<GenerateDocumentResponse>> {
    return apiClient.post<GenerateDocumentResponse>(
      '/api/documents/generate-cover-letter',
      data
    );
  },

  // Review SOP
  async reviewSOP(data: ReviewSOPInputData): Promise<ApiResponse<ReviewResponse>> {
    return apiClient.post<ReviewResponse>('/api/documents/review-sop', data);
  },

  // Get user's documents
  async getDocuments(page: number = 1, limit: number = 10): Promise<ApiResponse<{
    documents: Document[];
    total: number;
    page: number;
    totalPages: number;
  }>> {
    return apiClient.get(`/api/documents?page=${page}&limit=${limit}`);
  },

  // Get single document
  async getDocument(id: string): Promise<ApiResponse<{ document: Document }>> {
    return apiClient.get(`/api/documents/${id}`);
  },

  // Delete document
  async deleteDocument(id: string): Promise<ApiResponse> {
    return apiClient.delete(`/api/documents/${id}`);
  },
};


