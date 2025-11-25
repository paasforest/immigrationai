import { FinancialCalculatorInput } from '../types';

export const generateFinancialCalculatorPrompt = (data: FinancialCalculatorInput): string => {
  return `You are an expert immigration financial consultant working for Immigration AI. Your role is to calculate financial requirements and assess financial capacity for visa applications.

Analyze the following financial profile and calculate requirements:

APPLICANT INFORMATION:
- Name: ${data.applicantName}
- Target Country: ${data.targetCountry}
- Visa Type: ${data.visaType}
- Duration of Stay: ${data.durationOfStay || 'Not specified'}
${data.homeCountry ? `- Home Country: ${data.homeCountry}` : ''}

AVAILABLE FUNDS:
- Savings/Current Balance: ${data.availableFunds || 'Not provided'}
- Monthly Income: ${data.monthlyIncome || 'Not provided'}
- Annual Income: ${data.annualIncome || 'Not provided'}
- Source of Funds: ${data.sourceOfFunds || 'Not specified'}

${data.tuitionFees ? `TUITION FEES:\n- Annual Tuition: ${data.tuitionFees}\n` : ''}
${data.livingCosts ? `LIVING COSTS:\n- Estimated Monthly Living Costs: ${data.livingCosts}\n` : ''}
${data.accommodationCosts ? `- Accommodation Costs: ${data.accommodationCosts}\n` : ''}
${data.otherExpenses ? `- Other Expenses: ${data.otherExpenses}\n` : ''}

${data.sponsorName ? `SPONSOR INFORMATION:\n- Sponsor Name: ${data.sponsorName}\n- Sponsor Relationship: ${data.sponsorRelationship || 'Not specified'}\n- Sponsor Income: ${data.sponsorIncome || 'Not provided'}\n` : ''}

${data.dependents ? `DEPENDENTS:\n- Number of Dependents: ${data.dependents}\n` : ''}

REQUIREMENTS:
1. Calculate the MINIMUM financial requirement for ${data.targetCountry} ${data.visaType} visa based on:
   - Official embassy/consulate requirements
   - Duration of stay
   - Tuition fees (if student visa)
   - Living costs for the country
   - Accommodation costs
   - Other expenses (travel, insurance, etc.)
   - Dependents (if applicable)

2. Compare available funds vs. required funds

3. Calculate sufficiency score (0-100%):
   - 100%+ = Fully sufficient
   - 80-99% = Mostly sufficient (may need additional proof)
   - 60-79% = Partially sufficient (needs improvement)
   - Below 60% = Insufficient (high rejection risk)

4. Identify gaps and provide specific recommendations

5. Provide country-specific financial requirements and evidence needed

Return your analysis in this EXACT JSON format:
{
  "minimumRequired": {
    "amount": 25000,
    "currency": "USD",
    "breakdown": {
      "tuition": 15000,
      "livingCosts": 8000,
      "accommodation": 2000,
      "otherExpenses": 1000
    }
  },
  "availableFunds": {
    "amount": 28000,
    "currency": "USD",
    "sources": ["savings", "income", "sponsor"]
  },
  "sufficiencyScore": 112,
  "status": "sufficient",
  "gapAnalysis": {
    "hasGap": false,
    "gapAmount": 0,
    "gapPercentage": 0
  },
  "recommendations": [
    "Your funds exceed the minimum requirement by 12%",
    "Ensure bank statements show consistent balance for 3-6 months",
    "Provide evidence of source of funds"
  ],
  "countrySpecificRequirements": [
    "Bank statements for last 6 months required",
    "Proof of income for last 12 months",
    "Sponsor affidavit required if using sponsor funds"
  ],
  "riskFactors": [],
  "strengths": [
    "Funds exceed minimum requirement",
    "Multiple sources of funds",
    "Consistent income history"
  ],
  "nextSteps": [
    "Gather bank statements for last 6 months",
    "Prepare sponsor letter (if applicable)",
    "Obtain official tuition fee letter from institution"
  ],
  "summary": "Your financial capacity is sufficient for this visa application. You have $28,000 available against a minimum requirement of $25,000, representing a 12% surplus. Ensure you provide all required documentation to support your financial evidence."
}

IMPORTANT:
- Use accurate, country-specific financial requirements
- Be specific with amounts and currency
- Provide actionable recommendations
- Identify any red flags or risk factors
- Be encouraging but honest about financial capacity`;

};

