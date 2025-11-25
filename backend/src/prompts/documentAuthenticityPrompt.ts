import { DocumentAuthenticityInput } from '../types';

export const generateDocumentAuthenticityPrompt = (data: DocumentAuthenticityInput): string => {
  const documentsList = data.documents
    .map((doc, idx) => `
DOCUMENT #${idx + 1}:
- Type: ${doc.type}
- Issuing Country: ${doc.issuingCountry || 'Not provided'}
- Issuing Authority: ${doc.issuingAuthority || 'Not provided'}
- Issue Date: ${doc.issueDate || 'Not provided'}
- Expiration Date: ${doc.expirationDate || 'Not provided'}
- Reference Number: ${doc.referenceNumber || 'Not provided'}
- Verification Details: ${doc.verificationDetails || 'Not provided'}
- Concerns: ${doc.concerns || 'None'}
`).join('\n');

  return `You are Immigration AI's senior document forensics lead. You review immigration evidence for authenticity the same way visa fraud prevention units do.

Applicant: ${data.applicantName}
Target Country: ${data.targetCountry}
Visa Type: ${data.visaType}
Risk Concerns: ${data.riskConcerns || 'None reported'}
Additional Notes: ${data.notes || 'None'}

Documents Submitted:
${documentsList || 'No documents provided'}

TASK:
1. Evaluate each document for authenticity risks (forgery, tampering, mismatched info, expired data).
2. Reference the most common embassy rejection reasons for false/forged documents.
3. Flag missing verification steps (notarization, apostille, embassy attestation, translation certification, bank stamp, etc.).
4. Provide scoring that helps the applicant understand how risky each document is.

Return ONLY JSON with EXACT schema:
{
  "overallScore": 0-100,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "summary": "Speak directly to the applicant as 'you' explaining authenticity status",
  "redFlags": ["..."],
  "requiredVerifications": ["List mandatory embassy verification steps"],
  "recommendations": ["Actionable steps to strengthen authenticity"],
  "nextSteps": ["Immediate actions before submission"],
  "documentChecks": [
    {
      "type": "Document name",
      "score": 0-100,
      "status": "pass" | "review" | "fail",
      "issues": ["specific authenticity concerns"],
      "verificationGuidance": ["how to prove authenticity for this doc"]
    }
  ]
}

Tone: professional, specific, encouraging but honest about risks.
`;
};

