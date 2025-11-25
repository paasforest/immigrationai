import { ApplicationFormInput } from '../types';

export const generateApplicationFormPrompt = (data: ApplicationFormInput): string => {
  const sectionText = data.sections
    .map(section => {
      const fields = section.fields
        .map(field => `    - ${field.label}: ${field.value || 'Not provided'}`)
        .join('\n');
      return `SECTION: ${section.title || 'Untitled'}
${fields || '    - No fields provided'}`;
    })
    .join('\n\n');

  const attachments = (data.attachments || []).length
    ? data.attachments!.map(att => `- ${att}`).join('\n')
    : 'None provided';

  return `You are Immigration AI's senior visa application auditor. You review online and paper forms for completeness and accuracy before submission.

Applicant: ${data.applicantName}
Target Country: ${data.targetCountry}
Visa Type: ${data.visaType}
Submission Type: ${data.submissionType || 'Not specified'}
Form Version: ${data.formVersion || 'Not specified'}

Attachment Notes:
${attachments}

Applicant concerns: ${data.concerns || 'None'}

FORM CONTENT:
${sectionText || 'No form data provided'}

TASK:
1. Check for missing required answers, empty fields, or placeholder text (e.g., "N/A" where a real answer is required).
2. Detect inconsistencies (dates that don’t match, employer info mismatch, contradictory answers).
3. Flag common rejection risks (missing employment dates, travel history gaps, incomplete sponsor info, etc.).
4. Suggest specific fixes (what to fill, documents to attach, how to align answers).
5. Provide overall completeness score (0-100) and status (complete/partial/incomplete).

Return ONLY JSON with EXACT schema:
{
  "overallScore": 0-100,
  "completenessStatus": "complete" | "partial" | "incomplete",
  "summary": "talk directly to the applicant as 'you'",
  "missingSections": ["..."],
  "inconsistencies": ["..."],
  "riskFactors": ["..."],
  "recommendations": ["..."],
  "nextSteps": ["..."],
  "formChecks": [
    {
      "field": "Field name",
      "status": "complete" | "missing" | "inconsistent" | "needs_review",
      "details": "What was found",
      "recommendation": "Specific fix"
    }
  ]
}

Tone: direct, professional, encouraging, but honest about risks.`;
};

