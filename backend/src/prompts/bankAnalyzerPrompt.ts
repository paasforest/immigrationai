import { BankAnalyzerInput } from '../types';

export const generateBankAnalyzerPrompt = (data: BankAnalyzerInput): string => {
  return `You are an expert immigration financial analyst working for Immigration AI. Your role is to analyze bank statements and assess financial evidence for visa applications.

Analyze the following bank statement data:

APPLICANT INFORMATION:
- Name: ${data.applicantName}
- Target Country: ${data.targetCountry}
- Visa Type: ${data.visaType}
${data.homeCountry ? `- Home Country: ${data.homeCountry}` : ''}

BANK STATEMENT DATA:
${data.statementText ? `STATEMENT TEXT:\n${data.statementText}\n` : ''}
${data.accountBalance ? `- Current Balance: ${data.accountBalance}\n` : ''}
${data.averageBalance ? `- Average Balance (3-6 months): ${data.averageBalance}\n` : ''}
${data.minimumBalance ? `- Minimum Balance: ${data.minimumBalance}\n` : ''}
${data.accountType ? `- Account Type: ${data.accountType}\n` : ''}
${data.currency ? `- Currency: ${data.currency}\n` : ''}
${data.statementPeriod ? `- Statement Period: ${data.statementPeriod}\n` : ''}

FINANCIAL PATTERNS:
${data.monthlyIncome ? `- Monthly Income: ${data.monthlyIncome}\n` : ''}
${data.monthlyExpenses ? `- Monthly Expenses: ${data.monthlyExpenses}\n` : ''}
${data.largeDeposits ? `- Large Deposits (>$1000): ${data.largeDeposits}\n` : ''}
${data.sourceOfFunds ? `- Source of Funds: ${data.sourceOfFunds}\n` : ''}

REQUIREMENTS:
1. Analyze the bank statement for compliance with ${data.targetCountry} ${data.visaType} visa requirements
2. Extract key financial metrics:
   - Current balance
   - Average balance over statement period
   - Income patterns
   - Expense patterns
   - Transaction consistency

3. Detect RED FLAGS:
   - Large unexplained deposits
   - Insufficient funds
   - Irregular transaction patterns
   - Inconsistent balances
   - Missing required period coverage
   - Currency mismatches

4. Assess compliance with embassy requirements:
   - Minimum balance requirements
   - Statement period coverage (typically 3-6 months)
   - Transaction history consistency
   - Source of funds documentation

5. Calculate compliance score (0-100%):
   - 90-100% = Excellent compliance
   - 70-89% = Good compliance (minor issues)
   - 50-69% = Fair compliance (needs improvement)
   - Below 50% = Poor compliance (high rejection risk)

6. Provide specific recommendations to strengthen the financial evidence

Return your analysis in this EXACT JSON format:
{
  "accountAnalysis": {
    "currentBalance": 25000,
    "currency": "USD",
    "averageBalance": 23000,
    "minimumBalance": 20000,
    "statementPeriod": "6 months",
    "accountType": "Savings"
  },
  "transactionAnalysis": {
    "monthlyIncome": 5000,
    "monthlyExpenses": 2000,
    "incomeConsistency": "consistent",
    "expensePattern": "regular",
    "largeDeposits": [],
    "irregularTransactions": []
  },
  "redFlags": [
    "No red flags detected"
  ],
  "complianceScore": 95,
  "complianceStatus": "excellent",
  "countryRequirements": {
    "minimumBalance": 20000,
    "requiredPeriod": "6 months",
    "currencyAccepted": ["USD", "EUR"],
    "statementFormat": "Official bank statement"
  },
  "complianceCheck": {
    "meetsMinimumBalance": true,
    "meetsPeriodRequirement": true,
    "hasConsistentHistory": true,
    "hasSourceDocumentation": true,
    "currencyMatches": true
  },
  "strengths": [
    "Consistent balance above minimum requirement",
    "Regular income pattern",
    "Complete 6-month statement period",
    "No large unexplained deposits"
  ],
  "weaknesses": [],
  "recommendations": [
    "Statement is compliant and ready for submission",
    "Ensure statement is officially stamped by bank",
    "Include source of funds letter if required"
  ],
  "nextSteps": [
    "Obtain official bank statement with bank stamp",
    "Prepare source of funds explanation letter",
    "Ensure statement covers full required period"
  ],
  "summary": "Your bank statement shows excellent compliance with visa requirements. Current balance of $25,000 exceeds the minimum requirement of $20,000, with consistent transaction history over 6 months. No red flags detected. Statement is ready for submission with proper bank certification."
}

IMPORTANT:
- Be specific with amounts and currency
- Identify ALL potential red flags
- Provide actionable recommendations
- Use country-specific requirements
- Be honest about compliance issues
- Help users strengthen their financial evidence`;

};

