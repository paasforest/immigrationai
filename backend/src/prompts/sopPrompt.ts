import { SOPInputData } from '../types';

export const generateSOPPrompt = (data: SOPInputData): string => {
  return `You are an expert immigration consultant and professional writer specializing in crafting compelling Statements of Purpose (SOPs) for visa applications.

Create a professional, compelling, and authentic Statement of Purpose based on the following information:

APPLICANT INFORMATION:
- Full Name: ${data.fullName}
- Current Country: ${data.countryOfResidence}
- Target Country: ${data.targetCountry}
- Purpose of Travel: ${data.purpose}
${data.institutionName ? `- Institution/Company: ${data.institutionName}` : ''}
${data.courseOrPosition ? `- Course/Position: ${data.courseOrPosition}` : ''}

APPLICANT'S MOTIVATION:
${data.motivation}

${data.academicBackground ? `ACADEMIC BACKGROUND:\n${data.academicBackground}\n` : ''}
${data.workExperience ? `WORK EXPERIENCE:\n${data.workExperience}\n` : ''}
${data.futureGoals ? `FUTURE GOALS:\n${data.futureGoals}\n` : ''}

REQUIREMENTS:
1. Write a professional, well-structured Statement of Purpose (400-500 words)
2. Use formal yet personal tone
3. Include the following sections:
   - Introduction: Brief background and purpose
   - Academic/Professional Background: Relevant qualifications
   - Motivation: Why this country/institution/program
   - Future Plans: How this aligns with career goals
   - Conclusion: Strong closing statement

4. Make it authentic and specific to the applicant
5. Avoid generic phrases and clichés
6. Highlight unique qualities and experiences
7. Show genuine enthusiasm and commitment
8. Ensure logical flow between paragraphs
9. Use concrete examples where possible
10. Do NOT use placeholder text or brackets

Generate the complete SOP now:`;
};


