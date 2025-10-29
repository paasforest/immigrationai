import { CoverLetterInputData } from '../types';

export const generateCoverLetterPrompt = (data: CoverLetterInputData): string => {
  return `You are an expert in crafting professional cover letters for embassy visa applications.

Create a formal cover letter for a visa application based on the following information:

APPLICANT INFORMATION:
- Name: ${data.fullName}
- Address: ${data.address}
- Phone: ${data.phone}
- Email: ${data.email}

EMBASSY INFORMATION:
- Embassy: ${data.embassyName}
- Target Country: ${data.targetCountry}
- Visa Type: ${data.visaType}

TRAVEL DETAILS:
- Travel Dates: ${data.travelDates}
- Purpose: ${data.purpose}

${data.additionalInfo ? `ADDITIONAL INFORMATION:\n${data.additionalInfo}\n` : ''}

REQUIREMENTS:
1. Format as a formal business letter
2. Include proper salutation (e.g., "To the Visa Officer" or "Dear Sir/Madam")
3. Structure:
   - Introduction with applicant details
   - Purpose of travel and visa type requested
   - Travel dates and itinerary overview
   - Assurance of return and ties to home country
   - Contact information and availability
   - Professional closing

4. Keep it concise (250-300 words)
5. Use professional, respectful tone
6. Include all relevant facts clearly
7. Express willingness to provide additional documents
8. End with proper signature line

Format it as a complete, ready-to-print letter with proper spacing and structure.

Generate the complete cover letter now:`;
};


