'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle, Loader, TrendingUp, Award, AlertCircle, Heart, Star } from 'lucide-react';
import FeedbackWidget from '@/components/FeedbackWidget';
import SuccessTracker from '@/components/SuccessTracker';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function VisaCheckerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    targetCountry: 'canada',
    visaType: 'study_permit',
    age: '',
    education: '',
    workExperience: '',
    languageTest: '',
    languageScore: '',
    funds: '',
    // Family-specific fields
    relationship: '',
    sponsorStatus: '',
    sponsorIncome: '',
    // Work-specific fields
    jobOffer: '',
    employer: '',
    salary: '',
    // Study-specific fields
    institution: '',
    program: '',
    tuition: '',
    // General fields
    nationality: '',
    maritalStatus: '',
    dependents: '',
    // Home ties and strong connections (crucial for visa approval)
    propertyOwnership: '',
    familyInHomeCountry: '',
    employmentInHomeCountry: '',
    businessInHomeCountry: '',
    bankAccountsHomeCountry: '',
    previousTravelHistory: '',
    returnTicket: '',
    accommodationProof: '',
    // Additional real-world factors
    criminalRecord: '',
    previousVisaRejections: '',
    healthInsurance: '',
    sponsorRelationship: '',
  });

  // Country-specific visa types
  const getVisaTypes = (country: string) => {
    const visaTypes: { [key: string]: { value: string; label: string }[] } = {
      'canada': [
        { value: 'study_permit', label: 'Study Permit' },
        { value: 'work_permit', label: 'Work Permit' },
        { value: 'express_entry', label: 'Express Entry (PR)' },
        { value: 'visitor_visa', label: 'Visitor Visa' },
        { value: 'family_sponsorship', label: 'Family Sponsorship' },
        { value: 'startup_visa', label: 'Startup Visa' },
        { value: 'investor_visa', label: 'Investor Visa' }
      ],
      'usa': [
        { value: 'f1_student', label: 'F-1 Student Visa' },
        { value: 'h1b_work', label: 'H-1B Work Visa' },
        { value: 'l1_transfer', label: 'L-1 Intracompany Transfer' },
        { value: 'o1_extraordinary', label: 'O-1 Extraordinary Ability' },
        { value: 'eb1_priority', label: 'EB-1 Priority Worker' },
        { value: 'eb2_advanced', label: 'EB-2 Advanced Degree' },
        { value: 'eb3_skilled', label: 'EB-3 Skilled Worker' },
        { value: 'b1_b2_visitor', label: 'B-1/B-2 Visitor Visa' },
        { value: 'k1_fiance', label: 'K-1 Fiancé Visa' },
        { value: 'cr1_spouse', label: 'CR-1 Spouse Visa' }
      ],
      'uk': [
        { value: 'student_visa', label: 'Student Visa (Tier 4)' },
        { value: 'skilled_worker', label: 'Skilled Worker Visa' },
        { value: 'global_talent', label: 'Global Talent Visa' },
        { value: 'startup_visa', label: 'Startup Visa' },
        { value: 'innovator_visa', label: 'Innovator Visa' },
        { value: 'family_visa', label: 'Family Visa' },
        { value: 'visitor_visa', label: 'Visitor Visa' },
        { value: 'ancestry_visa', label: 'Ancestry Visa' }
      ],
      'australia': [
        { value: 'student_visa_500', label: 'Student Visa (500)' },
        { value: 'skilled_migration_189', label: 'Skilled Migration (189)' },
        { value: 'skilled_migration_190', label: 'Skilled Migration (190)' },
        { value: 'temporary_work_482', label: 'Temporary Work (482)' },
        { value: 'partner_visa', label: 'Partner Visa' },
        { value: 'parent_visa', label: 'Parent Visa' },
        { value: 'visitor_visa', label: 'Visitor Visa' },
        { value: 'working_holiday', label: 'Working Holiday Visa' }
      ],
      'germany': [
        { value: 'student_visa', label: 'Student Visa' },
        { value: 'work_visa', label: 'Work Visa' },
        { value: 'blue_card', label: 'EU Blue Card' },
        { value: 'family_reunion', label: 'Family Reunion' },
        { value: 'freelancer_visa', label: 'Freelancer Visa' },
        { value: 'job_seeker', label: 'Job Seeker Visa' },
        { value: 'visitor_visa', label: 'Visitor Visa' }
      ],
      'ireland': [
        { value: 'stamp_2', label: 'Stamp 2 (Student Visa)' },
        { value: 'stamp_1', label: 'Stamp 1 (Work Permit)' },
        { value: 'stamp_1g', label: 'Stamp 1G (Critical Skills/Graduate)' },
        { value: 'stamp_4', label: 'Stamp 4 (Family Reunion/Spouse)' },
        { value: 'stamp_3', label: 'Stamp 3 (Family Member of Worker)' },
        { value: 'stamp_0', label: 'Stamp 0 (Visitor/Retiree)' },
        { value: 'stamp_5', label: 'Stamp 5 (Long-term Residency)' }
      ],
      'schengen': [
        { value: 'type_a_transit', label: 'Type A (Airport Transit)' },
        { value: 'type_c_tourism', label: 'Type C (Tourism/Business)' },
        { value: 'type_c_family', label: 'Type C (Family Visit)' },
        { value: 'type_d_work', label: 'Type D (Work Permit)' },
        { value: 'type_d_student', label: 'Type D (Student Visa)' },
        { value: 'type_d_family', label: 'Type D (Family Reunion)' },
        { value: 'ltv_visa', label: 'LTV (Limited Territorial)' }
      ],
      'new_zealand': [
        { value: 'skilled_migrant', label: 'Skilled Migrant (Residence)' },
        { value: 'student_visa', label: 'Student Visa' },
        { value: 'working_holiday', label: 'Working Holiday Visa' },
        { value: 'partner_visa', label: 'Partner Visa' },
        { value: 'parent_visa', label: 'Parent Visa' },
        { value: 'visitor_visa', label: 'Visitor Visa' },
        { value: 'work_visa', label: 'Work Visa' },
        { value: 'investor_visa', label: 'Investor Visa' }
      ],
      'singapore': [
        { value: 'employment_pass', label: 'Employment Pass' },
        { value: 's_pass', label: 'S Pass' },
        { value: 'singapore_work_permit', label: 'Work Permit' },
        { value: 'student_pass', label: 'Student Pass' },
        { value: 'family_visa', label: 'Family Visa' },
        { value: 'visitor_visa', label: 'Visitor Visa' },
        { value: 'pr_application', label: 'Permanent Residence' },
        { value: 'entrepreneur_pass', label: 'Entrepreneur Pass' }
      ],
      'uae': [
        { value: 'employment_visa', label: 'Employment Visa' },
        { value: 'investor_visa', label: 'Investor Visa' },
        { value: 'student_visa', label: 'Student Visa' },
        { value: 'family_visa', label: 'Family Visa' },
        { value: 'visitor_visa', label: 'Visitor Visa' },
        { value: 'freelancer_visa', label: 'Freelancer Visa' },
        { value: 'golden_visa', label: 'Golden Visa (Long-term)' },
        { value: 'transit_visa', label: 'Transit Visa' }
      ],
      'netherlands': [
        { value: 'highly_skilled_migrant', label: 'Highly Skilled Migrant' },
        { value: 'student_visa', label: 'Student Visa' },
        { value: 'family_reunion', label: 'Family Reunion' },
        { value: 'startup_visa', label: 'Startup Visa' },
        { value: 'visitor_visa', label: 'Visitor Visa' },
        { value: 'work_visa', label: 'Work Visa' },
        { value: 'eu_blue_card', label: 'EU Blue Card' },
        { value: 'orientation_year', label: 'Orientation Year' }
      ],
      'japan': [
        { value: 'japan_work_visa', label: 'Work Visa' },
        { value: 'student_visa', label: 'Student Visa' },
        { value: 'spouse_visa', label: 'Spouse Visa' },
        { value: 'highly_skilled_professional', label: 'Highly Skilled Professional' },
        { value: 'visitor_visa', label: 'Visitor Visa' },
        { value: 'family_visa', label: 'Family Visa' },
        { value: 'investor_visa', label: 'Investor Visa' },
        { value: 'japan_working_holiday', label: 'Working Holiday' }
      ],
      'south_korea': [
        { value: 'e2_work', label: 'E-2 (Work Visa)' },
        { value: 'd2_student', label: 'D-2 (Student Visa)' },
        { value: 'f6_spouse', label: 'F-6 (Spouse Visa)' },
        { value: 'f4_overseas_korean', label: 'F-4 (Overseas Korean)' },
        { value: 'c3_visitor', label: 'C-3 (Visitor Visa)' },
        { value: 'e7_specialty', label: 'E-7 (Specialty Occupation)' },
        { value: 'f2_resident', label: 'F-2 (Resident Visa)' },
        { value: 'd8_investor', label: 'D-8 (Investor Visa)' }
      ]
    };
    return visaTypes[country] || visaTypes['canada'];
  };

  // Get relevant questions based on visa type
  const getRelevantQuestions = (visaType: string) => {
    const questions: { [key: string]: string[] } = {
      // Study visas
      'study_permit': ['age', 'education', 'certificateVerification', 'verificationBody', 'verificationTimeline', 'equivalencyLevel', 'languageTest', 'languageScore', 'funds', 'institution', 'program', 'tuition', 'nationality'],
      'student_visa': ['age', 'education', 'certificateVerification', 'verificationBody', 'verificationTimeline', 'equivalencyLevel', 'languageTest', 'languageScore', 'funds', 'institution', 'program', 'tuition', 'nationality'],
      'student_visa_500': ['age', 'education', 'certificateVerification', 'verificationBody', 'verificationTimeline', 'equivalencyLevel', 'languageTest', 'languageScore', 'funds', 'institution', 'program', 'tuition', 'nationality'],
      
      // Work visas
      'work_permit': ['age', 'education', 'workExperience', 'languageTest', 'languageScore', 'jobOffer', 'employer', 'salary', 'nationality'],
      'h1b_work': ['age', 'education', 'workExperience', 'jobOffer', 'employer', 'salary', 'nationality'],
      'skilled_worker': ['age', 'education', 'workExperience', 'languageTest', 'languageScore', 'jobOffer', 'employer', 'salary', 'nationality'],
      'temporary_work_482': ['age', 'education', 'workExperience', 'languageTest', 'languageScore', 'jobOffer', 'employer', 'salary', 'nationality'],
      
      // Family visas
      'family_reunion': ['age', 'relationship', 'sponsorStatus', 'sponsorIncome', 'maritalStatus', 'dependents', 'nationality'],
      'family_sponsorship': ['age', 'relationship', 'sponsorStatus', 'sponsorIncome', 'maritalStatus', 'dependents', 'nationality'],
      'spouse_visa': ['age', 'relationship', 'sponsorStatus', 'sponsorIncome', 'maritalStatus', 'nationality'],
      'partner_visa': ['age', 'relationship', 'sponsorStatus', 'sponsorIncome', 'maritalStatus', 'nationality'],
      'family_visa': ['age', 'relationship', 'sponsorStatus', 'sponsorIncome', 'maritalStatus', 'dependents', 'nationality'],
      
      // Ireland-specific stamps
      'stamp_2': ['age', 'education', 'certificateVerification', 'verificationBody', 'verificationTimeline', 'equivalencyLevel', 'languageTest', 'languageScore', 'funds', 'institution', 'program', 'tuition', 'nationality'],
      'stamp_1': ['age', 'education', 'workExperience', 'languageTest', 'languageScore', 'jobOffer', 'employer', 'salary', 'nationality'],
      'stamp_1g': ['age', 'education', 'workExperience', 'languageTest', 'languageScore', 'jobOffer', 'employer', 'salary', 'nationality'],
      'stamp_4': ['age', 'relationship', 'sponsorStatus', 'sponsorIncome', 'maritalStatus', 'dependents', 'nationality'],
      'stamp_3': ['age', 'relationship', 'sponsorStatus', 'sponsorIncome', 'maritalStatus', 'dependents', 'nationality'],
      'stamp_0': ['age', 'funds', 'maritalStatus', 'dependents', 'nationality'],
      'stamp_5': ['age', 'education', 'workExperience', 'languageTest', 'languageScore', 'funds', 'nationality'],
      
      // Visitor visas (home ties are CRITICAL)
      'visitor_visa': ['age', 'funds', 'maritalStatus', 'dependents', 'nationality', 'propertyOwnership', 'familyInHomeCountry', 'employmentInHomeCountry', 'bankAccountsHomeCountry', 'previousTravelHistory', 'returnTicket', 'accommodationProof', 'criminalRecord', 'previousVisaRejections'],
      'b1_b2_visitor': ['age', 'funds', 'maritalStatus', 'dependents', 'nationality', 'propertyOwnership', 'familyInHomeCountry', 'employmentInHomeCountry', 'bankAccountsHomeCountry', 'previousTravelHistory', 'returnTicket', 'accommodationProof', 'criminalRecord', 'previousVisaRejections'],
      
      // Investment visas
      'investor_visa': ['age', 'education', 'funds', 'nationality'],
      'startup_visa': ['age', 'education', 'funds', 'nationality'],
      'innovator_visa': ['age', 'education', 'funds', 'nationality'],
      
      // Schengen visas (home ties are CRITICAL for Type C)
      'type_a_transit': ['age', 'nationality'],
      'type_c_tourism': ['age', 'funds', 'maritalStatus', 'dependents', 'nationality', 'propertyOwnership', 'familyInHomeCountry', 'employmentInHomeCountry', 'bankAccountsHomeCountry', 'previousTravelHistory', 'returnTicket', 'accommodationProof', 'criminalRecord', 'previousVisaRejections'],
      'type_c_family': ['age', 'relationship', 'sponsorStatus', 'funds', 'nationality', 'propertyOwnership', 'familyInHomeCountry', 'employmentInHomeCountry', 'bankAccountsHomeCountry', 'previousTravelHistory', 'returnTicket', 'accommodationProof', 'criminalRecord', 'previousVisaRejections'],
      'type_d_work': ['age', 'education', 'workExperience', 'languageTest', 'languageScore', 'jobOffer', 'employer', 'salary', 'nationality'],
      'type_d_student': ['age', 'education', 'certificateVerification', 'verificationBody', 'verificationTimeline', 'equivalencyLevel', 'languageTest', 'languageScore', 'funds', 'institution', 'program', 'tuition', 'nationality'],
      'type_d_family': ['age', 'relationship', 'sponsorStatus', 'sponsorIncome', 'maritalStatus', 'dependents', 'nationality'],
      'ltv_visa': ['age', 'funds', 'nationality'],
      
      // New Zealand visas
      'skilled_migrant': ['age', 'education', 'workExperience', 'languageTest', 'languageScore', 'funds', 'nationality'],
      'working_holiday': ['age', 'funds', 'nationality', 'propertyOwnership', 'familyInHomeCountry', 'employmentInHomeCountry', 'bankAccountsHomeCountry', 'previousTravelHistory', 'returnTicket', 'accommodationProof', 'criminalRecord', 'previousVisaRejections'],
      'work_visa': ['age', 'education', 'workExperience', 'languageTest', 'languageScore', 'jobOffer', 'employer', 'salary', 'nationality'],
      
      // Singapore visas
      'employment_pass': ['age', 'education', 'workExperience', 'jobOffer', 'employer', 'salary', 'nationality'],
      's_pass': ['age', 'education', 'workExperience', 'jobOffer', 'employer', 'salary', 'nationality'],
      'singapore_work_permit': ['age', 'education', 'workExperience', 'jobOffer', 'employer', 'salary', 'nationality'],
      'student_pass': ['age', 'education', 'certificateVerification', 'verificationBody', 'verificationTimeline', 'equivalencyLevel', 'languageTest', 'languageScore', 'funds', 'institution', 'program', 'tuition', 'nationality'],
      'entrepreneur_pass': ['age', 'education', 'funds', 'nationality'],
      'pr_application': ['age', 'education', 'workExperience', 'languageTest', 'languageScore', 'funds', 'nationality'],
      
      // UAE visas
      'employment_visa': ['age', 'education', 'workExperience', 'jobOffer', 'employer', 'salary', 'nationality'],
      'freelancer_visa': ['age', 'education', 'workExperience', 'funds', 'nationality'],
      'golden_visa': ['age', 'education', 'funds', 'nationality'],
      'transit_visa': ['age', 'nationality'],
      
      // Netherlands visas
      'highly_skilled_migrant': ['age', 'education', 'workExperience', 'jobOffer', 'employer', 'salary', 'nationality'],
      'eu_blue_card': ['age', 'education', 'workExperience', 'jobOffer', 'employer', 'salary', 'nationality'],
      'orientation_year': ['age', 'education', 'workExperience', 'languageTest', 'languageScore', 'nationality'],
      
      // Japan visas
      'japan_work_visa': ['age', 'education', 'workExperience', 'jobOffer', 'employer', 'salary', 'nationality'],
      'highly_skilled_professional': ['age', 'education', 'workExperience', 'jobOffer', 'employer', 'salary', 'nationality'],
      'japan_working_holiday': ['age', 'funds', 'nationality', 'propertyOwnership', 'familyInHomeCountry', 'employmentInHomeCountry', 'bankAccountsHomeCountry', 'previousTravelHistory', 'returnTicket', 'accommodationProof', 'criminalRecord', 'previousVisaRejections'],
      
      // South Korea visas
      'e2_work': ['age', 'education', 'workExperience', 'languageTest', 'languageScore', 'jobOffer', 'employer', 'salary', 'nationality'],
      'd2_student': ['age', 'education', 'certificateVerification', 'verificationBody', 'verificationTimeline', 'equivalencyLevel', 'languageTest', 'languageScore', 'funds', 'institution', 'program', 'tuition', 'nationality'],
      'f6_spouse': ['age', 'relationship', 'sponsorStatus', 'sponsorIncome', 'maritalStatus', 'nationality'],
      'f4_overseas_korean': ['age', 'nationality'],
      'c3_visitor': ['age', 'funds', 'maritalStatus', 'dependents', 'nationality', 'propertyOwnership', 'familyInHomeCountry', 'employmentInHomeCountry', 'bankAccountsHomeCountry', 'previousTravelHistory', 'returnTicket', 'accommodationProof', 'criminalRecord', 'previousVisaRejections'],
      'e7_specialty': ['age', 'education', 'workExperience', 'jobOffer', 'employer', 'salary', 'nationality'],
      'f2_resident': ['age', 'education', 'workExperience', 'languageTest', 'languageScore', 'funds', 'nationality'],
      'd8_investor': ['age', 'education', 'funds', 'nationality'],
      
      // Default
      'default': ['age', 'education', 'workExperience', 'languageTest', 'languageScore', 'funds', 'nationality']
    };
    
    return questions[visaType] || questions['default'];
  };

  const relevantQuestions = getRelevantQuestions(formData.visaType);

  // Render form fields based on visa type
  const renderFormFields = () => {
    const fieldConfigs: { [key: string]: any } = {
      age: {
        type: 'number',
        label: 'Age',
        placeholder: '25',
        required: true,
        helpText: 'Your current age affects visa eligibility and scoring',
        icon: '👤'
      },
      education: {
        type: 'select',
        label: 'Highest Education Level',
        options: [
          { value: 'select_education', label: 'Select your highest qualification...' },
          { value: 'high_school', label: 'High School Diploma' },
          { value: 'bachelors', label: 'Bachelor\'s Degree' },
          { value: 'masters', label: 'Master\'s Degree' },
          { value: 'phd', label: 'PhD/Doctorate' },
          { value: 'professional', label: 'Professional Qualification' }
        ],
        required: true,
        helpText: 'Higher education often improves visa chances',
        icon: '🎓'
      },
      certificateVerification: {
        type: 'select',
        label: 'Certificate Verification Status',
        options: [
          { value: 'select_verification', label: 'Select verification status...' },
          { value: 'verified', label: '✅ Already verified by destination country' },
          { value: 'in_progress', label: '🔄 Currently being verified' },
          { value: 'not_started', label: '❌ Not yet started verification' },
          { value: 'not_required', label: 'ℹ️ Not required for this visa type' }
        ],
        required: false,
        helpText: 'Many countries require foreign certificates to be verified for equivalency',
        icon: '📜'
      },
      verificationBody: {
        type: 'text',
        label: 'Verification Body/Authority',
        placeholder: 'e.g., NARIC, WES, CIMEA, ENIC',
        required: false,
        helpText: 'Organization handling your certificate verification',
        icon: '🏛️'
      },
      verificationTimeline: {
        type: 'select',
        label: 'Expected Verification Timeline',
        options: [
          { value: 'select_timeline', label: 'Select timeline...' },
          { value: '1_2_weeks', label: '1-2 weeks' },
          { value: '3_4_weeks', label: '3-4 weeks' },
          { value: '1_2_months', label: '1-2 months' },
          { value: '2_3_months', label: '2-3 months' },
          { value: '3_6_months', label: '3-6 months' },
          { value: 'unknown', label: 'Unknown/Not sure' }
        ],
        required: false,
        helpText: 'How long the verification process typically takes',
        icon: '⏰'
      },
      equivalencyLevel: {
        type: 'select',
        label: 'Certificate Equivalency Level',
        options: [
          { value: 'select_equivalency', label: 'Select equivalency level...' },
          { value: 'equivalent', label: '✅ Equivalent to destination country standard' },
          { value: 'higher', label: '⬆️ Higher than destination country standard' },
          { value: 'lower', label: '⬇️ Lower than destination country standard' },
          { value: 'not_assessed', label: '❓ Not yet assessed' },
          { value: 'rejected', label: '❌ Rejected/Not recognized' }
        ],
        required: false,
        helpText: 'How your qualification compares to destination country standards',
        icon: '⚖️'
      },
      workExperience: {
        type: 'text',
        label: 'Relevant Work Experience',
        placeholder: 'e.g., 5 years in Software Development',
        required: false,
        helpText: 'Include years and field of work (e.g., "3 years in Marketing")',
        icon: '💼'
      },
      languageTest: {
        type: 'select',
        label: 'English Language Proficiency Test',
        options: [
          { value: 'select_language_test', label: 'Select your test type...' },
          { value: 'IELTS', label: 'IELTS (International English Language Testing System)' },
          { value: 'TOEFL', label: 'TOEFL (Test of English as a Foreign Language)' },
          { value: 'PTE', label: 'PTE Academic (Pearson Test of English)' },
          { value: 'Duolingo', label: 'Duolingo English Test' },
          { value: 'Cambridge', label: 'Cambridge English Assessment' },
          { value: 'none', label: 'No Language Test Taken' }
        ],
        required: false,
        helpText: 'Most countries require proof of English proficiency',
        icon: '🗣️'
      },
      languageScore: {
        type: 'text',
        label: 'Language Test Score',
        placeholder: 'e.g., 7.5',
        required: false,
        helpText: 'Enter your overall band score (IELTS) or total score (TOEFL)',
        icon: '📊'
      },
      funds: {
        type: 'text',
        label: 'Available Funds (USD)',
        placeholder: 'e.g., 25000',
        required: false,
        helpText: 'Include savings, investments, and liquid assets',
        icon: '💰'
      },
      nationality: {
        type: 'text',
        label: 'Nationality/Country of Citizenship',
        placeholder: 'e.g., Indian, Nigerian, Brazilian',
        required: true,
        helpText: 'Your country of citizenship affects visa requirements',
        icon: '🌍'
      },
      maritalStatus: {
        type: 'select',
        label: 'Marital Status',
        options: [
          { value: 'select_marital', label: 'Select marital status...' },
          { value: 'single', label: 'Single' },
          { value: 'married', label: 'Married' },
          { value: 'divorced', label: 'Divorced' },
          { value: 'widowed', label: 'Widowed' },
          { value: 'separated', label: 'Separated' }
        ],
        required: false,
        helpText: 'Affects family ties and visa requirements',
        icon: '💍'
      },
      dependents: {
        type: 'number',
        label: 'Number of Dependents',
        placeholder: '0',
        required: false,
        helpText: 'Children or other dependents you support',
        icon: '👶'
      },
      // Family-specific fields
      relationship: {
        type: 'select',
        label: 'Relationship to Sponsor',
        options: [
          { value: 'select_relationship', label: 'Select relationship...' },
          { value: 'spouse', label: 'Spouse/Partner' },
          { value: 'child', label: 'Child (under 18)' },
          { value: 'adult_child', label: 'Adult Child (18+)' },
          { value: 'parent', label: 'Parent' },
          { value: 'sibling', label: 'Sibling' },
          { value: 'other', label: 'Other Family Member' }
        ],
        required: true,
        helpText: 'Required for family reunion visas',
        icon: '👨‍👩‍👧‍👦'
      },
      sponsorStatus: {
        type: 'select',
        label: 'Sponsor\'s Immigration Status',
        options: [
          { value: 'select_sponsor_status', label: 'Select sponsor status...' },
          { value: 'citizen', label: 'Citizen of destination country' },
          { value: 'permanent_resident', label: 'Permanent Resident' },
          { value: 'work_permit', label: 'Work Permit Holder' },
          { value: 'student', label: 'Student' },
          { value: 'refugee', label: 'Refugee/Protected Person' }
        ],
        required: true,
        helpText: 'Sponsor must have legal status in destination country',
        icon: '🛡️'
      },
      sponsorIncome: {
        type: 'text',
        label: 'Sponsor\'s Annual Income (USD)',
        placeholder: 'e.g., 50000',
        required: true,
        helpText: 'Gross annual income before taxes',
        icon: '💵'
      },
      // Work-specific fields
      jobOffer: {
        type: 'select',
        label: 'Job Offer Status',
        options: [
          { value: 'select_job_offer', label: 'Select your job offer status...' },
          { value: 'yes', label: 'Yes, I have a confirmed job offer' },
          { value: 'interview', label: 'I have job interviews scheduled' },
          { value: 'no', label: 'No job offer yet' }
        ],
        required: true,
        helpText: 'Required for most work visas',
        icon: '📋'
      },
      employer: {
        type: 'text',
        label: 'Employer/Company Name',
        placeholder: 'e.g., Microsoft Corporation',
        required: false,
        helpText: 'Name of the company offering employment',
        icon: '🏢'
      },
      salary: {
        type: 'text',
        label: 'Annual Salary (USD)',
        placeholder: 'e.g., $80,000',
        required: false
      },
      // Study-specific fields
      institution: {
        type: 'text',
        label: 'Institution Name',
        placeholder: 'e.g., University of Toronto',
        required: false
      },
      program: {
        type: 'text',
        label: 'Program of Study',
        placeholder: 'e.g., Computer Science',
        required: false
      },
      tuition: {
        type: 'text',
        label: 'Annual Tuition (USD)',
        placeholder: 'e.g., $15,000',
        required: false
      },
      // Home ties and strong connections (CRITICAL for visa approval)
      propertyOwnership: {
        type: 'select',
        label: 'Property Ownership in Home Country',
        options: [
          { value: 'select_property', label: 'Select property status...' },
          { value: 'owned_home', label: 'Own Home/Residence' },
          { value: 'owned_property', label: 'Own Investment Property' },
          { value: 'renting', label: 'Renting (with lease)' },
          { value: 'family_home', label: 'Living with Family' },
          { value: 'no_property', label: 'No Property Ownership' }
        ],
        required: false,
        helpText: 'Shows ties to home country (important for visitor visas)',
        icon: '🏠'
      },
      familyInHomeCountry: {
        type: 'select',
        label: 'Family Ties in Home Country',
        options: [
          { value: 'select_family', label: 'Select family situation...' },
          { value: 'spouse_children', label: 'Spouse and Children' },
          { value: 'parents_siblings', label: 'Parents and Siblings' },
          { value: 'extended_family', label: 'Extended Family' },
          { value: 'no_family', label: 'No Family in Home Country' }
        ],
        required: false,
        helpText: 'Strong family ties reduce overstay risk',
        icon: '👨‍👩‍👧‍👦'
      },
      employmentInHomeCountry: {
        type: 'select',
        label: 'Employment Status in Home Country',
        options: [
          { value: 'select_employment', label: 'Select employment status...' },
          { value: 'permanent_job', label: 'Permanent Full-time Job' },
          { value: 'contract_job', label: 'Contract/Temporary Job' },
          { value: 'self_employed', label: 'Self-Employed' },
          { value: 'business_owner', label: 'Business Owner' },
          { value: 'unemployed', label: 'Currently Unemployed' },
          { value: 'student', label: 'Full-time Student' },
          { value: 'retired', label: 'Retired' }
        ],
        required: false,
        helpText: 'Stable employment shows strong home ties',
        icon: '💼'
      },
      businessInHomeCountry: {
        type: 'select',
        label: 'Business in Home Country',
        options: [
          { value: 'select_business', label: 'Select...' },
          { value: 'own_business', label: 'Own Business' },
          { value: 'family_business', label: 'Family Business' },
          { value: 'partnership', label: 'Business Partnership' },
          { value: 'no_business', label: 'No Business' }
        ],
        required: false
      },
      bankAccountsHomeCountry: {
        type: 'select',
        label: 'Bank Accounts in Home Country',
        options: [
          { value: 'select_bank_accounts', label: 'Select...' },
          { value: 'multiple_accounts', label: 'Multiple Accounts' },
          { value: 'savings_account', label: 'Savings Account' },
          { value: 'checking_account', label: 'Checking Account' },
          { value: 'no_accounts', label: 'No Accounts' }
        ],
        required: false
      },
      previousTravelHistory: {
        type: 'select',
        label: 'International Travel History',
        options: [
          { value: 'select_travel', label: 'Select travel experience...' },
          { value: 'extensive_travel', label: 'Extensive Travel (5+ countries)' },
          { value: 'some_travel', label: 'Some Travel (2-4 countries)' },
          { value: 'limited_travel', label: 'Limited Travel (1-2 countries)' },
          { value: 'no_travel', label: 'No International Travel' }
        ],
        required: false,
        helpText: 'Previous travel shows compliance with visa requirements',
        icon: '✈️'
      },
      returnTicket: {
        type: 'select',
        label: 'Return Travel Arrangements',
        options: [
          { value: 'select_return_ticket', label: 'Select return ticket status...' },
          { value: 'confirmed_return', label: 'Confirmed Return Ticket' },
          { value: 'flexible_return', label: 'Flexible Return Ticket' },
          { value: 'one_way', label: 'One-Way Ticket Only' },
          { value: 'no_ticket', label: 'Not Booked Yet' }
        ],
        required: false,
        helpText: 'Return ticket shows intention to leave (critical for visitor visas)',
        icon: '🎫'
      },
      accommodationProof: {
        type: 'select',
        label: 'Accommodation Arrangements',
        options: [
          { value: 'select_accommodation', label: 'Select accommodation type...' },
          { value: 'hotel_booking', label: 'Hotel Booking Confirmed' },
          { value: 'friend_family', label: 'Staying with Family/Friends' },
          { value: 'rental_agreement', label: 'Rental Agreement' },
          { value: 'university_housing', label: 'University Housing' },
          { value: 'no_proof', label: 'No Accommodation Arranged' }
        ],
        required: false,
        helpText: 'Proof of accommodation is required for most visas',
        icon: '🏨'
      },
      criminalRecord: {
        type: 'select',
        label: 'Criminal Record Status',
        options: [
          { value: 'select_criminal', label: 'Select criminal record status...' },
          { value: 'no_record', label: 'No Criminal Record' },
          { value: 'minor_offense', label: 'Minor Offense (traffic, etc.)' },
          { value: 'serious_offense', label: 'Serious Criminal Offense' }
        ],
        required: false,
        helpText: 'Criminal history affects visa eligibility',
        icon: '⚖️'
      },
      previousVisaRejections: {
        type: 'select',
        label: 'Previous Visa Rejections',
        options: [
          { value: 'select_placeholder', label: 'Select...' },
          { value: 'no_rejections', label: 'No Previous Rejections' },
          { value: 'one_rejection', label: 'One Previous Rejection' },
          { value: 'multiple_rejections', label: 'Multiple Rejections' },
          { value: 'prefer_not_to_say', label: 'Prefer Not to Say' }
        ],
        required: false
      },
      healthInsurance: {
        type: 'select',
        label: 'Health Insurance',
        options: [
          { value: 'select_placeholder', label: 'Select...' },
          { value: 'comprehensive', label: 'Comprehensive Coverage' },
          { value: 'basic_coverage', label: 'Basic Coverage' },
          { value: 'travel_insurance', label: 'Travel Insurance Only' },
          { value: 'no_insurance', label: 'No Insurance' }
        ],
        required: false
      },
      sponsorRelationship: {
        type: 'select',
        label: 'Relationship to Sponsor',
        options: [
          { value: 'select_placeholder', label: 'Select...' },
          { value: 'spouse', label: 'Spouse' },
          { value: 'fiance', label: 'Fiancé/Fiancée' },
          { value: 'parent', label: 'Parent' },
          { value: 'child', label: 'Child' },
          { value: 'sibling', label: 'Sibling' },
          { value: 'friend', label: 'Friend' },
          { value: 'no_sponsor', label: 'No Sponsor' }
        ],
        required: false
      }
    };

    return relevantQuestions.map((fieldName) => {
      const config = fieldConfigs[fieldName];
      if (!config) return null;

      const { type, label, placeholder, options, required, helpText, icon } = config;

      if (type === 'select') {
        return (
          <div key={fieldName} className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              {icon && <span className="text-lg">{icon}</span>}
              <span>{label} {required && <span className="text-red-500">*</span>}</span>
            </label>
            {helpText && (
              <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded-md border-l-2 border-blue-200">
                {helpText}
              </p>
            )}
            <select
              name={fieldName}
              value={formData[fieldName as keyof typeof formData] || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required={required}
            >
              {options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      }

      return (
        <div key={fieldName} className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            {icon && <span className="text-lg">{icon}</span>}
            <span>{label} {required && <span className="text-red-500">*</span>}</span>
          </label>
          {helpText && (
            <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded-md border-l-2 border-blue-200">
              {helpText}
            </p>
          )}
          <Input
            type={type}
            name={fieldName}
            value={formData[fieldName as keyof typeof formData] || ''}
            onChange={handleInputChange}
            placeholder={placeholder}
            required={required}
            className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      );
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Reset visa type when country changes
    if (name === 'targetCountry') {
      const newVisaTypes = getVisaTypes(value);
      setFormData({ 
        ...formData, 
        [name]: value,
        visaType: newVisaTypes[0]?.value || 'study_permit'
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCheck = async () => {
    if (!formData.targetCountry || !formData.visaType) {
      alert('Please select target country and visa type');
      return;
    }

    console.log('Form data being sent:', formData);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/check-eligibility`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        alert(data.message || 'Failed to check eligibility');
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      alert('Failed to check eligibility. Please check your OpenAI API key in backend .env');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'from-green-50 to-emerald-50 border-green-200';
    if (score >= 50) return 'from-yellow-50 to-amber-50 border-yellow-200';
    return 'from-red-50 to-rose-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Professional Visa Assessment Tool</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <CheckCircle className="w-10 h-10 text-blue-600" />
              <span>Visa Eligibility Checker</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Professional-grade visa assessment tool used by travel agents and immigration consultants. 
              Get instant, accurate eligibility analysis with real-world requirements and risk assessment.
            </p>
            
            {/* Progress Indicator */}
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Step 1: Select Country & Visa</span>
                <span>Step 2: Complete Profile</span>
                <span>Step 3: Get Assessment</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all duration-500 ${
                  formData.targetCountry && formData.visaType ? 'w-2/3 bg-blue-600' : 
                  formData.targetCountry ? 'w-1/3 bg-blue-400' : 'w-0 bg-blue-200'
                }`}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">📋</span>
                <span>Complete Your Profile</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Provide accurate information for the most reliable assessment. 
                All fields marked with * are required.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Country</label>
                  <select
                    name="targetCountry"
                    value={formData.targetCountry}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="canada">Canada</option>
                    <option value="usa">USA</option>
                    <option value="uk">UK</option>
                    <option value="australia">Australia</option>
                    <option value="germany">Germany</option>
                    <option value="ireland">Ireland</option>
                    <option value="schengen">Schengen Area</option>
                    <option value="new_zealand">New Zealand</option>
                    <option value="singapore">Singapore</option>
                    <option value="uae">UAE</option>
                    <option value="netherlands">Netherlands</option>
                    <option value="japan">Japan</option>
                    <option value="south_korea">South Korea</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visa Type</label>
                  <select
                    name="visaType"
                    value={formData.visaType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {getVisaTypes(formData.targetCountry).map((visa) => (
                      <option key={visa.value} value={visa.value}>
                        {visa.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic form fields based on visa type */}
              {renderFormFields()}

              <Button
                onClick={handleCheck}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Check Eligibility
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="lg:sticky lg:top-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">📊</span>
                <span>Professional Assessment</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                AI-powered analysis with real-world visa requirements and risk assessment
              </p>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  {/* Professional Assessment */}
                  <div className={`p-6 rounded-xl border bg-gradient-to-r ${getScoreBg(result.score)}`}>
                    <div className="text-center mb-4">
                      <div className={`text-5xl font-bold ${getScoreColor(result.score)} mb-2`}>
                        {result.eligibilityPercentage || result.score}%
                      </div>
                      <div className="text-sm text-gray-700 font-medium mb-2">Eligibility Probability</div>
                      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                        result.eligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.eligible ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-semibold">Eligible</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-semibold">Needs Improvement</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Professional Metrics */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {result.confidenceLevel && (
                        <div className="text-center p-3 bg-white/50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-800">
                            {result.confidenceLevel === 'High' ? '🟢' : result.confidenceLevel === 'Medium' ? '🟡' : '🔴'}
                          </div>
                          <div className="text-xs text-gray-600">Confidence</div>
                          <div className="text-sm font-medium">{result.confidenceLevel}</div>
                        </div>
                      )}
                      {result.processingTime && (
                        <div className="text-center p-3 bg-white/50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-800">⏱️</div>
                          <div className="text-xs text-gray-600">Processing Time</div>
                          <div className="text-sm font-medium">{result.processingTime}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Agent Action */}
                  {result.agentAction && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-2">
                        <div className="text-2xl">💼</div>
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">Agent Recommendation</h4>
                          <p className="text-sm text-blue-800 font-medium">{result.agentAction}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Red Flags */}
                  {result.redFlags && result.redFlags.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start space-x-2">
                        <div className="text-2xl">⚠️</div>
                        <div>
                          <h4 className="font-semibold text-red-900 mb-2">High Risk Factors</h4>
                          <ul className="space-y-1">
                            {result.redFlags.map((flag: string, idx: number) => (
                              <li key={idx} className="text-sm text-red-800 flex items-start space-x-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>{flag}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Specific Improvements Needed */}
                  {result.improvementsNeeded && result.improvementsNeeded.length > 0 && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start space-x-2">
                        <div className="text-2xl">📈</div>
                        <div>
                          <h4 className="font-semibold text-yellow-900 mb-2">Specific Improvements Needed</h4>
                          <ul className="space-y-1">
                            {result.improvementsNeeded.map((improvement: string, idx: number) => (
                              <li key={idx} className="text-sm text-yellow-800 flex items-start space-x-2">
                                <span className="text-yellow-600 mt-1">•</span>
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analysis */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">AI Analysis</h4>
                        <p className="text-sm text-blue-800">{result.analysis}</p>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {result.recommendations && result.recommendations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        <span>How to Improve</span>
                      </h4>
                      <div className="space-y-2">
                        {result.recommendations.map((rec: string, idx: number) => (
                          <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-start space-x-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-blue-600">{idx + 1}</span>
                              </div>
                              <p className="text-sm text-gray-800">{rec}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ProofKit Upsell for Family/Marriage Visas */}
                  {(formData.visaType?.includes('family') || 
                    formData.visaType?.includes('marriage') || 
                    formData.visaType?.includes('spouse') ||
                    formData.visaType?.includes('partner') ||
                    formData.visaType?.includes('de_facto')) && (
                    <div className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-pink-900 mb-2">
                            🎯 Need Help Organizing Your Relationship Evidence?
                          </h4>
                          <p className="text-pink-800 text-sm mb-4">
                            Our <strong>Relationship Proof Kit</strong> helps you organize marriage/family visa documents professionally. 
                            Get AI-powered photo analysis, document quality checks, and submission-ready packages.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Link href="/documents/proofkit">
                              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white">
                                <Heart className="w-4 h-4 mr-2" />
                                Start Proof Kit
                              </Button>
                            </Link>
                            <Link href="/subscription">
                              <Button variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50">
                                <Star className="w-4 h-4 mr-2" />
                                Upgrade to Professional
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Feedback Widget */}
                  <FeedbackWidget
                    documentId={`visa_check_${Date.now()}`}
                    documentType="visa_check"
                    country={formData.targetCountry}
                    visaType={formData.visaType}
                  />
                  
                  {/* Success Tracker */}
                  <SuccessTracker
                    documentId={`visa_check_${Date.now()}`}
                    country={formData.targetCountry}
                    visaType={formData.visaType}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Assessment Yet</h4>
                  <p className="text-gray-600 text-sm">Fill in your profile and click "Check Eligibility"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


