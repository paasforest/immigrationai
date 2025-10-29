// User Types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  company_name: string | null;
  subscription_plan: 'free' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  subscription_plan: string;
  subscription_status: string;
  created_at: Date;
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
  plan: 'free' | 'pro' | 'enterprise';
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


