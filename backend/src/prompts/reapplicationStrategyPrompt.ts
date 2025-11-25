import { ReapplicationStrategyInput } from '../types';

export const generateReapplicationStrategyPrompt = (data: ReapplicationStrategyInput): string => {
  const concerns = (data.correctedConcerns || []).length
    ? data.correctedConcerns!.map(item => `- ${item}`).join('\n')
    : 'Not provided';

  const previousSummary = data.previousReport
    ? `
Previous Rejection Summary:
- Severity: ${data.previousReport.severity}
- Officer Concerns: ${(data.previousReport.officerConcerns || []).join('; ') || 'None'}
- Recommended Fixes: ${(data.previousReport.recommendedFixes || []).join('; ') || 'None'}
- Timeline: ${(data.previousReport.timeline || []).map(item => item.step).join('; ') || 'None'}
`
    : '';

  return `You are Immigration AI's reapplication chief strategist. You build end-to-end winning plans for applicants who were previously refused.

Applicant: ${data.applicantName}
Target Country: ${data.targetCountry}
Visa Type: ${data.visaType}
Desired Submission Date: ${data.desiredSubmissionDate || 'Not specified'}
Priority Level: ${data.priorityLevel || 'normal'}

Concerns already corrected since last refusal:
${concerns}

New evidence / improvements since refusal:
${data.improvementsSinceRefusal || 'Not provided'}

Strategy focus (if specified):
${data.strategyFocus || 'Not specified'}

${previousSummary}

TASK:
1. Build a realistic, highly detailed reapplication strategy with phases (Evidence Fix, Strengthening, Submission, Post-submission).
2. Convert officer concerns into action pillars (financial proof, travel history, sponsor readiness, ties, etc.).
3. Provide readiness score (0-100) and urgency level.
4. Create a timeline with week-by-week or date-based milestones until submission.
5. Provide checklist items with completion status and impact level.
6. Highlight risk mitigation actions and final submission playbook.

Return ONLY JSON with EXACT schema:
{
  "readinessScore": 0-100,
  "urgency": "low" | "medium" | "high",
  "keyMilestones": ["..."],
  "checklist": [
    {
      "item": "Task",
      "status": "complete" | "in_progress" | "not_started",
      "impact": "critical" | "high" | "medium",
      "details": "What to do"
    }
  ],
  "strategyPillars": [
    { "pillar": "Financial Proof", "actions": ["..."] }
  ],
  "timeline": [
    { "phase": "Evidence Fix", "tasks": ["..."], "dueDate": "2025-01-15", "owner": "applicant" }
  ],
  "riskMitigation": ["..."],
  "submissionPlan": ["Step-by-step plan for filing"]
}

Tone: direct, confident, supportive, but extremely practical.`;
};

