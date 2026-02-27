import { AppError } from '../middleware/errorHandler';

export interface DocumentRequirement {
  name: string;
  required: boolean;
  description: string;
  category: 'client_upload' | 'system_generated';
  type?: string; // For system-generated docs
}

export interface VisaDocumentChecklist {
  visaType: string;
  destinationCountry: string;
  clientUploads: DocumentRequirement[];
  systemGenerated: DocumentRequirement[];
  processingTime: string;
  keyRequirements: string[];
}

export class VisaRulesService {
  private visaRules: Record<string, VisaDocumentChecklist> = {
    'uk_skilled_worker': {
      visaType: 'UK Skilled Worker Visa',
      destinationCountry: 'United Kingdom',
      processingTime: '3-8 weeks',
      keyRequirements: [
        'Certificate of Sponsorship (CoS) from licensed employer',
        'Job offer at required skill level (RQF 3+)',
        'English language proficiency (B1 level)',
        'Minimum salary threshold (£26,200 or going rate)',
      ],
      clientUploads: [
        {
          name: 'Certificate of Sponsorship (CoS)',
          required: true,
          description: 'Reference number from employer, usually 8 digits long',
          category: 'client_upload',
        },
        {
          name: 'Bank Statements (3 months)',
          required: true,
          description: 'Personal bank statements showing maintenance funds',
          category: 'client_upload',
        },
        {
          name: 'English Test Certificate',
          required: true,
          description: 'IELTS, Trinity, or approved English test results',
          category: 'client_upload',
        },
        {
          name: 'TB Test Certificate',
          required: true,
          description: 'Tuberculosis test from approved clinic',
          category: 'client_upload',
        },
        {
          name: 'Academic Qualifications',
          required: true,
          description: 'Degree certificates and transcripts',
          category: 'client_upload',
        },
        {
          name: 'Proof of Residence',
          required: false,
          description: 'Utility bills or rental agreement (if required)',
          category: 'client_upload',
        },
      ],
      systemGenerated: [
        {
          name: 'Statement of Purpose',
          required: false,
          description: 'Personal statement for visa application',
          category: 'system_generated',
          type: 'sop',
        },
        {
          name: 'Cover Letter',
          required: false,
          description: 'Visa application cover letter',
          category: 'system_generated',
          type: 'cover_letter',
        },
        {
          name: 'Document Checklist',
          required: false,
          description: 'Personalized document checklist',
          category: 'system_generated',
          type: 'checklist',
        },
      ],
    },
    'canada_express_entry': {
      visaType: 'Canada Express Entry (FSW)',
      destinationCountry: 'Canada',
      processingTime: '6-8 months',
      keyRequirements: [
        'Minimum 67 points out of 100',
        'English or French language proficiency (CLB 7)',
        'Educational Credential Assessment (ECA)',
        'Proof of funds (unless applying through CEC)',
      ],
      clientUploads: [
        {
          name: 'IELTS/TEF Test Results',
          required: true,
          description: 'Language proficiency test results',
          category: 'client_upload',
        },
        {
          name: 'Educational Credential Assessment (ECA)',
          required: true,
          description: 'WES or equivalent evaluation of foreign credentials',
          category: 'client_upload',
        },
        {
          name: 'Proof of Funds',
          required: true,
          description: 'Bank statements showing required settlement funds',
          category: 'client_upload',
        },
        {
          name: 'Police Clearance Certificate',
          required: true,
          description: 'Background check from all countries lived in',
          category: 'client_upload',
        },
        {
          name: 'Medical Examination Results',
          required: true,
          description: 'Immigration medical exam results',
          category: 'client_upload',
        },
        {
          name: 'Job Offer Letter (if applicable)',
          required: false,
          description: 'Valid job offer with LMIA (if applicable)',
          category: 'client_upload',
        },
        {
          name: 'Academic Transcripts',
          required: true,
          description: 'Official academic transcripts',
          category: 'client_upload',
        },
      ],
      systemGenerated: [
        {
          name: 'Statement of Purpose',
          required: false,
          description: 'Personal statement for Express Entry profile',
          category: 'system_generated',
          type: 'sop',
        },
        {
          name: 'Cover Letter',
          required: false,
          description: 'Application cover letter',
          category: 'system_generated',
          type: 'cover_letter',
        },
        {
          name: 'CRS Score Calculator',
          required: false,
          description: 'Comprehensive Ranking System score analysis',
          category: 'system_generated',
          type: 'crs_calculator',
        },
      ],
    },
    'usa_h1b': {
      visaType: 'USA H-1B Specialty Occupation',
      destinationCountry: 'United States',
      processingTime: '3-6 months (premium processing: 15 days)',
      keyRequirements: [
        'Bachelor\'s degree or equivalent',
        'Job offer in specialty occupation',
        'Employer filed Labor Condition Application (LCA)',
        'Prevailing wage determination',
      ],
      clientUploads: [
        {
          name: 'Passport',
          required: true,
          description: 'Valid passport copy',
          category: 'client_upload',
        },
        {
          name: 'Academic Transcripts',
          required: true,
          description: 'Official academic transcripts',
          category: 'client_upload',
        },
        {
          name: 'Degree Certificates',
          required: true,
          description: 'Academic degree certificates',
          category: 'client_upload',
        },
        {
          name: 'Financial Documents',
          required: true,
          description: 'Proof of financial support',
          category: 'client_upload',
        },
        {
          name: 'Job Offer Letter',
          required: false,
          description: 'Detailed employment offer letter',
          category: 'client_upload',
        },
        {
          name: 'Standardized Test Scores',
          required: false,
          description: 'GRE/GMAT/MCAT if applicable',
          category: 'client_upload',
        },
        {
          name: 'Resume/CV',
          required: true,
          description: 'Current resume or curriculum vitae',
          category: 'client_upload',
        },
      ],
      systemGenerated: [
        {
          name: 'Statement of Purpose',
          required: false,
          description: 'Personal statement for US visa',
          category: 'system_generated',
          type: 'sop',
        },
        {
          name: 'Cover Letter',
          required: false,
          description: 'Visa application cover letter',
          category: 'system_generated',
          type: 'cover_letter',
        },
        {
          name: 'Resume Enhancement',
          required: false,
          description: 'Optimized resume for US applications',
          category: 'system_generated',
          type: 'resume',
        },
      ],
    },
    'germany_blue_card': {
      visaType: 'Germany EU Blue Card',
      destinationCountry: 'Germany',
      processingTime: '2-4 weeks',
      keyRequirements: [
        'University degree or recognized qualification',
        'Job offer with minimum salary (€58,400 in 2023)',
        'German language proficiency (basic B1)',
        'Health insurance coverage',
      ],
      clientUploads: [
        {
          name: 'Degree Certificate',
          required: true,
          description: 'University degree or recognized qualification',
          category: 'client_upload',
        },
        {
          name: 'Job Contract',
          required: true,
          description: 'Employment contract with salary details',
          category: 'client_upload',
        },
        {
          name: 'Health Insurance',
          required: true,
          description: 'German health insurance coverage',
          category: 'client_upload',
        },
        {
          name: 'Language Certificate',
          required: false,
          description: 'German language proficiency certificate',
          category: 'client_upload',
        },
        {
          name: 'Academic Transcripts',
          required: true,
          description: 'Official academic transcripts',
          category: 'client_upload',
        },
        {
          name: 'Proof of Accommodation',
          required: false,
          description: 'Rental agreement or accommodation proof',
          category: 'client_upload',
        },
      ],
      systemGenerated: [
        {
          name: 'Statement of Purpose',
          required: false,
          description: 'Personal statement for Blue Card application',
          category: 'system_generated',
          type: 'sop',
        },
        {
          name: 'Cover Letter',
          required: false,
          description: 'Application cover letter',
          category: 'system_generated',
          type: 'cover_letter',
        },
        {
          name: 'Qualification Recognition',
          required: false,
          description: 'Analysis of degree recognition in Germany',
          category: 'system_generated',
          type: 'qualification',
        },
      ],
    },
  };

