import { apiClient, ApiResponse } from './client';
import {
  ImmigrationCase,
  CaseDocument,
  CaseTask,
  CaseMessage,
  CaseStats,
  Organization,
  OrgUser,
  PaginatedResponse,
  CreateCaseInput,
  CreateTaskInput,
  SendMessageInput,
} from '@/types/immigration';

export const immigrationApi = {
  // ============================================
  // CASES
  // ============================================
  
  async getCases(filters?: {
    status?: string;
    visaType?: string;
    destination?: string;
    priority?: string;
    search?: string;
  }, page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedResponse<ImmigrationCase>>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.visaType) params.append('visaType', filters.visaType);
    if (filters?.destination) params.append('destination', filters.destination);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    return apiClient.get<PaginatedResponse<ImmigrationCase>>(`/api/cases?${params.toString()}`);
  },

  async getCaseById(id: string): Promise<ApiResponse<ImmigrationCase>> {
    return apiClient.get<ImmigrationCase>(`/api/cases/${id}`);
  },

  async createCase(data: CreateCaseInput): Promise<ApiResponse<ImmigrationCase>> {
    return apiClient.post<ImmigrationCase>('/api/cases', data);
  },

  async updateCase(id: string, data: Partial<CreateCaseInput>): Promise<ApiResponse<ImmigrationCase>> {
    return apiClient.put<ImmigrationCase>(`/api/cases/${id}`, data);
  },

  async getCaseStats(): Promise<ApiResponse<CaseStats>> {
    return apiClient.get<CaseStats>('/api/cases/stats');
  },

  // ============================================
  // DOCUMENTS
  // ============================================

  async getDocumentsByCase(caseId: string): Promise<ApiResponse<{ documents: CaseDocument[]; groupedByCategory: Record<string, CaseDocument[]> }>> {
    return apiClient.get<{ documents: CaseDocument[]; groupedByCategory: Record<string, CaseDocument[]> }>(`/api/case-documents/case/${caseId}`);
  },

  async uploadDocument(formData: FormData): Promise<ApiResponse<CaseDocument>> {
    // For file uploads, we need to handle FormData differently
    const token = apiClient.getToken();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type - let browser set it with boundary for multipart/form-data

    try {
      const response = await fetch(`${API_URL}/api/case-documents/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const text = await response.text();
      let parsed: any;
      try {
        parsed = text ? JSON.parse(text) : {};
      } catch {
        parsed = { message: text };
      }

      if (!response.ok) {
        return {
          success: false,
          error: parsed.error || parsed.message || 'Upload failed',
        };
      }

      return {
        success: true,
        data: parsed.data || parsed,
        message: parsed.message,
      };
    } catch (error: any) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  },

  async deleteDocument(id: string): Promise<ApiResponse<{ id: string }>> {
    return apiClient.delete<{ id: string }>(`/api/case-documents/${id}`);
  },

  async downloadDocument(id: string): Promise<Blob | null> {
    const token = apiClient.getToken();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}/api/case-documents/${id}/download`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        console.error('Download failed:', response.statusText);
        return null;
      }

      return await response.blob();
    } catch (error) {
      console.error('Download error:', error);
      return null;
    }
  },

  // ============================================
  // TASKS
  // ============================================

  async getTasksByCase(caseId: string): Promise<ApiResponse<CaseTask[]>> {
    return apiClient.get<CaseTask[]>(`/api/tasks/case/${caseId}`);
  },

  async getUpcomingDeadlines(): Promise<ApiResponse<CaseTask[]>> {
    return apiClient.get<CaseTask[]>('/api/tasks/upcoming');
  },

  async createTask(data: CreateTaskInput): Promise<ApiResponse<CaseTask>> {
    return apiClient.post<CaseTask>('/api/tasks', data);
  },

  async updateTask(id: string, data: Partial<CreateTaskInput & { status?: string }>): Promise<ApiResponse<CaseTask>> {
    return apiClient.put<CaseTask>(`/api/tasks/${id}`, data);
  },

  async deleteTask(id: string): Promise<ApiResponse<{ id: string }>> {
    return apiClient.delete<{ id: string }>(`/api/tasks/${id}`);
  },

  // ============================================
  // MESSAGES
  // ============================================

  async getMessagesByCase(caseId: string, page: number = 1): Promise<ApiResponse<PaginatedResponse<CaseMessage>>> {
    return apiClient.get<PaginatedResponse<CaseMessage>>(`/api/messages/case/${caseId}?page=${page}`);
  },

  async sendMessage(data: SendMessageInput): Promise<ApiResponse<CaseMessage>> {
    return apiClient.post<CaseMessage>('/api/messages', data);
  },

  async markMessagesRead(ids: string[]): Promise<ApiResponse<{ count: number }>> {
    return apiClient.put<{ count: number }>('/api/messages/read', { ids });
  },

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get<{ count: number }>('/api/messages/unread-count');
  },

  // ============================================
  // ORGANIZATIONS
  // ============================================

  async getMyOrganization(): Promise<ApiResponse<Organization>> {
    return apiClient.get<Organization>('/api/organizations/me');
  },

  async updateOrganization(data: Partial<Organization>): Promise<ApiResponse<Organization>> {
    return apiClient.put<Organization>('/api/organizations/me', data);
  },

  async getOrgUsers(): Promise<ApiResponse<OrgUser[]>> {
    return apiClient.get<OrgUser[]>('/api/organizations/me/users');
  },

  async inviteUser(data: { email: string; role: 'org_admin' | 'professional' | 'applicant'; fullName?: string }): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/api/organizations/me/invite', data);
  },

  // ============================================
  // CHECKLISTS
  // ============================================

  async createChecklist(data: {
    caseId: string;
    name: string;
    visaType?: string;
    originCountry?: string;
    destinationCountry?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/api/checklists', data);
  },

  async getChecklistsByCase(caseId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/api/checklists/case/${caseId}`);
  },

  async updateChecklistItem(id: string, data: {
    isCompleted?: boolean;
    documentId?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/api/checklists/items/${id}`, data);
  },

  async deleteChecklist(id: string): Promise<ApiResponse<{ id: string }>> {
    return apiClient.delete<{ id: string }>(`/api/checklists/${id}`);
  },

  // ============================================
  // AI FEATURES
  // ============================================

  async generateAIChecklist(data: {
    visaType: string;
    originCountry: string;
    destinationCountry: string;
    caseId?: string;
    additionalContext?: string;
  }): Promise<ApiResponse<{ items: any[] }>> {
    return apiClient.post<{ items: any[] }>('/api/ai/generate-checklist', data);
  },

  async improveDocument(data: {
    documentType: string;
    currentContent: string;
    visaType: string;
    destinationCountry: string;
    originCountry: string;
  }): Promise<ApiResponse<{ suggestions: string[]; improvedVersion: string }>> {
    return apiClient.post<{ suggestions: string[]; improvedVersion: string }>('/api/ai/improve-document', data);
  },

  // ============================================
  // FINANCIAL ASSISTANT
  // ============================================

  async analyzeFinancialDocs(data: {
    monthlyIncome: number;
    incomeType: string;
    bankStatementMonths: number;
    destinationCountry: string;
    visaType: string;
    currency: string;
    sponsorRelationship?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/api/ai/analyze-financial', data);
  },

  async generateSponsorLetter(data: {
    sponsorName: string;
    sponsorRelationship: string;
    sponsorOccupation: string;
    sponsorCountry: string;
    applicantName: string;
    visaType: string;
    destinationCountry: string;
    travelPurpose: string;
    travelDuration: string;
  }): Promise<ApiResponse<{ letter: string }>> {
    return apiClient.post<{ letter: string }>('/api/ai/sponsor-letter', data);
  },

  // ============================================
  // APPLICANT DASHBOARD
  // ============================================

  async getApplicantDashboard(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/api/cases/applicant-dashboard');
  },

  // ============================================
  // TEAM MANAGEMENT
  // ============================================

  async updateOrgUser(
    userId: string,
    data: {
      fullName?: string;
      role?: 'org_admin' | 'professional' | 'applicant';
      isActive?: boolean;
    }
  ): Promise<ApiResponse<OrgUser>> {
    return apiClient.put<OrgUser>(`/api/organizations/me/users/${userId}`, data);
  },

  // ============================================
  // ONBOARDING
  // ============================================

  async checkOnboardingStatus(): Promise<ApiResponse<{ needsOnboarding: boolean; organization: any | null }>> {
    return apiClient.get<{ needsOnboarding: boolean; organization: any | null }>('/api/organizations/onboarding-status');
  },

  async completeOnboarding(data: {
    organizationName: string;
    country: string;
    phone?: string;
    billingEmail: string;
    teamSize?: string;
    primaryUseCase?: string;
    hearAboutUs?: string;
  }): Promise<ApiResponse<{ organization: any; subscription: any }>> {
    return apiClient.post<{ organization: any; subscription: any }>('/api/organizations/complete-onboarding', data);
  },

  // ============================================
  // BILLING
  // ============================================

  async getSubscriptionDetails(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/api/billing/subscription');
  },

  async getPlans(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/api/billing/plans');
  },

  async initiatePayment(data: {
    plan: string;
    paymentMethod: string;
    billingCycle: 'monthly' | 'annual';
  }): Promise<ApiResponse<{ paymentUrl?: string; bankDetails?: any; clientSecret?: string }>> {
    return apiClient.post<{ paymentUrl?: string; bankDetails?: any; clientSecret?: string }>('/api/billing/initiate', data);
  },

  async cancelSubscription(): Promise<ApiResponse<any>> {
    return apiClient.delete<any>('/api/billing/cancel');
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================

  async getNotifications(params?: {
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ notifications: any[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const query = queryParams.toString();
    return apiClient.get<{ notifications: any[]; pagination: any }>(
      `/api/notifications${query ? `?${query}` : ''}`
    );
  },

  async markNotificationRead(idOrAll: string): Promise<ApiResponse<any>> {
    return apiClient.put<any>('/api/notifications/read', { id: idOrAll });
  },

  // ============================================
  // CREDENTIAL EVALUATION
  // ============================================

  async getEvaluationBodies(destinationCountry: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/api/credentials/evaluation-bodies?destinationCountry=${encodeURIComponent(destinationCountry)}`);
  },

  async checkUniversityRecognition(university: string, country?: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    params.append('university', university);
    if (country) params.append('country', country);
    return apiClient.get<any[]>(`/api/credentials/university-check?${params.toString()}`);
  },

  async getAttestationSteps(originCountry: string, destinationCountry?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    params.append('originCountry', originCountry);
    if (destinationCountry) params.append('destinationCountry', destinationCountry);
    return apiClient.get<any>(`/api/credentials/attestation-steps?${params.toString()}`);
  },

  async generateCredentialGuide(data: {
    originCountry: string;
    destinationCountry: string;
    qualificationLevel: string;
    fieldOfStudy: string;
    universityName: string;
  }): Promise<ApiResponse<{ guide: string; tokensUsed: number; cost: number }>> {
    return apiClient.post<{ guide: string; tokensUsed: number; cost: number }>('/api/credentials/generate-guide', data);
  },

  // ============================================
  // VAC TRACKER
  // ============================================

  async getVACCentres(country?: string, destination?: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (country) params.append('country', country);
    if (destination) params.append('destination', destination);
    const query = params.toString();
    return apiClient.get<any[]>(`/api/vac/centres${query ? `?${query}` : ''}`);
  },

  async getWaitTimes(originCity: string, destination: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/api/vac/wait-times?originCity=${encodeURIComponent(originCity)}&destination=${encodeURIComponent(destination)}`);
  },

  async getBookingLinks(destination?: string): Promise<ApiResponse<any>> {
    const query = destination ? `?destination=${encodeURIComponent(destination)}` : '';
    return apiClient.get<any>(`/api/vac/booking-links${query}`);
  },

  // ============================================
  // ANALYTICS
  // ============================================

  async getOverviewAnalytics(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/api/immigration-analytics/overview');
  },

  async getCaseTrends(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/api/immigration-analytics/trends');
  },

  async getProfessionalPerformance(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/api/immigration-analytics/professionals');
  },

  // ============================================
  // ALL DOCUMENTS (ORG-SCOPED)
  // ============================================

  async getAllDocuments(filters?: {
    category?: string;
    status?: string;
    expiringWithin?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ documents: any[]; pagination: any }>> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.expiringWithin) params.append('expiringWithin', filters.expiringWithin.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    const query = params.toString();
    return apiClient.get<{ documents: any[]; pagination: any }>(
      `/api/case-documents${query ? `?${query}` : ''}`
    );
  },

  // ============================================
  // ALL TASKS (ORG-SCOPED)
  // ============================================

  async getAllTasksAcrossOrg(filters?: {
    status?: string;
    priority?: string;
    assignedToId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assignedToId) params.append('assignedToId', filters.assignedToId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    const query = params.toString();
    return apiClient.get<any[]>(`/api/tasks${query ? `?${query}` : ''}`);
  },

  // ============================================
  // MARKETPLACE INTAKE
  // ============================================

  async getMyLeads(status?: string): Promise<ApiResponse<{
    assignments: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    const url = status ? `/api/intake/my-leads?status=${status}` : '/api/intake/my-leads';
    return apiClient.get(url);
  },

  async respondToLead(data: {
    assignmentId: string;
    action: 'accept' | 'decline';
    declinedReason?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post('/api/intake/respond', data);
  },

  async getMySpecializations(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/api/intake/specializations');
  },

  async upsertSpecialization(data: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/intake/specializations', data);
  },

  async deleteSpecialization(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/api/intake/specializations/${id}`);
  },

  async upsertPublicProfile(data: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/intake/profile', data);
  },

  async getMyProfile(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/intake/profile');
  },

  async getMyLeadStats(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/intake/my-stats');
  },

  // Admin functions
  async getPendingVerifications(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/intake/admin/verifications');
  },

  async verifyProfessional(data: {
    profileId: string;
    action: 'approve' | 'reject';
    rejectionReason?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post('/api/intake/admin/verify', data);
  },

  async getAllIntakes(filters?: {
    status?: string;
    serviceId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
  }): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.serviceId) params.append('serviceId', filters.serviceId);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.page) params.append('page', filters.page.toString());
    const query = params.toString();
    return apiClient.get(`/api/intake/admin/all-intakes${query ? `?${query}` : ''}`);
  },

  async getRoutingStats(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/intake/admin/routing-stats');
  },

  // ============================================
  // DOCUMENT STUDIO — AI document generation
  // Each method calls the appropriate backend endpoint
  // and normalises the response to { content: string }
  // ============================================

  async generateSOP(data: {
    fullName: string;
    currentCountry: string;
    targetCountry: string;
    institution: string;
    program?: string;
    purpose?: string;
    background?: string;
    motivation?: string;
    careerGoals?: string;
  }): Promise<ApiResponse<{ content: string; tokensUsed?: number }>> {
    const res = await apiClient.post<{ sop: string; tokensUsed?: number }>(
      '/api/ai/generate-sop',
      data
    );
    return res.success
      ? { success: true, data: { content: res.data!.sop, tokensUsed: res.data!.tokensUsed } }
      : res;
  },

  async generateCoverLetter(data: {
    applicantName: string;
    targetCountry: string;
    visaType: string;
    purpose: string;
    employerOrInstitution?: string;
    additionalContext?: string;
  }): Promise<ApiResponse<{ content: string; tokensUsed?: number }>> {
    const res = await apiClient.post<{ letter: string; tokensUsed?: number }>(
      '/api/ai/generate-support-letter',
      {
        letterType: 'cover_letter',
        visitorName: data.applicantName,
        targetCountry: data.targetCountry,
        visaType: data.visaType,
        purpose: data.purpose,
        employerOrInstitution: data.employerOrInstitution,
        additionalContext: data.additionalContext,
      }
    );
    return res.success
      ? { success: true, data: { content: res.data!.letter, tokensUsed: res.data!.tokensUsed } }
      : res;
  },

  async generateMotivationLetter(data: {
    applicantName: string;
    targetCountry: string;
    visaType: string;
    institution?: string;
    program?: string;
    motivation?: string;
    background?: string;
  }): Promise<ApiResponse<{ content: string; tokensUsed?: number }>> {
    const res = await apiClient.post<{ letter: string; tokensUsed?: number }>(
      '/api/ai/generate-support-letter',
      {
        letterType: 'motivation_letter',
        visitorName: data.applicantName,
        targetCountry: data.targetCountry,
        visaType: data.visaType,
        institution: data.institution,
        program: data.program,
        motivation: data.motivation,
        background: data.background,
      }
    );
    return res.success
      ? { success: true, data: { content: res.data!.letter, tokensUsed: res.data!.tokensUsed } }
      : res;
  },

  async generateSponsorLetterForCase(data: {
    sponsorName: string;
    sponsorRelationship: string;
    sponsorOccupation: string;
    sponsorCountry: string;
    applicantName: string;
    visaType: string;
    destinationCountry: string;
    travelPurpose: string;
    travelDuration: string;
  }): Promise<ApiResponse<{ content: string; tokensUsed?: number }>> {
    const res = await apiClient.post<{ letter: string }>('/api/ai/sponsor-letter', data);
    return res.success
      ? { success: true, data: { content: res.data!.letter } }
      : res;
  },

  async generateFinancialLetter(data: {
    applicantName: string;
    targetCountry: string;
    visaType: string;
    availableFunds: string;
    sourceOfFunds: string;
    currency?: string;
    additionalContext?: string;
  }): Promise<ApiResponse<{ content: string; tokensUsed?: number }>> {
    const res = await apiClient.post<{ letter: string; tokensUsed?: number }>(
      '/api/ai/generate-financial-letter',
      data
    );
    return res.success
      ? { success: true, data: { content: res.data!.letter, tokensUsed: res.data!.tokensUsed } }
      : res;
  },

  async generatePurposeOfVisit(data: {
    applicantName: string;
    targetCountry: string;
    visaType: string;
    visitPurpose: string;
    duration: string;
    additionalContext?: string;
  }): Promise<ApiResponse<{ content: string; tokensUsed?: number }>> {
    const res = await apiClient.post<{ explanation: string; tokensUsed?: number }>(
      '/api/ai/generate-purpose-of-visit',
      data
    );
    return res.success
      ? {
          success: true,
          data: { content: res.data!.explanation, tokensUsed: res.data!.tokensUsed },
        }
      : res;
  },

  async generateTiesToHomeCountry(data: {
    applicantName: string;
    targetCountry: string;
    visaType: string;
    homeCountry: string;
    employment?: string;
    family?: string;
    property?: string;
    additionalContext?: string;
  }): Promise<ApiResponse<{ content: string; tokensUsed?: number }>> {
    const res = await apiClient.post<{ assessment: string; tokensUsed?: number }>(
      '/api/ai/generate-ties-to-home-country',
      data
    );
    return res.success
      ? {
          success: true,
          data: { content: res.data!.assessment, tokensUsed: res.data!.tokensUsed },
        }
      : res;
  },

  async generateTravelItinerary(data: {
    applicantName: string;
    targetCountry: string;
    visaType: string;
    travelDates: string;
    cities: string;
    purpose: string;
    accommodation?: string;
    additionalContext?: string;
  }): Promise<ApiResponse<{ content: string; tokensUsed?: number }>> {
    const res = await apiClient.post<{ itinerary: string; tokensUsed?: number }>(
      '/api/ai/generate-travel-itinerary',
      data
    );
    return res.success
      ? { success: true, data: { content: res.data!.itinerary, tokensUsed: res.data!.tokensUsed } }
      : res;
  },

  async improveGeneratedDocument(data: {
    documentType: string;
    currentContent: string;
    visaType: string;
    destinationCountry: string;
    originCountry: string;
    instructions?: string;
  }): Promise<ApiResponse<{ suggestions: string[]; improvedVersion: string }>> {
    return apiClient.post('/api/ai/improve-document', data);
  },
};
