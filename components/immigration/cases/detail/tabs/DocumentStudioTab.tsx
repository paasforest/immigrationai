'use client';

import React, { useState, useCallback } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { ImmigrationCase } from '@/types/immigration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FileText,
  Wand2,
  Copy,
  Download,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Lightbulb,
  Upload,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface DocType {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: 'ai_generated' | 'client_required';
  requiredFields: FormField[];
  generate?: (caseData: ImmigrationCase, form: Record<string, string>) => Promise<string>;
  guidanceNote?: string;
  uploadNote?: string;
}

interface FormField {
  key: string;
  label: string;
  type: 'input' | 'textarea' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
  autoFill?: (caseData: ImmigrationCase) => string;
  required?: boolean;
  hint?: string;
}

interface DocumentStudioTabProps {
  caseData: ImmigrationCase;
  caseId: string;
  onRefresh: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Document type definitions
// ─────────────────────────────────────────────────────────────────────────────

const AI_DOC_TYPES: DocType[] = [
  {
    id: 'sop',
    label: 'Statement of Purpose',
    description: 'Personal statement explaining goals, background and reasons for application',
    icon: '📝',
    category: 'ai_generated',
    requiredFields: [
      { key: 'fullName', label: 'Applicant Full Name', type: 'input', required: true, autoFill: (c) => c.applicant?.fullName || '' },
      { key: 'currentCountry', label: 'Current Country', type: 'input', required: true, autoFill: (c) => c.originCountry || '' },
      { key: 'targetCountry', label: 'Destination Country', type: 'input', required: true, autoFill: (c) => c.destinationCountry || '' },
      { key: 'institution', label: 'Institution / Embassy / Company', type: 'input', required: true, placeholder: 'e.g. University of Edinburgh' },
      { key: 'program', label: 'Programme / Role', type: 'input', placeholder: 'e.g. MSc Computer Science' },
      { key: 'background', label: 'Academic / Professional Background', type: 'textarea', placeholder: 'Briefly describe education and work experience', hint: 'More detail = better output' },
      { key: 'motivation', label: 'Motivation & Reasons', type: 'textarea', placeholder: 'Why this country, institution, or opportunity?' },
      { key: 'careerGoals', label: 'Career Goals', type: 'textarea', placeholder: 'What do you plan to do after?' },
    ],
    async generate(caseData, form) {
      const res = await immigrationApi.generateSOP({
        fullName: form.fullName,
        currentCountry: form.currentCountry,
        targetCountry: form.targetCountry,
        institution: form.institution,
        program: form.program,
        purpose: caseData.visaType || 'visa application',
        background: form.background,
        motivation: form.motivation,
        careerGoals: form.careerGoals,
      });
      if (!res.success) throw new Error(res.error || 'Generation failed');
      return res.data!.content;
    },
  },
  {
    id: 'cover_letter',
    label: 'Cover Letter',
    description: 'Formal letter addressed to the consulate / embassy',
    icon: '✉️',
    category: 'ai_generated',
    requiredFields: [
      { key: 'applicantName', label: 'Applicant Full Name', type: 'input', required: true, autoFill: (c) => c.applicant?.fullName || '' },
      { key: 'targetCountry', label: 'Destination Country', type: 'input', required: true, autoFill: (c) => c.destinationCountry || '' },
      { key: 'visaType', label: 'Visa Type', type: 'input', required: true, autoFill: (c) => c.visaType || '' },
      { key: 'purpose', label: 'Purpose of Application', type: 'textarea', required: true, placeholder: 'e.g. Applying for student visa to pursue MSc at...' },
      { key: 'employerOrInstitution', label: 'Employer / Institution', type: 'input', placeholder: 'If applicable' },
      { key: 'additionalContext', label: 'Additional Context', type: 'textarea', placeholder: 'Anything specific to mention in the letter' },
    ],
    async generate(_caseData, form) {
      const res = await immigrationApi.generateCoverLetter({
        applicantName: form.applicantName,
        targetCountry: form.targetCountry,
        visaType: form.visaType,
        purpose: form.purpose,
        employerOrInstitution: form.employerOrInstitution,
        additionalContext: form.additionalContext,
      });
      if (!res.success) throw new Error(res.error || 'Generation failed');
      return res.data!.content;
    },
  },
  {
    id: 'motivation_letter',
    label: 'Motivation Letter',
    description: 'Personal statement explaining drive and suitability for the opportunity',
    icon: '💡',
    category: 'ai_generated',
    requiredFields: [
      { key: 'applicantName', label: 'Applicant Full Name', type: 'input', required: true, autoFill: (c) => c.applicant?.fullName || '' },
      { key: 'targetCountry', label: 'Destination Country', type: 'input', required: true, autoFill: (c) => c.destinationCountry || '' },
      { key: 'visaType', label: 'Visa Type', type: 'input', autoFill: (c) => c.visaType || '' },
      { key: 'institution', label: 'Institution / Organisation', type: 'input', placeholder: 'e.g. Amsterdam Business School' },
      { key: 'program', label: 'Programme / Role', type: 'input' },
      { key: 'motivation', label: 'Motivation & Reasons', type: 'textarea', required: true, placeholder: 'Why this opportunity? What drove you here?' },
      { key: 'background', label: 'Your Background', type: 'textarea', placeholder: 'Relevant experience, skills, achievements' },
    ],
    async generate(_caseData, form) {
      const res = await immigrationApi.generateMotivationLetter({
        applicantName: form.applicantName,
        targetCountry: form.targetCountry,
        visaType: form.visaType,
        institution: form.institution,
        program: form.program,
        motivation: form.motivation,
        background: form.background,
      });
      if (!res.success) throw new Error(res.error || 'Generation failed');
      return res.data!.content;
    },
  },
  {
    id: 'sponsor_letter',
    label: 'Sponsor / Financial Support Letter',
    description: 'Letter from a financial sponsor confirming support for the applicant',
    icon: '🤝',
    category: 'ai_generated',
    requiredFields: [
      { key: 'applicantName', label: 'Applicant Full Name', type: 'input', required: true, autoFill: (c) => c.applicant?.fullName || '' },
      { key: 'destinationCountry', label: 'Destination Country', type: 'input', required: true, autoFill: (c) => c.destinationCountry || '' },
      { key: 'visaType', label: 'Visa Type', type: 'input', autoFill: (c) => c.visaType || '' },
      { key: 'sponsorName', label: 'Sponsor Full Name', type: 'input', required: true },
      { key: 'sponsorRelationship', label: 'Relationship to Applicant', type: 'input', required: true, placeholder: 'e.g. Father, Uncle, Employer' },
      { key: 'sponsorOccupation', label: 'Sponsor Occupation', type: 'input', required: true },
      { key: 'sponsorCountry', label: 'Sponsor Country', type: 'input', required: true },
      { key: 'travelPurpose', label: 'Purpose of Travel', type: 'input', required: true, placeholder: 'e.g. Study, Tourism, Work' },
      { key: 'travelDuration', label: 'Duration of Stay', type: 'input', required: true, placeholder: 'e.g. 2 years, 3 months' },
    ],
    async generate(_caseData, form) {
      const res = await immigrationApi.generateSponsorLetterForCase({
        applicantName: form.applicantName,
        destinationCountry: form.destinationCountry,
        visaType: form.visaType,
        sponsorName: form.sponsorName,
        sponsorRelationship: form.sponsorRelationship,
        sponsorOccupation: form.sponsorOccupation,
        sponsorCountry: form.sponsorCountry,
        travelPurpose: form.travelPurpose,
        travelDuration: form.travelDuration,
      });
      if (!res.success) throw new Error(res.error || 'Generation failed');
      return res.data!.content;
    },
  },
  {
    id: 'financial_letter',
    label: 'Financial Justification Letter',
    description: 'Letter explaining the source and adequacy of funds for the visa',
    icon: '💰',
    category: 'ai_generated',
    requiredFields: [
      { key: 'applicantName', label: 'Applicant Full Name', type: 'input', required: true, autoFill: (c) => c.applicant?.fullName || '' },
      { key: 'targetCountry', label: 'Destination Country', type: 'input', required: true, autoFill: (c) => c.destinationCountry || '' },
      { key: 'visaType', label: 'Visa Type', type: 'input', autoFill: (c) => c.visaType || '' },
      { key: 'availableFunds', label: 'Available Funds', type: 'input', required: true, placeholder: 'e.g. R150,000 / $8,000' },
      { key: 'sourceOfFunds', label: 'Source of Funds', type: 'input', required: true, placeholder: 'e.g. Salary savings, business income, sponsor' },
      { key: 'currency', label: 'Currency', type: 'input', placeholder: 'ZAR, USD, GBP' },
      { key: 'additionalContext', label: 'Additional Context', type: 'textarea', placeholder: 'Any other financial details to include' },
    ],
    async generate(_caseData, form) {
      const res = await immigrationApi.generateFinancialLetter({
        applicantName: form.applicantName,
        targetCountry: form.targetCountry,
        visaType: form.visaType,
        availableFunds: form.availableFunds,
        sourceOfFunds: form.sourceOfFunds,
        currency: form.currency,
        additionalContext: form.additionalContext,
      });
      if (!res.success) throw new Error(res.error || 'Generation failed');
      return res.data!.content;
    },
  },
  {
    id: 'purpose_of_visit',
    label: 'Purpose of Visit',
    description: 'Detailed explanation of the reason for entry and planned activities',
    icon: '🗺️',
    category: 'ai_generated',
    requiredFields: [
      { key: 'applicantName', label: 'Applicant Full Name', type: 'input', required: true, autoFill: (c) => c.applicant?.fullName || '' },
      { key: 'targetCountry', label: 'Destination Country', type: 'input', required: true, autoFill: (c) => c.destinationCountry || '' },
      { key: 'visaType', label: 'Visa Type', type: 'input', autoFill: (c) => c.visaType || '' },
      { key: 'visitPurpose', label: 'Visit Purpose', type: 'textarea', required: true, placeholder: 'Explain in detail what you will be doing' },
      { key: 'duration', label: 'Duration of Stay', type: 'input', required: true, placeholder: 'e.g. 6 months, 2 weeks' },
      { key: 'additionalContext', label: 'Additional Details', type: 'textarea', placeholder: 'Events, meetings, institutions you will visit' },
    ],
    async generate(_caseData, form) {
      const res = await immigrationApi.generatePurposeOfVisit({
        applicantName: form.applicantName,
        targetCountry: form.targetCountry,
        visaType: form.visaType,
        visitPurpose: form.visitPurpose,
        duration: form.duration,
        additionalContext: form.additionalContext,
      });
      if (!res.success) throw new Error(res.error || 'Generation failed');
      return res.data!.content;
    },
  },
  {
    id: 'ties_to_home',
    label: 'Ties to Home Country',
    description: 'Statement demonstrating strong reasons to return home after the visit',
    icon: '🏠',
    category: 'ai_generated',
    requiredFields: [
      { key: 'applicantName', label: 'Applicant Full Name', type: 'input', required: true, autoFill: (c) => c.applicant?.fullName || '' },
      { key: 'targetCountry', label: 'Destination Country', type: 'input', required: true, autoFill: (c) => c.destinationCountry || '' },
      { key: 'homeCountry', label: 'Home Country', type: 'input', required: true, autoFill: (c) => c.originCountry || '' },
      { key: 'visaType', label: 'Visa Type', type: 'input', autoFill: (c) => c.visaType || '' },
      { key: 'employment', label: 'Employment / Business at Home', type: 'input', placeholder: 'e.g. Software engineer at ABC Corp' },
      { key: 'family', label: 'Family Ties', type: 'input', placeholder: 'e.g. Spouse, children, parents living in home country' },
      { key: 'property', label: 'Property / Assets', type: 'input', placeholder: 'e.g. Homeowner, car, business assets' },
      { key: 'additionalContext', label: 'Other Ties', type: 'textarea', placeholder: 'Community involvement, ongoing studies, contracts, etc.' },
    ],
    async generate(_caseData, form) {
      const res = await immigrationApi.generateTiesToHomeCountry({
        applicantName: form.applicantName,
        targetCountry: form.targetCountry,
        visaType: form.visaType,
        homeCountry: form.homeCountry,
        employment: form.employment,
        family: form.family,
        property: form.property,
        additionalContext: form.additionalContext,
      });
      if (!res.success) throw new Error(res.error || 'Generation failed');
      return res.data!.content;
    },
  },
  {
    id: 'travel_itinerary',
    label: 'Travel Itinerary',
    description: 'Structured day-by-day travel plan for visa submission',
    icon: '✈️',
    category: 'ai_generated',
    requiredFields: [
      { key: 'applicantName', label: 'Applicant Full Name', type: 'input', required: true, autoFill: (c) => c.applicant?.fullName || '' },
      { key: 'targetCountry', label: 'Destination Country', type: 'input', required: true, autoFill: (c) => c.destinationCountry || '' },
      { key: 'visaType', label: 'Visa Type', type: 'input', autoFill: (c) => c.visaType || '' },
      { key: 'travelDates', label: 'Travel Dates', type: 'input', required: true, placeholder: 'e.g. 1 March 2025 – 15 March 2025' },
      { key: 'cities', label: 'Cities to Visit', type: 'input', required: true, placeholder: 'e.g. London, Manchester, Edinburgh' },
      { key: 'purpose', label: 'Purpose', type: 'input', required: true, placeholder: 'e.g. Tourism, business meetings, family visit' },
      { key: 'accommodation', label: 'Accommodation', type: 'input', placeholder: 'e.g. Hilton London, staying with family' },
      { key: 'additionalContext', label: 'Additional Details', type: 'textarea', placeholder: 'Specific events, meetings, activities' },
    ],
    async generate(_caseData, form) {
      const res = await immigrationApi.generateTravelItinerary({
        applicantName: form.applicantName,
        targetCountry: form.targetCountry,
        visaType: form.visaType,
        travelDates: form.travelDates,
        cities: form.cities,
        purpose: form.purpose,
        accommodation: form.accommodation,
        additionalContext: form.additionalContext,
      });
      if (!res.success) throw new Error(res.error || 'Generation failed');
      return res.data!.content;
    },
  },
];

const CLIENT_REQUIRED_DOCS = [
  {
    id: 'bank_statements',
    label: 'Bank Statements',
    icon: '🏦',
    guidance: '3–6 months of statements. Balance must meet destination-country threshold.',
    tip: 'Ensure statements are stamped/certified by the bank.',
  },
  {
    id: 'degree',
    label: 'Degree / Diploma Copies',
    icon: '🎓',
    guidance: 'Certified copies of all academic qualifications.',
    tip: 'May require SAQA evaluation or apostille depending on destination.',
  },
  {
    id: 'police_clearance',
    label: 'Police Clearance Certificate',
    icon: '🛡️',
    guidance: 'Issued by national police service. Takes 7–21 days.',
    tip: 'South Africa: saps.gov.za/clearance. Valid for 3–6 months.',
  },
  {
    id: 'passport',
    label: 'Passport Copy',
    icon: '🛂',
    guidance: 'Clear photo of the bio-data page plus any visa/stamp pages.',
    tip: 'Passport must be valid for at least 6 months beyond return date.',
  },
  {
    id: 'proof_of_accommodation',
    label: 'Proof of Accommodation',
    icon: '🏠',
    guidance: 'Hotel booking confirmation or host invitation letter.',
    tip: 'Must show full address and dates of stay.',
  },
  {
    id: 'medical_certificate',
    label: 'Medical / TB Certificate',
    icon: '🏥',
    guidance: 'Required for some countries (UK, Canada for long stays).',
    tip: 'Must be issued by an approved panel physician.',
  },
  {
    id: 'employment_letter',
    label: 'Employment / NOC Letter',
    icon: '💼',
    guidance: 'Letter from employer confirming position, salary, and leave approval.',
    tip: 'Must be on company letterhead and signed by HR/director.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DocumentStudioTab({
  caseData,
  caseId,
  onRefresh,
}: DocumentStudioTabProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocType | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [improveInstructions, setImproveInstructions] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Select a document type and auto-fill known fields from case ──────────
  const handleSelectDoc = useCallback(
    (doc: DocType) => {
      setSelectedDoc(doc);
      setGeneratedContent('');
      setError(null);
      setSavedSuccessfully(false);
      setImproveInstructions('');

      // Auto-fill fields from caseData
      const auto: Record<string, string> = {};
      doc.requiredFields.forEach((f) => {
        if (f.autoFill) {
          const val = f.autoFill(caseData);
          if (val) auto[f.key] = val;
        }
      });
      setFormValues(auto);
    },
    [caseData]
  );

  // ── Validate required fields ─────────────────────────────────────────────
  const missingRequired = selectedDoc?.requiredFields
    .filter((f) => f.required && !formValues[f.key]?.trim())
    .map((f) => f.label) ?? [];

  // ── Generate document ────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!selectedDoc?.generate) return;
    if (missingRequired.length > 0) {
      toast.error(`Please fill in: ${missingRequired.join(', ')}`);
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setGeneratedContent('');
      setSavedSuccessfully(false);

      const content = await selectedDoc.generate(caseData, formValues);
      setGeneratedContent(content);
      toast.success(`${selectedDoc.label} generated`);
    } catch (err: any) {
      const msg = err.message || 'Generation failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Improve with AI ──────────────────────────────────────────────────────
  const handleImprove = async () => {
    if (!generatedContent || !selectedDoc) return;
    if (!improveInstructions.trim()) {
      toast.error('Please describe what you want improved');
      return;
    }

    try {
      setIsImproving(true);
      const res = await immigrationApi.improveGeneratedDocument({
        documentType: selectedDoc.label,
        currentContent: generatedContent,
        visaType: formValues.visaType || caseData.visaType || '',
        destinationCountry: formValues.targetCountry || formValues.destinationCountry || caseData.destinationCountry || '',
        originCountry: formValues.currentCountry || formValues.homeCountry || caseData.originCountry || '',
        instructions: improveInstructions,
      });
      if (res.success && res.data?.improvedVersion) {
        setGeneratedContent(res.data.improvedVersion);
        setImproveInstructions('');
        toast.success('Document improved');
      } else {
        throw new Error(res.error || 'Improvement failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Improvement failed');
    } finally {
      setIsImproving(false);
    }
  };

  // ── Copy to clipboard ────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Copied to clipboard');
  };

  // ── Download as .txt ─────────────────────────────────────────────────────
  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ref = caseData.referenceNumber.replace('/', '-');
    a.href = url;
    a.download = `${ref}-${selectedDoc?.id || 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // ── Save to case documents ────────────────────────────────────────────────
  const handleSaveToCase = async () => {
    if (!generatedContent || !selectedDoc) return;

    try {
      setIsSaving(true);
      const blob = new Blob([generatedContent], { type: 'text/plain;charset=utf-8' });
      const ref = caseData.referenceNumber.replace('/', '-');
      const fileName = `${ref}-${selectedDoc.id}-draft.txt`;
      const file = new File([blob], fileName, { type: 'text/plain' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('caseId', caseId);
      formData.append('name', `${selectedDoc.label} (AI Draft)`);
      formData.append('category', 'ai_generated');

      const res = await immigrationApi.uploadDocument(formData);
      if (res.success) {
        setSavedSuccessfully(true);
        toast.success('Saved to case documents');
        onRefresh();
      } else {
        throw new Error(res.error || 'Save failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      {/* ── Left panel: document type selector ─────────────────────────── */}
      <div className="space-y-4">
        {/* AI-Generated section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="w-4 h-4 text-[#0F2557]" />
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              AI-Generated
            </h3>
          </div>
          <div className="space-y-1.5">
            {AI_DOC_TYPES.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleSelectDoc(doc)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2.5 group',
                  selectedDoc?.id === doc.id
                    ? 'bg-[#0F2557] text-white shadow-sm'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                )}
              >
                <span className="text-base flex-shrink-0">{doc.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn('font-medium truncate', selectedDoc?.id === doc.id ? 'text-white' : 'text-gray-900')}>
                    {doc.label}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    'w-4 h-4 flex-shrink-0 transition-transform',
                    selectedDoc?.id === doc.id ? 'text-white' : 'text-gray-400 group-hover:translate-x-0.5'
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Client-required section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Upload className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wide">
              Client Must Provide
            </h3>
          </div>
          <div className="space-y-1.5">
            {CLIENT_REQUIRED_DOCS.map((doc) => (
              <TooltipProvider key={doc.id} delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-amber-50 text-amber-800 cursor-help">
                      <span className="text-base flex-shrink-0">{doc.icon}</span>
                      <p className="text-sm font-medium flex-1">{doc.label}</p>
                      <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[220px]">
                    <p className="font-medium mb-1">{doc.guidance}</p>
                    <p className="text-xs text-gray-500">{doc.tip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          <p className="text-xs text-amber-600 mt-2 flex items-start gap-1">
            <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Hover to see guidance for each document
          </p>
        </div>
      </div>

      {/* ── Right panel: generation workspace ──────────────────────────── */}
      <div>
        {!selectedDoc ? (
          <Card className="h-full">
            <CardContent className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-[#0F2557]/10 flex items-center justify-center mb-4">
                <Wand2 className="w-8 h-8 text-[#0F2557]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Studio</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                Select a document type on the left to generate a professional AI draft in seconds.
                Case details are auto-filled from the case record.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span>{selectedDoc.icon}</span>
                  {selectedDoc.label}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">{selectedDoc.description}</p>
              </div>
              {generatedContent && (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Draft ready
                </Badge>
              )}
            </div>

            {/* Context Form */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Context
                  <span className="text-xs text-gray-400 font-normal ml-1">
                    (pre-filled from case record where available)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDoc.requiredFields.map((field) => (
                    <div
                      key={field.key}
                      className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                    >
                      <Label className="flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      {field.hint && (
                        <p className="text-xs text-gray-500 mb-1">{field.hint}</p>
                      )}
                      {field.type === 'textarea' ? (
                        <Textarea
                          className="mt-1 resize-none"
                          rows={3}
                          value={formValues[field.key] || ''}
                          onChange={(e) =>
                            setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          placeholder={field.placeholder}
                        />
                      ) : (
                        <Input
                          className="mt-1"
                          value={formValues[field.key] || ''}
                          onChange={(e) =>
                            setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          placeholder={field.placeholder}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {missingRequired.length > 0 && (
                  <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription className="text-sm">
                      Required: {missingRequired.join(' · ')}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || missingRequired.length > 0}
                  className="bg-[#0F2557] hover:bg-[#0a1d42] w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating…
                    </>
                  ) : generatedContent ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Draft
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Generated Output */}
            {generatedContent && (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        Generated Draft
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                          <Copy className="w-4 h-4 mr-1.5" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                          <Download className="w-4 h-4 mr-1.5" />
                          Download .txt
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveToCase}
                          disabled={isSaving || savedSuccessfully}
                          className={
                            savedSuccessfully
                              ? 'bg-green-600 hover:bg-green-600'
                              : 'bg-[#0F2557] hover:bg-[#0a1d42]'
                          }
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          ) : savedSuccessfully ? (
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          ) : (
                            <Save className="w-4 h-4 mr-1.5" />
                          )}
                          {savedSuccessfully ? 'Saved ✓' : isSaving ? 'Saving…' : 'Save to Case'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      className="min-h-[360px] font-mono text-sm leading-relaxed resize-y"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      You can edit the draft directly above before saving or downloading.
                    </p>
                  </CardContent>
                </Card>

                {/* Improve with AI */}
                <Card className="border-blue-100 bg-blue-50/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                      <Wand2 className="w-4 h-4" />
                      Improve with AI
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder={`e.g. "Make the tone more formal", "Add more detail about financial stability", "Shorten to one page", "Translate to French"`}
                      value={improveInstructions}
                      onChange={(e) => setImproveInstructions(e.target.value)}
                      rows={2}
                      className="resize-none bg-white"
                    />
                    <Button
                      onClick={handleImprove}
                      disabled={isImproving || !improveInstructions.trim()}
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      {isImproving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Improving…
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Apply Improvements
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
