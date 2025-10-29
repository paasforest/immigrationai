import { ReviewSOPInputData } from '../types';

export const generateReviewerPrompt = (data: ReviewSOPInputData): string => {
  return `You are an expert immigration consultant reviewing a Statement of Purpose for a visa application.

Analyze the following SOP and provide detailed, actionable feedback:

${data.targetCountry ? `Target Country: ${data.targetCountry}\n` : ''}
${data.purpose ? `Purpose: ${data.purpose}\n` : ''}

STATEMENT OF PURPOSE TO REVIEW:
${data.sopText}

PROVIDE A COMPREHENSIVE REVIEW WITH:

1. **Overall Score** (0-100): Rate the SOP's effectiveness

2. **Strengths** (List 3-5 points):
   - What works well in this SOP
   - Strong aspects that should be maintained

3. **Weaknesses** (List 3-5 points):
   - Areas that need improvement
   - Missing elements or unclear sections

4. **Specific Suggestions** (List 5-8 actionable improvements):
   - Concrete recommendations for each weak area
   - Suggestions for stronger language or structure
   - Additional content that should be included

5. **Structure & Flow Analysis**:
   - Comment on paragraph organization
   - Logical flow and transitions
   - Introduction and conclusion effectiveness

6. **Language & Tone Assessment**:
   - Formality level
   - Clarity and conciseness
   - Use of specific examples vs. generic statements

7. **Content Analysis**:
   - Completeness of information
   - Authenticity and personal touch
   - Relevance to visa purpose

Return your analysis in the following JSON format:
{
  "overallScore": number,
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "structureAnalysis": "detailed comment",
  "languageAnalysis": "detailed comment",
  "contentAnalysis": "detailed comment",
  "summary": "brief overall summary"
}`;
};


