import { z } from 'zod';

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
};

// Zod schemas for request validation
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().optional(),
  companyName: z.string().optional(),
  subscriptionPlan: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const generateSOPSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  countryOfResidence: z.string().min(1, 'Country of residence is required'),
  targetCountry: z.string().min(1, 'Target country is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  motivation: z.string().min(50, 'Motivation must be at least 50 characters'),
  institutionName: z.string().optional(),
  courseOrPosition: z.string().optional(),
  academicBackground: z.string().optional(),
  workExperience: z.string().optional(),
  futureGoals: z.string().optional(),
});

export const generateCoverLetterSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email address'),
  embassyName: z.string().min(1, 'Embassy name is required'),
  targetCountry: z.string().min(1, 'Target country is required'),
  visaType: z.string().min(1, 'Visa type is required'),
  travelDates: z.string().min(1, 'Travel dates are required'),
  purpose: z.string().min(1, 'Purpose is required'),
  additionalInfo: z.string().optional(),
});

export const reviewSOPSchema = z.object({
  sopText: z.string().min(100, 'SOP text must be at least 100 characters'),
  targetCountry: z.string().optional(),
  purpose: z.string().optional(),
});


