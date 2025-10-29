import { Request } from 'express';
import { User } from './index';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// Auth Requests
export interface SignupRequest {
  email: string;
  password: string;
  fullName?: string;
  companyName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ConfirmResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Document Generation Requests
export interface GenerateSOPRequest {
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

export interface GenerateCoverLetterRequest {
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

export interface ReviewSOPRequest {
  sopText: string;
  targetCountry?: string;
  purpose?: string;
}

// Billing Requests
export interface CreateCheckoutSessionRequest {
  plan: 'pro' | 'enterprise';
}


