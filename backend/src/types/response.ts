import { UserPublic, Document, ApiUsage } from './index';

// Standard API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth Responses
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserPublic;
}

export interface LoginResponse extends AuthResponse {}

export interface SignupResponse extends AuthResponse {}

// Document Responses
export interface DocumentResponse {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface GenerateDocumentResponse {
  id: string;
  type: string;
  content: string;
  tokensUsed: number;
  created_at: Date;
}

export interface ReviewResponse {
  suggestions: string[];
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  improvedVersion?: string;
}

// Billing Responses
export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface UsageResponse {
  currentUsage: {
    documents: number;
    tokensUsed: number;
  };
  limits: {
    documents: number;
    tokensPerMonth: number;
  };
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: Date | null;
  };
}

// Error Response
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}