  getDocumentChecklist(visaType: string, destinationCountry?: string): VisaDocumentChecklist {
    // First try exact match
    if (this.visaRules[visaType]) {
      return this.visaRules[visaType];
    }

    // Try to infer from destination country
    if (destinationCountry) {
      const countryKey = destinationCountry.toLowerCase().replace(/\s+/g, '_');
      for (const [key, rule] of Object.entries(this.visaRules)) {
        if (rule.destinationCountry.toLowerCase().replace(/\s+/g, '_') === countryKey) {
          return rule;
        }
      }
    }

    // Default fallback
    return this.visaRules['uk_skilled_worker'];
  }

  getAllSupportedVisas(): Array<{ visaType: string; destinationCountry: string; description: string }> {
    return Object.entries(this.visaRules).map(([key, rule]) => ({
      visaType: key,
      destinationCountry: rule.destinationCountry,
      description: rule.visaType,
    }));
  }

  generatePersonalizedChecklist(
    visaType: string,
    userProfile: {
      hasJobOffer?: boolean;
      hasEnglishTest?: boolean;
      hasDegree?: boolean;
      workExperienceYears?: number;
      fundsAvailable?: number;
    }
  ): VisaDocumentChecklist {
    const baseChecklist = this.getDocumentChecklist(visaType);
    
    // Clone and modify based on user profile
    const personalized = { ...baseChecklist };
    
    // Adjust requirements based on profile
    personalized.clientUploads = personalized.clientUploads.map(doc => {
      const updated = { ...doc };
      
      // If user has job offer, make job offer documents optional
      if (userProfile.hasJobOffer && doc.name.toLowerCase().includes('job offer')) {
        updated.required = false;
      }
      
      // If user has English test, make it optional
      if (userProfile.hasEnglishTest && doc.name.toLowerCase().includes('english')) {
        updated.required = false;
      }
      
      // If user has sufficient funds, adjust proof of funds requirements
      if (userProfile.fundsAvailable && userProfile.fundsAvailable > 50000 && doc.name.toLowerCase().includes('funds')) {
        updated.required = false;
      }
      
      return updated;
    });
    
    return personalized;
  }
}

export const visaRulesService = new VisaRulesService();
