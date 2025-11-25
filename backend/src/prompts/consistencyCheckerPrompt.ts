import { ConsistencyCheckerInput } from '../types';

export const generateConsistencyCheckerPrompt = (data: ConsistencyCheckerInput): string => {
  return `You are an expert immigration document analyst working for Immigration AI. Your role is to check consistency across multiple documents for visa applications.

Analyze the following documents for consistency:

APPLICANT INFORMATION:
- Name: ${data.applicantName}
- Target Country: ${data.targetCountry}
- Visa Type: ${data.visaType}

DOCUMENTS TO CHECK:
${data.documents.map((doc, idx) => `
Document ${idx + 1}:
- Type: ${doc.type}
- Content/Key Information:
${doc.content || doc.keyFields || 'Not provided'}
`).join('\n')}

KEY FIELDS TO VERIFY:
${data.keyFields ? data.keyFields.join(', ') : 'Standard fields: Name, Date of Birth, Passport Number, Address, Employment Details, Education, Travel Dates'}

REQUIREMENTS:
1. Check consistency across ALL documents for:
   - Applicant name (exact spelling, format)
   - Date of birth
   - Passport number
   - Nationality
   - Address (current and permanent)
   - Employment details (job title, company, dates)
   - Education (degrees, institutions, dates)
   - Travel dates (if mentioned)
   - Financial information (amounts, currencies)
   - Family details (spouse, children names)

2. Identify ALL inconsistencies:
   - Spelling variations
   - Date mismatches
   - Address differences
   - Name format differences (middle names, initials)
   - Employment timeline conflicts
   - Education discrepancies

3. Assess severity:
   - Critical: Name, DOB, passport mismatches (rejection risk)
   - High: Address, employment, education inconsistencies
   - Medium: Minor spelling variations, format differences
   - Low: Stylistic differences (acceptable)

4. Provide specific recommendations to fix each inconsistency

5. Generate a consistency score (0-100%)

Return your analysis in this EXACT JSON format:
{
  "consistencyScore": 85,
  "status": "mostly_consistent",
  "criticalIssues": [],
  "inconsistencies": [
    {
      "field": "Address",
      "severity": "high",
      "document1": "123 Main Street, City",
      "document2": "123 Main St., City",
      "description": "Minor formatting difference (Street vs St.)",
      "recommendation": "Standardize to full form 'Street' across all documents"
    }
  ],
  "strengths": [
    "Name spelling consistent across all documents",
    "Passport number matches in all files",
    "Date of birth consistent"
  ],
  "recommendations": [
    "Standardize address format to match passport",
    "Ensure all employment dates align with tax records"
  ],
  "summary": "Overall consistency is good. Minor address format differences need standardization. All critical fields match."
}`;

};

