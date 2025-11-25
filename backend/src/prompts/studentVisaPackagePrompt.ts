import { StudentVisaPackageInput } from '../types';

export const generateStudentVisaPackagePrompt = (data: StudentVisaPackageInput): string => {
  return `You are an expert student visa consultant working for Immigration AI. Your role is to generate a complete student visa document package.

Generate a comprehensive student visa package for:

APPLICANT INFORMATION:
- Name: ${data.applicantName}
- Home Country: ${data.homeCountry}
- Target Country: ${data.targetCountry}
- Visa Type: Student Visa

EDUCATION DETAILS:
- Current Education: ${data.currentEducation || 'Not provided'}
- Institution: ${data.institution || 'Not provided'}
- Program: ${data.program || 'Not provided'}
- Duration: ${data.programDuration || 'Not provided'}
- Tuition Fees: ${data.tuitionFees || 'Not provided'}
- Start Date: ${data.startDate || 'Not provided'}

FINANCIAL INFORMATION:
- Available Funds: ${data.availableFunds || 'Not provided'}
- Source of Funds: ${data.sourceOfFunds || 'Not provided'}
- Sponsor Details: ${data.sponsorDetails || 'Not provided'}

ACADEMIC BACKGROUND:
- Previous Degrees: ${data.previousDegrees || 'Not provided'}
- Academic Achievements: ${data.academicAchievements || 'Not provided'}
- English Test: ${data.englishTest || 'Not provided'}
- Test Scores: ${data.testScores || 'Not provided'}

CAREER GOALS:
- Career Objectives: ${data.careerGoals || 'Not provided'}
- Why This Program: ${data.whyThisProgram || 'Not provided'}

REQUIREMENTS:
Generate a complete student visa package including:

1. Statement of Purpose (SOP)
   - Academic background
   - Why this program/university
   - Career goals
   - Why this country

2. Financial Proof Letter
   - Available funds breakdown
   - Source of funds explanation
   - Sponsorship details (if applicable)

3. Document Checklist
   - Country-specific requirements
   - All required documents
   - Verification requirements
   - Submission timeline

4. Timeline & Next Steps
   - Application deadlines
   - Document gathering timeline
   - Submission schedule

5. Strengths & Recommendations
   - Application strengths
   - Areas to strengthen
   - Tips for success

Return your package in this EXACT JSON format:
{
  "sop": "Full Statement of Purpose document (600-800 words)...",
  "financialLetter": "Complete Financial Proof Letter...",
  "checklist": {
    "requiredDocuments": [
      "Letter of Acceptance (LoA) from institution",
      "Valid passport (minimum 6 months validity)",
      "Proof of financial capacity (bank statements, sponsor letter)",
      "English proficiency test results (IELTS/TOEFL)",
      "Academic transcripts and certificates",
      "Medical examination certificate",
      "Police clearance certificate",
      "Travel insurance",
      "Passport-sized photographs"
    ],
    "countrySpecific": [
      "Canada: CAQ (Québec Acceptance Certificate) if studying in Québec",
      "UK: Confirmation of Acceptance for Studies (CAS) from institution",
      "USA: SEVIS I-901 fee payment receipt"
    ],
    "verificationRequirements": [
      "All documents must be officially translated",
      "Bank statements must cover last 3-6 months",
      "Documents must be notarized/certified"
    ]
  },
  "timeline": {
    "weeksBeforeStart": [
      "Week 12-16: Apply for Letter of Acceptance",
      "Week 8-12: Take English proficiency test",
      "Week 6-8: Gather all required documents",
      "Week 4-6: Submit visa application",
      "Week 2-4: Wait for processing",
      "Week 0-2: Receive visa and travel preparation"
    ],
    "deadlines": [
      "Application deadline: ${data.startDate || 'Check institution website'}",
      "Document submission: At least 6 weeks before program start"
    ]
  },
  "strengths": [
    "Strong academic background",
    "Clear career objectives",
    "Sufficient financial capacity"
  ],
  "recommendations": [
    "Ensure all documents are officially translated",
    "Submit application well before deadline",
    "Provide detailed financial evidence"
  ],
  "summary": "Your student visa package is ready. Ensure all documents are properly certified and submitted according to the timeline."
}`;

};

