import OpenAI from 'openai';
import { logger } from '../utils/logger';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

const CHAT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Immigration Expert System Prompt
const IMMIGRATION_EXPERT_PROMPT = `You are an expert immigration consultant working for Immigration AI - an AI-powered platform that helps people prepare immigration documents and navigate visa applications for 150+ countries including USA, Canada, UK, Australia, Germany, Ireland, and more.

ABOUT YOUR PLATFORM:
- Platform: Immigration AI (immigrationai.co.za)
- Purpose: Help users prepare professional immigration documents and visa applications
- Services: SOP generation, cover letters, visa eligibility checks, document reviews, interview coaching, English test practice
- Trust: Used by thousands of successful applicants worldwide
- Your role: AI Immigration Expert Assistant providing personalized guidance

SUBSCRIPTION PLANS OFFERED:
1. **STARTER PLAN - R149/month**
   - 3 Visa Eligibility Checks per month
   - 2 Document Types (SOP, Cover Letter)
   - PDF Downloads
   - Basic email support

2. **ENTRY PLAN - R299/month** (Most Popular)
   - 10 Visa Eligibility Checks per month
   - 5 Document Types
   - Basic Interview Practice (5 sessions/month)
   - English Test Practice (IELTS only)
   - Priority email support
   - PDF Downloads

3. **PROFESSIONAL PLAN - R699/month**
   - Unlimited Visa Eligibility Checks
   - All Document Types (8+ types)
   - Relationship Proof Kit
   - AI Photo Analysis
   - Unlimited Interview Practice
   - Full English Test Practice (IELTS, TOEFL, CELPIP)
   - Interview Questions Database
   - Agent Dashboard

4. **ENTERPRISE PLAN - R1,499/month**
   - Everything in Professional
   - Unlimited Team Members
   - Advanced Analytics Dashboard
   - Bulk Document Processing
   - Priority Phone Support
   - Dedicated Account Manager
   - SLA Guarantee (99.9% uptime)

You specialize in:
- Work visas (H-1B, L-1, O-1, Skilled Worker, Stamp 1, etc.)
- Student visas (F-1, J-1, Tier 4, Study Permit, Stamp 2)
- Family visas (K-1, CR-1, Partner visas, Stamp 4)
- Permanent residency (Green Card, Express Entry, ILR, Stamp 5)
- Citizenship applications
- Visitor visas and short-stay visas

Provide accurate, helpful, and specific advice. Always:
1. Be specific about document requirements
2. Mention processing times when relevant
3. Explain eligibility criteria clearly
4. Suggest next steps
5. Reference that you're part of the Immigration AI platform helping them succeed
6. When appropriate, mention our subscription plans and their features to help users understand what's available
7. Be encouraging and supportive of their immigration journey

Answer the user's question professionally and helpfully. Remember, you're helping them achieve their immigration goals through Immigration AI's comprehensive platform.`;

// AI Chat with Immigration Expert
export const chatWithAI = async (
  message: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> => {
  try {
    logger.info('AI Chat request received', { message });

    const messages: any[] = [
      { role: 'system', content: IMMIGRATION_EXPERT_PROMPT },
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    const aiMessage = response.choices[0]?.message?.content || 'I apologize, I could not generate a response. Please try again.';
    
    logger.info('AI Chat response generated', { 
      tokensUsed: response.usage?.total_tokens,
      model: response.model 
    });

    return aiMessage;
  } catch (error: any) {
    logger.error('AI Chat error', { error: error.message });
    throw new Error('Failed to get AI response. Please check your OpenAI API key.');
  }
};

// Generate SOP with AI
export const generateSOP = async (data: {
  fullName: string;
  currentCountry: string;
  targetCountry: string;
  purpose: string;
  institution: string;
  program: string;
  background: string;
  motivation: string;
  careerGoals: string;
}, userId?: string): Promise<{ sop: string; tokensUsed: number }> => {
  try {
    logger.info('SOP Generation request', { targetCountry: data.targetCountry, institution: data.institution });

    const prompt = `Write a professional and compelling Statement of Purpose for a ${data.purpose} visa application with the following details:

**Applicant:** ${data.fullName}
**From:** ${data.currentCountry}
**Target Country:** ${data.targetCountry}
**Institution/Company:** ${data.institution}
**Program/Position:** ${data.program}

**Background:**
${data.background}

**Motivation:**
${data.motivation}

**Career Goals:**
${data.careerGoals}

Write a well-structured, persuasive SOP (approximately 800-1000 words) that:
1. Has a strong opening paragraph that captures attention
2. Clearly explains academic/professional background with specific achievements
3. Demonstrates genuine motivation and fit for the program/position
4. Shows clear understanding of why this specific institution
5. Articulates concrete short-term and long-term career goals
6. Explains how this opportunity aligns with future plans
7. Maintains professional tone throughout
8. Ends with a confident conclusion

Make it personal, authentic, and compelling. Avoid clichés. Use specific examples from the provided information.`;

    const response = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: 'You are an expert Statement of Purpose writer working for Immigration AI - a trusted platform helping thousands of successful visa applicants worldwide. Write compelling, personalized SOPs that showcase the applicant\'s unique story. Your writing helps people achieve their immigration dreams through professional, authentic documents.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const sop = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;

    // Track usage if userId provided - CRITICAL for tier enforcement!
    if (userId) {
      try {
        const { query } = await import('../config/database');
        await query(
          'INSERT INTO api_usage (user_id, feature, tokens_used, cost_usd, success, timestamp) VALUES ($1, $2, $3, $4, $5, NOW())',
          [userId, 'sop_generation', tokensUsed, 0, true] // Cost calculation can be added later
        );
      } catch (error) {
        logger.error('Failed to track SOP generation usage:', error);
      }
    }

    logger.info('SOP Generated successfully', { tokensUsed, length: sop.length, userId });

    return { sop, tokensUsed };
  } catch (error: any) {
    logger.error('SOP Generation error', { error: error.message });
    throw new Error('Failed to generate SOP. Please try again.');
  }
};

// Analyze SOP Quality with AI
export const analyzeSOP = async (text: string, userId?: string): Promise<{
  score: {
    overall: number;
    clarity: number;
    structure: number;
    persuasiveness: number;
  };
  suggestions: string[];
  tokensUsed: number;
}> => {
  try {
    logger.info('SOP Analysis request', { textLength: text.length });

    const prompt = `Analyze this Statement of Purpose and provide:

1. Quality Scores (0-100):
   - Clarity: How clear and easy to understand
   - Structure: How well-organized and logical
   - Persuasiveness: How compelling and convincing

2. Specific Improvement Suggestions (3-5 actionable items)

SOP to analyze:
${text}

Provide your analysis in this JSON format:
{
  "clarity": 85,
  "structure": 90,
  "persuasiveness": 80,
  "suggestions": [
    "Add more specific examples of achievements",
    "Strengthen the connection between goals and program",
    "Improve the conclusion with a confident closing"
  ]
}`;

    const response = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: 'You are an expert SOP reviewer working for Immigration AI platform. You evaluate statements with constructive feedback to help applicants improve their documents. Provide honest, specific scores and actionable suggestions to help them succeed in their visa applications.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const analysisText = response.choices[0]?.message?.content || '{}';
    const tokensUsed = response.usage?.total_tokens || 0;

    // Parse AI response
    let analysis;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      analysis = {
        clarity: 75,
        structure: 75,
        persuasiveness: 75,
        suggestions: ['Unable to parse detailed analysis. Please try again.']
      };
    }

    const overall = Math.round(
      (analysis.clarity + analysis.structure + analysis.persuasiveness) / 3
    );

    // Track usage if userId provided
    if (userId) {
      try {
        const { query } = await import('../config/database');
        await query(
          'INSERT INTO api_usage (user_id, feature, tokens_used, cost_usd, success, timestamp) VALUES ($1, $2, $3, $4, $5, NOW())',
          [userId, 'review_sop', tokensUsed, 0, true]
        );
      } catch (error) {
        logger.error('Failed to track SOP review usage:', error);
      }
    }

    logger.info('SOP Analysis completed', { overall, tokensUsed });

    return {
      score: {
        overall,
        clarity: analysis.clarity || 75,
        structure: analysis.structure || 75,
        persuasiveness: analysis.persuasiveness || 75,
      },
      suggestions: analysis.suggestions || [],
      tokensUsed,
    };
  } catch (error: any) {
    logger.error('SOP Analysis error', { error: error.message });
    throw new Error('Failed to analyze SOP. Please try again.');
  }
};

// Analyze Interview Answer with AI
export const analyzeInterviewAnswer = async (params: {
  question: string;
  userAnswer: string;
  visaType: string;
  questionCategory?: string;
  questionDifficulty?: string;
  redFlags?: string[];
  idealElements?: string[];
}): Promise<{
  overall_score: number;
  category_scores: {
    clarity: number;
    completeness: number;
    confidence: number;
    consistency: number;
    relevance: number;
  };
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  red_flags_detected: string[];
  positive_elements: string[];
  lawyer_notes: string[];
  recommended_practice_areas: string[];
  next_questions_to_practice: string[];
  consistency_with_sop: boolean;
  key_phrases_used: string[];
  confidence_level: 'low' | 'medium' | 'high';
  clarity_score: number;
  completeness_score: number;
  score_reasoning: string;
  overall_assessment: string;
  confidence_assessment: string;
  tokensUsed: number;
}> => {
  try {
    logger.info('Interview answer analysis request', { 
      visaType: params.visaType,
      answerLength: params.userAnswer.length 
    });

    const systemPrompt = `You are an expert immigration consultant and visa interview coach working for Immigration AI - a trusted platform helping thousands of successful visa applicants. With 15+ years of experience, you evaluate visa interview answers with the same scrutiny as actual consulate officers.

Your role is to:
1. Provide honest, constructive feedback
2. Identify red flags that could lead to visa rejection
3. Score answers on clarity, completeness, confidence, consistency, and relevance
4. Suggest specific improvements
5. Note positive elements that strengthen the application
6. Assess consistency with the applicant's Statement of Purpose (if applicable)
7. Help applicants succeed in their immigration journey through Immigration AI's coaching platform

Be specific and actionable in your feedback.`;

    const prompt = `Analyze this visa interview answer:

QUESTION: ${params.question}
${params.questionCategory ? `CATEGORY: ${params.questionCategory}` : ''}
${params.questionDifficulty ? `DIFFICULTY: ${params.questionDifficulty}` : ''}

USER'S ANSWER: ${params.userAnswer}

${params.redFlags && params.redFlags.length > 0 ? `WATCH FOR THESE RED FLAGS: ${params.redFlags.join(', ')}` : ''}
${params.idealElements && params.idealElements.length > 0 ? `IDEAL ELEMENTS TO INCLUDE: ${params.idealElements.join(', ')}` : ''}

VISA TYPE: ${params.visaType}

Provide a comprehensive analysis in this EXACT JSON format:
{
  "overall_score": 8,
  "category_scores": {
    "clarity": 8,
    "completeness": 7,
    "confidence": 9,
    "consistency": 8,
    "relevance": 8
  },
  "strengths": ["Specific mention of university name", "Clear career goals"],
  "improvements": ["Add more detail about research interests", "Explain financial preparation"],
  "suggestions": ["Practice speaking more clearly", "Prepare specific examples"],
  "red_flags_detected": [],
  "positive_elements": ["Demonstrates genuine interest", "Shows financial planning"],
  "lawyer_notes": ["Good foundation, needs more specificity"],
  "recommended_practice_areas": ["Articulating research interests", "Explaining long-term plans"],
  "next_questions_to_practice": ["Why this university?", "What are your career goals?"],
  "consistency_with_sop": true,
  "key_phrases_used": ["world-class research", "academic excellence"],
  "confidence_level": "high",
  "clarity_score": 8,
  "completeness_score": 7,
  "score_reasoning": "Strong answer with specific details and clear goals. Minor improvements needed in elaborating on research interests.",
  "overall_assessment": "This is a strong answer that demonstrates genuine intent and preparation.",
  "confidence_assessment": "The applicant shows confidence and clarity in their response."
}`;

    const response = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1200,
    });

    const analysisText = response.choices[0]?.message?.content || '{}';
    const tokensUsed = response.usage?.total_tokens || 0;

    // Parse AI response
    let analysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (parseError) {
      logger.error('Failed to parse interview analysis', { parseError, analysisText });
      throw new Error('Failed to parse AI analysis. Please try again.');
    }

    // Validate and set defaults
    const result = {
      overall_score: analysis.overall_score || 7,
      category_scores: {
        clarity: analysis.category_scores?.clarity || 7,
        completeness: analysis.category_scores?.completeness || 7,
        confidence: analysis.category_scores?.confidence || 7,
        consistency: analysis.category_scores?.consistency || 7,
        relevance: analysis.category_scores?.relevance || 7,
      },
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
      suggestions: analysis.suggestions || [],
      red_flags_detected: analysis.red_flags_detected || [],
      positive_elements: analysis.positive_elements || [],
      lawyer_notes: analysis.lawyer_notes || [],
      recommended_practice_areas: analysis.recommended_practice_areas || [],
      next_questions_to_practice: analysis.next_questions_to_practice || [],
      consistency_with_sop: analysis.consistency_with_sop ?? true,
      key_phrases_used: analysis.key_phrases_used || [],
      confidence_level: (analysis.confidence_level || 'medium') as 'low' | 'medium' | 'high',
      clarity_score: analysis.clarity_score || analysis.category_scores?.clarity || 7,
      completeness_score: analysis.completeness_score || analysis.category_scores?.completeness || 7,
      score_reasoning: analysis.score_reasoning || 'Analysis completed successfully.',
      overall_assessment: analysis.overall_assessment || 'Analysis completed successfully.',
      confidence_assessment: analysis.confidence_assessment || 'moderate',
      tokensUsed,
    };

    logger.info('Interview answer analysis completed', { 
      overall_score: result.overall_score,
      tokensUsed 
    });

    return result;
  } catch (error: any) {
    logger.error('Interview answer analysis error', { error: error.message });
    throw new Error('Failed to analyze interview answer. Please try again.');
  }
};

// Special handler for Ireland Stamp 4 (Family Reunion)
const checkIrelandStamp4Eligibility = async (profile: any): Promise<{
  eligible: boolean;
  score: number;
  analysis: string;
  recommendations: string[];
  tokensUsed: number;
}> => {
  try {
    console.log('Profile received:', JSON.stringify(profile, null, 2));
    const sponsorIncome = parseInt(profile.sponsorIncome) || 0;
    const dependents = parseInt(profile.dependents) || 0;
    const requiredIncome = dependents > 0 ? 50000 : 40000;
    console.log('Parsed values:', { sponsorIncome, dependents, requiredIncome });
    
    let score = 0;
    let analysis = '';
    const recommendations: string[] = [];
    
    // Check relationship
    if (profile.relationship === 'spouse' || profile.relationship === 'child') {
      score += 40;
      analysis += '✅ Valid relationship (spouse/child) confirmed. ';
    } else {
      analysis += '❌ Invalid relationship. Must be spouse or child of Irish citizen/resident. ';
      recommendations.push('Ensure you are applying as a spouse or child of an Irish citizen or resident.');
    }
    
    // Check sponsor status
    if (profile.sponsorStatus === 'citizen' || profile.sponsorStatus === 'permanent_resident') {
      score += 30;
      analysis += '✅ Sponsor has valid status (citizen/resident). ';
    } else {
      analysis += '❌ Sponsor must be Irish citizen or permanent resident. ';
      recommendations.push('Your sponsor must be an Irish citizen or permanent resident.');
    }
    
    // Check sponsor income
    if (sponsorIncome >= requiredIncome) {
      score += 30;
      analysis += `✅ Sponsor income (€${sponsorIncome.toLocaleString()}) meets requirement (€${requiredIncome.toLocaleString()}+). `;
    } else {
      analysis += `❌ Sponsor income (€${sponsorIncome.toLocaleString()}) below requirement (€${requiredIncome.toLocaleString()}+). `;
      recommendations.push(`Your sponsor needs to earn at least €${requiredIncome.toLocaleString()} annually (€${dependents > 0 ? '50,000' : '40,000'}+ with dependents).`);
    }
    
    // Final assessment
    const eligible = score >= 70;
    if (eligible) {
      analysis += '🎉 You meet the requirements for Ireland Stamp 4 (Family Reunion) visa!';
    } else {
      analysis += '⚠️ Additional requirements needed for Stamp 4 eligibility.';
    }
    
    return {
      eligible,
      score,
      analysis,
      recommendations,
      tokensUsed: 0 // No AI tokens used for this direct calculation
    };
  } catch (error: any) {
    logger.error('Ireland Stamp 4 eligibility check error', { error: error.message });
    throw new Error('Failed to check Ireland Stamp 4 eligibility.');
  }
};

// Check Visa Eligibility with AI - REALISTIC with actual country requirements
export const checkEligibility = async (profile: {
  targetCountry: string;
  visaType: string;
  age?: string;
  education?: string;
  workExperience?: string;
  languageTest?: string;
  languageScore?: string;
  funds?: string;
  // Family-specific fields
  relationship?: string;
  sponsorStatus?: string;
  sponsorIncome?: string;
  // Work-specific fields
  jobOffer?: string;
  employer?: string;
  salary?: string;
  // Study-specific fields
  institution?: string;
  program?: string;
  tuition?: string;
  // General fields
  nationality?: string;
  maritalStatus?: string;
  dependents?: string;
}, userId?: string): Promise<{
  eligible: boolean;
  score: number;
  analysis: string;
  recommendations: string[];
  tokensUsed: number;
}> => {
  try {
    logger.info('Visa Eligibility check', { targetCountry: profile.targetCountry, visaType: profile.visaType });

    // Special handling for Ireland Stamp 4 (Family Reunion)
    logger.info('Checking conditions', { 
      targetCountry: profile.targetCountry, 
      visaType: profile.visaType,
      countryMatch: profile.targetCountry.toLowerCase() === 'ireland',
      visaMatch: profile.visaType === 'stamp_4'
    });
    
    if (profile.targetCountry.toLowerCase() === 'ireland' && profile.visaType === 'stamp_4') {
      logger.info('Using special Ireland Stamp 4 handler');
      return await checkIrelandStamp4Eligibility(profile);
    }

    // Realistic system prompt with ACTUAL country requirements
    const systemPrompt = `You are a certified immigration consultant working for Immigration AI - a trusted platform (immigrationai.co.za) helping applicants worldwide succeed in their visa journeys. With 15+ years of experience, you have deep knowledge of ACTUAL visa requirements for all major countries. You provide accurate, realistic assessments to help applicants prepare properly.

REAL COUNTRY REQUIREMENTS (Use these in your assessment):

**CANADA VISAS:**
- Study Permit: IELTS 6.0+ (6.5+ recommended), CAD $10,000 + tuition, Letter of acceptance required
- Work Permit: Job offer + LMIA (usually), or LMIA-exempt categories
- Express Entry (PR): CRS 470-490+, CLB 9+ (IELTS 8,7,7,7), 3+ years skilled work
- Visitor Visa: Strong ties to home country, sufficient funds, no criminal record
- Family Sponsorship: Sponsor must be PR/citizen, meet income requirements
- Startup Visa: Innovative business idea, designated organization support
- Investor Visa: CAD $800,000 investment, net worth $1.6M+

**USA VISAS:**
- F-1 Student: TOEFL 79+ (90+ top schools), full tuition + $15-25K living, I-20 required
- H-1B Work: Bachelor's degree, specialty occupation, employer sponsor, lottery (33% rate)
- L-1 Transfer: Manager/executive, 1+ year with company, intracompany transfer
- O-1 Extraordinary: Exceptional ability, evidence of national/international acclaim
- EB-1 Priority: Extraordinary ability, outstanding professor/researcher, multinational executive
- EB-2 Advanced: Master's degree or 5+ years experience, job offer, labor certification
- EB-3 Skilled: Bachelor's degree or 2+ years experience, job offer, labor certification
- B-1/B-2 Visitor: Strong ties to home country, sufficient funds, no immigrant intent
- K-1 Fiancé: US citizen sponsor, proof of relationship, intent to marry within 90 days
- CR-1 Spouse: US citizen sponsor, valid marriage, financial support affidavit

**UK VISAS:**
- Student Visa (Tier 4): IELTS 5.5+ (UKVI), CAS from licensed sponsor, funds £1,334/month (London)
- Skilled Worker: Job offer from licensed sponsor, £26,200+ salary, 70 points system
- Global Talent: Exceptional talent/promise, endorsed by approved body
- Startup Visa: Innovative business idea, endorsed by approved body
- Innovator Visa: £50,000+ investment, innovative business, endorsed
- Family Visa: Spouse/partner of UK citizen/resident, financial requirements
- Visitor Visa: Strong ties to home country, sufficient funds, no work allowed
- Ancestry Visa: Commonwealth citizen, grandparent born in UK, age 17-65

**AUSTRALIA VISAS:**
- Student Visa (500): IELTS 5.5+ (6.0+ recommended), AUD $21,041/year, GTE requirement
- Skilled Migration (189): 65+ points, under 45, skilled occupation, skills assessment
- Skilled Migration (190): State nomination, 65+ points, skilled occupation
- Temporary Work (482): Job offer, skills assessment, English requirements
- Partner Visa: Spouse/de facto partner of Australian citizen/resident
- Parent Visa: Parent of Australian citizen/resident, balance of family test
- Visitor Visa: Genuine temporary entrant, sufficient funds, no work
- Working Holiday: Age 18-30, passport from eligible country, no dependents

**GERMANY VISAS:**
- Student Visa: German B1-B2 (TestDaF 4+) OR English program, €11,208/year blocked account
- Work Visa: Job offer, degree recognition, German B1+ (usually)
- EU Blue Card: University degree, job offer €58,400+ (2024), German A1+
- Family Reunion: Spouse/child of German resident, German A1+ (spouse)
- Freelancer Visa: Business plan, sufficient funds, German A1+
- Job Seeker: University degree, German B1+, 6 months to find job
- Visitor Visa: Sufficient funds, travel insurance, no work allowed

**IRELAND VISAS (Stamp System):**
- Stamp 2 (Student): English proficiency, sufficient funds, course on ILEP list, part-time work allowed during term
- Stamp 1 (Work Permit): Job offer, skills shortage list, employer sponsorship, specific occupation
- Stamp 1G (Critical Skills/Graduate): Highly skilled occupation €30,000+ salary, or graduate seeking employment
- Stamp 4 (Family Reunion/Spouse): Spouse/child of Irish citizen/resident, sponsor earns €40,000+ (€50,000+ with dependents), genuine relationship proof, NO language test required, NO work experience required, NO personal funds required
- Stamp 3 (Family Member): Family of employment permit holder, no work without permit, dependent status, sponsor income requirements
- Stamp 0 (Visitor/Retiree): Sufficient funds, no work allowed, limited stay, self-sufficient
- Stamp 5 (Long-term Residency): 8+ years legal residence, no time conditions, full rights

**SCHENGEN VISAS (26 European Countries):**
- Type A (Airport Transit): Transit through international zone only, no entry to Schengen area
- Type C (Tourism/Business): 90 days in 180-day period, €30,000+ travel insurance, sufficient funds, return ticket
- Type C (Family Visit): Invitation letter, sponsor's residence permit, accommodation proof
- Type D (Work Permit): Job offer, work permit, €30,000+ insurance, accommodation proof
- Type D (Student): University admission, €11,208+ blocked account, health insurance, accommodation
- Type D (Family Reunion): Spouse/child of EU resident, marriage certificate, sponsor's income proof
- LTV (Limited Territorial): Humanitarian reasons, specific country restrictions

**NEW ZEALAND VISAS:**
- Skilled Migrant (Residence): 160+ points, age under 56, skilled occupation, English IELTS 6.5+, job offer
- Student Visa: NZQA approved course, NZD $20,000+ funds, English proficiency, health insurance
- Working Holiday: Age 18-30, passport from eligible country, NZD $4,200+ funds, no dependents
- Partner Visa: Spouse/de facto of NZ citizen/resident, genuine relationship, financial support
- Work Visa: Job offer, skills shortage list, employer sponsorship, English requirements
- Investor Visa: NZD $3M+ investment, 3+ years business experience, English IELTS 3.0+

**SINGAPORE VISAS:**
- Employment Pass: Monthly salary S$4,500+ (S$5,000+ for financial services), degree, job offer
- S Pass: Monthly salary S$2,500+ (S$3,000+ for financial services), diploma/certificate, job offer
- Work Permit: Specific sectors, employer sponsorship, medical examination, security bond
- Student Pass: MOE approved school, sufficient funds, health insurance, accommodation
- Family Visa: Spouse/child of Employment Pass holder, marriage certificate, sponsor's income
- Entrepreneur Pass: Innovative business, S$50,000+ investment, business plan, experience

**UAE VISAS:**
- Employment Visa: Job offer, medical examination, security deposit, employer sponsorship
- Investor Visa: AED 1M+ investment, business plan, health insurance, accommodation
- Student Visa: University admission, sufficient funds, health insurance, accommodation
- Family Visa: Spouse/child of UAE resident, marriage certificate, sponsor's income proof
- Golden Visa (Long-term): 10-year renewable, investors, entrepreneurs, professionals, students
- Freelancer Visa: Freelance permit, health insurance, accommodation, sufficient funds

**NETHERLANDS VISAS:**
- Highly Skilled Migrant: Monthly salary €4,840+ (€3,381+ under 30), job offer, degree recognition
- Student Visa: University admission, €11,208+ blocked account, health insurance, accommodation
- Family Reunion: Spouse/child of Dutch resident, marriage certificate, sponsor's income proof
- Startup Visa: Innovative business, €1,250+ monthly income, business plan, mentor support
- EU Blue Card: University degree, job offer €5,304+ monthly, health insurance
- Orientation Year: Recent graduate, 1 year job search, health insurance, sufficient funds

**JAPAN VISAS:**
- Work Visa: Job offer, degree/certificate, specific occupation, health insurance
- Student Visa: University admission, ¥80,000+ monthly funds, health insurance, accommodation
- Spouse Visa: Marriage to Japanese citizen, marriage certificate, financial support
- Highly Skilled Professional: 70+ points system, job offer, degree, experience, salary
- Working Holiday: Age 18-30, passport from eligible country, ¥200,000+ funds
- Investor Visa: ¥5M+ investment, business plan, office space, 2+ employees

**SOUTH KOREA VISAS:**
- E-2 (Work): Teaching English, bachelor's degree, TEFL certificate, health check
- D-2 (Student): University admission, $10,000+ bank statement, health insurance
- F-6 (Spouse): Marriage to Korean citizen, marriage certificate, financial support
- F-4 (Overseas Korean): Korean heritage, age 18+, criminal background check
- C-3 (Visitor): Tourism/business, sufficient funds, return ticket, accommodation
- E-7 (Specialty): Professional occupation, degree, job offer, health check
- F-2 (Resident): Long-term residence, Korean language test, financial stability
- D-8 (Investor): Business investment, $100,000+ investment, business plan

**CERTIFICATE VERIFICATION AND EQUIVALENCY (CRITICAL FOR STUDENT VISAS):**
- Many countries require foreign educational certificates to be verified for equivalency
- Common verification bodies: NARIC (UK), WES (Canada/US), CIMEA (Italy), ENIC (Europe), NARIC (Ireland)
- Verification Status: Already verified = STRONG, in progress = MODERATE, not started = WEAK, rejected = MAJOR RED FLAG
- Equivalency Level: Equivalent or higher = STRONG, lower = WEAK, not assessed = MODERATE, rejected = MAJOR RED FLAG
- Timeline: 1-2 weeks = FAST, 1-2 months = NORMAL, 3-6 months = SLOW, unknown = RISK
- Countries requiring verification: Italy (CIMEA), Germany (ZAB), France (ENIC-NARIC), Spain (UNED), Netherlands (Nuffic)
- Real-world scenario: South African degree for Italian university = MUST be verified by CIMEA for equivalency

**HOME TIES AND STRONG CONNECTIONS (CRITICAL FOR VISITOR VISAS):**
- Property Ownership: Own home/property = STRONG tie, renting = moderate, no property = WEAK tie
- Family in Home Country: Spouse/children = STRONGEST tie, parents/siblings = strong, no family = WEAK
- Employment: Permanent job = STRONG tie, contract = moderate, unemployed = WEAK
- Business: Own business = STRONG tie, family business = moderate, no business = WEAK
- Bank Accounts: Multiple accounts = STRONG tie, single account = moderate, no accounts = WEAK
- Travel History: Extensive travel = POSITIVE, no travel = NEGATIVE (first-time traveler risk)
- Return Ticket: Confirmed return = STRONG, one-way = RED FLAG
- Criminal Record: Clean record = POSITIVE, serious offenses = MAJOR RED FLAG
- Previous Rejections: No rejections = POSITIVE, multiple rejections = MAJOR RED FLAG

**REAL-WORLD SCENARIOS:**
- South African visiting UK boyfriend with no property = HIGH REJECTION RISK
- Young single person with no family ties = HIGH REJECTION RISK
- Person with previous visa rejections = HIGH REJECTION RISK
- One-way ticket without strong ties = HIGH REJECTION RISK
- No employment or business in home country = HIGH REJECTION RISK

IMPORTANT: For Stamp 4 (Family Reunion), focus ONLY on relationship proof and sponsor income. Do NOT ask for work experience or language tests as these are NOT required for family reunion visas.

Provide ACCURATE assessments based on these REAL requirements. Be specific about:
1. Exact score/requirement gaps
2. Realistic timeline and costs
3. Actual government requirements
4. Common reasons for rejection
5. Home ties strength and potential red flags`;

    const prompt = `Assess REALISTIC visa eligibility for ${profile.targetCountry.toUpperCase()} ${profile.visaType.toUpperCase()} visa.

${profile.visaType === 'stamp_4' ? `
CRITICAL: This is Ireland Stamp 4 (Family Reunion/Spouse visa). 
REQUIREMENTS FOR STAMP 4:
- Relationship: Must be spouse/child of Irish citizen or resident
- Sponsor Income: €40,000+ annually (€50,000+ with dependents)
- Genuine relationship proof required
- NO work experience required
- NO language test required
- NO proof of funds required (sponsor provides support)

ASSESSMENT FOCUS: Only evaluate relationship proof and sponsor income. Ignore work experience, language tests, and personal funds.
` : ''}

APPLICANT PROFILE:
- Age: ${profile.age || 'Not provided'}
- Education: ${profile.education || 'Not provided'}
- Work Experience: ${profile.workExperience || 'Not provided'}
- Language Test: ${profile.languageTest || 'Not provided'}
- Language Score: ${profile.languageScore || 'Not provided'}
- Proof of Funds: ${profile.funds || 'Not provided'}
- Nationality: ${profile.nationality || 'Not provided'}
- Marital Status: ${profile.maritalStatus || 'Not provided'}
- Dependents: ${profile.dependents || 'Not provided'}

CERTIFICATE VERIFICATION (CRITICAL FOR STUDENT VISAS):
- Verification Status: ${(profile as any).certificateVerification || 'Not provided'}
- Verification Body: ${(profile as any).verificationBody || 'Not provided'}
- Verification Timeline: ${(profile as any).verificationTimeline || 'Not provided'}
- Equivalency Level: ${(profile as any).equivalencyLevel || 'Not provided'}

HOME TIES AND STRONG CONNECTIONS (CRITICAL FOR VISITOR VISAS):
- Property Ownership: ${(profile as any).propertyOwnership || 'Not provided'}
- Family in Home Country: ${(profile as any).familyInHomeCountry || 'Not provided'}
- Employment in Home Country: ${(profile as any).employmentInHomeCountry || 'Not provided'}
- Business in Home Country: ${(profile as any).businessInHomeCountry || 'Not provided'}
- Bank Accounts in Home Country: ${(profile as any).bankAccountsHomeCountry || 'Not provided'}
- Previous Travel History: ${(profile as any).previousTravelHistory || 'Not provided'}
- Return Ticket: ${(profile as any).returnTicket || 'Not provided'}
- Accommodation Proof: ${(profile as any).accommodationProof || 'Not provided'}
- Criminal Record: ${(profile as any).criminalRecord || 'Not provided'}
- Previous Visa Rejections: ${(profile as any).previousVisaRejections || 'Not provided'}
- Health Insurance: ${(profile as any).healthInsurance || 'Not provided'}
- Sponsor Relationship: ${(profile as any).sponsorRelationship || 'Not provided'}

${profile.visaType.includes('family') || profile.visaType.includes('spouse') || profile.visaType.includes('reunion') || profile.visaType.includes('stamp_4') || profile.visaType.includes('stamp_3') ? `
FAMILY-SPECIFIC DETAILS:
- Relationship to Sponsor: ${profile.relationship || 'Not provided'}
- Sponsor's Status: ${profile.sponsorStatus || 'Not provided'}
- Sponsor's Income: ${profile.sponsorIncome || 'Not provided'}
` : ''}

${profile.visaType.includes('work') || profile.visaType.includes('h1b') || profile.visaType.includes('skilled') || profile.visaType.includes('stamp_1') || profile.visaType.includes('stamp_1g') ? `
WORK-SPECIFIC DETAILS:
- Job Offer: ${profile.jobOffer || 'Not provided'}
- Employer: ${profile.employer || 'Not provided'}
- Salary: ${profile.salary || 'Not provided'}
` : ''}

${profile.visaType.includes('study') || profile.visaType.includes('student') || profile.visaType.includes('stamp_2') ? `
STUDY-SPECIFIC DETAILS:
- Institution: ${profile.institution || 'Not provided'}
- Program: ${profile.program || 'Not provided'}
- Tuition: ${profile.tuition || 'Not provided'}
` : ''}

Based on ACTUAL ${profile.targetCountry} visa requirements:

${profile.visaType === 'stamp_4' ? `
FOR STAMP 4 FAMILY REUNION VISA:
- ONLY assess relationship proof and sponsor income
- IGNORE work experience, language tests, personal funds
- Sponsor income: €40,000+ (€50,000+ with dependents)
- Relationship: Must be spouse/child of Irish citizen/resident
- If sponsor income is €55,000 and relationship is spouse, this meets requirements
` : ''}

**AGENT-FIRST ASSESSMENT REQUIRED:**

1. **ELIGIBILITY PERCENTAGE** (0-100%): Calculate realistic chance of approval
2. **CONFIDENCE LEVEL**: High (80%+), Medium (50-79%), Low (below 50%)
3. **PROCESSING TIME**: Realistic timeline (e.g., "4-6 weeks", "8-12 weeks")
4. **RECOMMENDED BOOKING DATE**: When to book flights (e.g., "After Week 6", "Wait 2 months")
5. **RED FLAGS**: Specific high-risk factors (e.g., "No property ownership", "One-way ticket")
6. **SPECIFIC IMPROVEMENTS**: Exact numbers needed (e.g., "Need R30,000 more savings", "IELTS 7.0 required")
7. **AGENT ACTION**: What agent should tell client ("Book now", "Wait and improve", "Not recommended")

**REAL-WORLD SCENARIOS TO CONSIDER:**
- South African visiting UK boyfriend with no property = HIGH REJECTION RISK
- Young single person with no family ties = HIGH REJECTION RISK
- Person with previous visa rejections = HIGH REJECTION RISK
- One-way ticket without strong ties = HIGH REJECTION RISK
- No employment or business in home country = HIGH REJECTION RISK

Be brutally honest. If they have 45% chance, say so. If they need R30k more, state exact amount.

${profile.visaType === 'stamp_4' ? `
REMEMBER: For Stamp 4, do NOT ask for work experience or language tests. Focus only on relationship and sponsor income.
` : ''}

Format as JSON:
{
  "eligibilityPercentage": 87,
  "confidenceLevel": "High",
  "processingTime": "4-6 weeks",
  "recommendedBookingDate": "After Week 6",
  "redFlags": [],
  "improvementsNeeded": [],
  "agentAction": "Book now - high chance of approval",
  "score": 87,
  "eligible": true,
  "analysis": "Your profile meets X requirements but needs improvement in Y. Specifically: [mention actual requirements vs their profile]",
  "recommendations": [
    "Improve IELTS to 7.0 (currently 6.5) - adds 5 CRS points",
    "Show CAD $23,000 in funds (currently showing $15,000)",
    "Get 1 more year experience for 50 CRS points"
  ]
}`;

    const response = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2, // Lower temperature for more factual responses
      max_tokens: 700,
    });

    const resultText = response.choices[0]?.message?.content || '{}';
    const tokensUsed = response.usage?.total_tokens || 0;

    // Parse AI response
    let result;
    try {
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      result = {
        score: 50,
        eligible: true,
        analysis: 'Unable to parse detailed analysis. Please provide more information for accurate assessment.',
        recommendations: ['Provide complete profile information including language scores and financial proof']
      };
    }

    // Track usage if userId provided
    if (userId) {
      try {
        const { query } = await import('../config/database');
        await query(
          'INSERT INTO api_usage (user_id, feature, tokens_used, cost_usd, success, timestamp) VALUES ($1, $2, $3, $4, $5, NOW())',
          [userId, 'visa_eligibility_check', tokensUsed, 0, true]
        );
      } catch (error) {
        logger.error('Failed to track visa eligibility usage:', error);
      }
    }

    logger.info('Eligibility check completed', { score: result.score, tokensUsed });

    return {
      eligible: result.score >= 50,
      score: result.score || 50,
      analysis: result.analysis || 'Eligibility assessment completed based on official requirements.',
      recommendations: result.recommendations || [],
      tokensUsed,
    };
  } catch (error: any) {
    logger.error('Eligibility check error', { error: error.message });
    throw new Error('Failed to check eligibility. Please try again.');
  }
};

// Generate Email Template for Embassy/Consulate
export const generateEmailTemplate = async (data: {
  emailType: string; // 'follow-up' | 'inquiry' | 'request' | 'thank-you'
  recipientName?: string;
  recipientTitle?: string;
  embassy?: string;
  country?: string;
  applicationRef?: string;
  submissionDate?: string;
  specificQuery?: string;
  senderName: string;
  senderEmail?: string;
}): Promise<{ email: string; tokensUsed: number }> => {
  try {
    logger.info('Email Template Generation', { emailType: data.emailType, country: data.country });

    const systemPrompt = `You are an expert in writing professional, formal correspondence to embassies and consulates. 

Your emails are:
- Polite and respectful
- Clear and concise
- Professionally formatted
- Follow diplomatic etiquette
- Include all necessary reference information
- Have appropriate tone for immigration context

Format emails with:
- Proper subject line
- Formal greeting
- Clear body with specific details
- Professional closing
- Contact information`;

    const prompt = `Generate a professional ${data.emailType} email to ${data.embassy || 'the embassy/consulate'}.

DETAILS:
- Type: ${data.emailType}
- Recipient: ${data.recipientName || 'Visa Officer'}
- Title: ${data.recipientTitle || 'Sir/Madam'}
- Embassy: ${data.embassy || 'Embassy/Consulate'}
- Country: ${data.country || 'Not specified'}
- Application Reference: ${data.applicationRef || 'Not provided'}
- Submission Date: ${data.submissionDate || 'Not provided'}
- Specific Query: ${data.specificQuery || 'General status inquiry'}
- Sender: ${data.senderName}
- Email: ${data.senderEmail || 'Not provided'}

Generate a complete, professional email including:
1. Subject line
2. Formal greeting
3. Introduction with reference numbers
4. Clear explanation of purpose
5. Specific request or query
6. Expression of gratitude
7. Professional closing with sender details

Make it concise (200-300 words) but complete.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const email = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;

    logger.info('Email Template generated', { tokensUsed, length: email.length });

    return { email, tokensUsed };
  } catch (error: any) {
    logger.error('Email generation error', { error: error.message });
    throw new Error('Failed to generate email template. Please try again.');
  }
};

// Generate Support Letters (Invitation, Sponsorship, Employment)
export const generateSupportLetter = async (data: {
  letterType: string; // 'invitation' | 'sponsorship' | 'employment' | 'accommodation'
  hostName?: string;
  hostAddress?: string;
  hostPhone?: string;
  visitorName: string;
  visitorPassport?: string;
  visitorNationality?: string;
  visitPurpose?: string;
  visitDuration?: string;
  visitDates?: string;
  relationship?: string;
  financialSupport?: string;
  companyName?: string;
  jobTitle?: string;
  salary?: string;
  employmentDuration?: string;
}): Promise<{ letter: string; tokensUsed: number }> => {
  try {
    logger.info('Support Letter Generation', { letterType: data.letterType });

    const systemPrompt = `You are an expert in writing official support letters for visa applications.

Your letters are:
- Legally sound and properly formatted
- Include all required information for immigration
- Professional and formal tone
- Credible and verifiable
- Follow standard immigration letter formats
- Include proper declarations and signatures`;

    let specificInstructions = '';
    
    if (data.letterType === 'invitation') {
      specificInstructions = `Write an INVITATION LETTER from a host inviting someone to visit their country. Include:
- Host's full details (name, address, contact)
- Visitor's details (name, passport, nationality)
- Purpose and duration of visit
- Relationship between host and visitor
- Accommodation arrangements
- Declaration that host takes responsibility
- Proper date and signature line`;
    } else if (data.letterType === 'sponsorship') {
      specificInstructions = `Write a FINANCIAL SPONSORSHIP LETTER declaring financial support. Include:
- Sponsor's details and financial status
- Relationship to applicant
- Specific amount being sponsored
- Duration of sponsorship
- Source of funds
- Bank account information reference
- Legal declaration of sponsorship
- Proper date and signature line`;
    } else if (data.letterType === 'employment') {
      specificInstructions = `Write an EMPLOYMENT VERIFICATION LETTER. Include:
- Company letterhead format
- Employee name and position
- Employment start date and duration
- Salary information
- Job responsibilities (brief)
- Company's support for visa application
- Contact person for verification
- Company stamp and signature line`;
    } else if (data.letterType === 'accommodation') {
      specificInstructions = `Write an ACCOMMODATION CONFIRMATION LETTER. Include:
- Property owner/host details
- Property address
- Accommodation type
- Guest details
- Duration of stay
- Facilities provided
- Declaration of free accommodation (if applicable)
- Contact details for verification`;
    }

    const prompt = `Generate a ${data.letterType.toUpperCase()} letter for visa application purposes.

PROVIDED INFORMATION:
- Letter Type: ${data.letterType}
- Host/Sponsor Name: ${data.hostName || 'Not provided'}
- Address: ${data.hostAddress || 'Not provided'}
- Phone: ${data.hostPhone || 'Not provided'}
- Visitor/Applicant Name: ${data.visitorName}
- Passport Number: ${data.visitorPassport || 'Not provided'}
- Nationality: ${data.visitorNationality || 'Not provided'}
- Visit Purpose: ${data.visitPurpose || 'Not provided'}
- Duration: ${data.visitDuration || 'Not provided'}
- Dates: ${data.visitDates || 'Not provided'}
- Relationship: ${data.relationship || 'Not provided'}
- Financial Support: ${data.financialSupport || 'Not provided'}
- Company: ${data.companyName || 'Not provided'}
- Job Title: ${data.jobTitle || 'Not provided'}
- Salary: ${data.salary || 'Not provided'}
- Employment Duration: ${data.employmentDuration || 'Not provided'}

${specificInstructions}

Make it professional, complete, and ready to submit with visa application (400-600 words).`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const letter = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;

    logger.info('Support Letter generated', { tokensUsed, length: letter.length, type: data.letterType });

    return { letter, tokensUsed };
  } catch (error: any) {
    logger.error('Support letter generation error', { error: error.message });
    throw new Error('Failed to generate support letter. Please try again.');
  }
};

// Format Travel History into Professional Table
export const formatTravelHistory = async (data: {
  travelHistory: string; // Raw text or structured data
  format?: string; // 'table' | 'list' | 'paragraph'
}): Promise<{ formatted: string; tokensUsed: number }> => {
  try {
    logger.info('Travel History Formatting', { format: data.format });

    const systemPrompt = `You are an expert in formatting travel history for visa applications.

Extract travel information and present it in a clear, organized format that immigration officers prefer:
- Chronological order (most recent first)
- Include: Country, Entry Date, Exit Date, Duration, Purpose
- Professional table or list format
- Clear, easy to read
- Accurate date calculations`;

    const prompt = `Format this travel history for a visa application:

RAW TRAVEL DATA:
${data.travelHistory}

Create a professional ${data.format || 'table'} format showing:
1. Country visited
2. Entry date (dd/mm/yyyy)
3. Exit date (dd/mm/yyyy)
4. Duration (days)
5. Purpose of visit (if mentioned)

Then provide a summary:
- Total number of trips
- Total days traveled
- Countries visited

Make it clear, organized, and ready to submit with visa application.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 700,
    });

    const formatted = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;

    logger.info('Travel History formatted', { tokensUsed });

    return { formatted, tokensUsed };
  } catch (error: any) {
    logger.error('Travel history formatting error', { error: error.message });
    throw new Error('Failed to format travel history. Please try again.');
  }
};

// Generate Financial Justification Letter
export const generateFinancialLetter = async (data: {
  applicantName: string;
  targetCountry: string;
  visaType: string;
  availableFunds: string;
  sourceOfFunds: string; // 'salary' | 'savings' | 'loan' | 'sponsor' | 'mixed'
  monthlyIncome?: string;
  occupation?: string;
  sponsorName?: string;
  sponsorRelationship?: string;
  specificAmount?: string;
}): Promise<{ letter: string; tokensUsed: number }> => {
  try {
    logger.info('Financial Letter Generation', { country: data.targetCountry, visaType: data.visaType });

    const systemPrompt = `You are an expert in writing financial justification letters for visa applications.

Your letters:
- Clearly explain source of funds
- Provide specific amounts and calculations
- Address common visa officer concerns
- Are credible and verifiable
- Follow immigration documentation standards
- Include proper declarations`;

    const prompt = `Generate a FINANCIAL JUSTIFICATION LETTER for ${data.targetCountry} ${data.visaType} visa application.

APPLICANT DETAILS:
- Name: ${data.applicantName}
- Target Country: ${data.targetCountry}
- Visa Type: ${data.visaType}
- Available Funds: ${data.availableFunds}
- Source of Funds: ${data.sourceOfFunds}
- Monthly Income: ${data.monthlyIncome || 'Not provided'}
- Occupation: ${data.occupation || 'Not provided'}
- Sponsor Name: ${data.sponsorName || 'Self-funded'}
- Sponsor Relationship: ${data.sponsorRelationship || 'N/A'}
- Specific Amount: ${data.specificAmount || data.availableFunds}

The letter should:
1. State available funds clearly
2. Explain source of funds credibly
3. Break down how funds will cover expenses
4. Address visa financial requirements
5. Provide supporting document references
6. Include declaration statement
7. Be ready to submit with bank statements

Length: 300-400 words. Professional, credible, specific.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const letter = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;

    logger.info('Financial Letter generated', { tokensUsed, length: letter.length });

    return { letter, tokensUsed };
  } catch (error: any) {
    logger.error('Financial letter generation error', { error: error.message });
    throw new Error('Failed to generate financial letter. Please try again.');
  }
};

// Generate Purpose of Visit Explanation
export const generatePurposeOfVisit = async (data: {
  applicantName: string;
  targetCountry: string;
  visaType: string;
  visitPurpose: string; // 'tourism' | 'business' | 'medical' | 'family' | 'conference' | 'other'
  duration: string;
  itinerary?: string;
  tiestoHomeCountry?: string;
  returnPlan?: string;
}): Promise<{ explanation: string; tokensUsed: number }> => {
  try {
    logger.info('Purpose of Visit Generation', { country: data.targetCountry, purpose: data.visitPurpose });

    const systemPrompt = `You are an expert in writing purpose of visit explanations for visa applications.

Your explanations:
- Are clear and genuine
- Address visa officer concerns about intent
- Emphasize ties to home country
- Provide specific itinerary details
- Are credible and verifiable
- Address common rejection reasons`;

    const prompt = `Generate a PURPOSE OF VISIT EXPLANATION for ${data.targetCountry} visa application.

DETAILS:
- Applicant: ${data.applicantName}
- Country: ${data.targetCountry}
- Visa Type: ${data.visaType}
- Purpose: ${data.visitPurpose}
- Duration: ${data.duration}
- Itinerary: ${data.itinerary || 'General visit'}
- Ties to Home Country: ${data.tiestoHomeCountry || 'Not specified'}
- Return Plan: ${data.returnPlan || 'Return after visit'}

Write a compelling explanation that:
1. Clearly states purpose of visit
2. Provides specific plans/itinerary
3. Explains why this visit is important
4. Emphasizes intention to return home
5. Mentions ties to home country
6. Addresses any visa officer concerns
7. Is honest and credible

Length: 250-350 words. Sincere, specific, credible.`;

    const response = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 600,
    });

    const explanation = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;

    logger.info('Purpose of Visit generated', { tokensUsed, length: explanation.length });

    return { explanation, tokensUsed };
  } catch (error: any) {
    logger.error('Purpose of visit generation error', { error: error.message });
    throw new Error('Failed to generate purpose of visit. Please try again.');
  }
};

// Generate Ties to Home Country Demonstrator
export const generateTiesToHomeCountry = async (data: {
  applicantName: string;
  targetCountry: string;
  visaType: string;
  homeCountry: string;
  // Financial Ties
  bankAccounts?: string;
  investments?: string;
  propertyOwnership?: string;
  incomeSources?: string;
  // Employment Ties
  employmentStatus?: string;
  jobDetails?: string;
  businessOwnership?: string;
  businessDetails?: string;
  // Family Ties
  spouseInHomeCountry?: string;
  childrenInHomeCountry?: string;
  dependentsInHomeCountry?: string;
  parentsInHomeCountry?: string;
  familyDetails?: string;
  // Property Ties
  landOwnership?: string;
  houseOwnership?: string;
  vehicleOwnership?: string;
  propertyDetails?: string;
  // Social Ties
  communityInvolvement?: string;
  memberships?: string;
  socialConnections?: string;
  // Educational Ties
  ongoingStudies?: string;
  enrolledCourses?: string;
  educationalCommitments?: string;
  // Additional
  previousTravelHistory?: string;
  returnTicket?: string;
  accommodationProof?: string;
  otherTies?: string;
}): Promise<{ document: string; tokensUsed: number }> => {
  try {
    logger.info('Ties to Home Country Generation', { country: data.targetCountry, visaType: data.visaType });

    const systemPrompt = `You are an expert in writing comprehensive documents that demonstrate strong ties to home country for visa applications.

Your documents:
- Clearly demonstrate genuine intent to return home
- Provide specific, verifiable evidence across all tie categories
- Address visa officer concerns about immigration intent
- Are credible, well-structured, and comprehensive
- Follow immigration documentation standards
- Emphasize strong connections to home country across multiple dimensions
- Organize information into clear sections by tie category`;

    const prompt = `Generate a comprehensive TIES TO HOME COUNTRY DEMONSTRATION document for ${data.targetCountry} ${data.visaType} visa application.

APPLICANT DETAILS:
- Name: ${data.applicantName}
- Home Country: ${data.homeCountry}
- Target Country: ${data.targetCountry}
- Visa Type: ${data.visaType}

FINANCIAL TIES:
- Bank Accounts: ${data.bankAccounts || 'Not provided'}
- Investments: ${data.investments || 'Not provided'}
- Property Ownership: ${data.propertyOwnership || 'Not provided'}
- Income Sources: ${data.incomeSources || 'Not provided'}

EMPLOYMENT TIES:
- Employment Status: ${data.employmentStatus || 'Not provided'}
- Job Details: ${data.jobDetails || 'Not provided'}
- Business Ownership: ${data.businessOwnership || 'Not provided'}
- Business Details: ${data.businessDetails || 'Not provided'}

FAMILY TIES:
- Spouse in Home Country: ${data.spouseInHomeCountry || 'Not provided'}
- Children in Home Country: ${data.childrenInHomeCountry || 'Not provided'}
- Dependents in Home Country: ${data.dependentsInHomeCountry || 'Not provided'}
- Parents in Home Country: ${data.parentsInHomeCountry || 'Not provided'}
- Family Details: ${data.familyDetails || 'Not provided'}

PROPERTY TIES:
- Land Ownership: ${data.landOwnership || 'Not provided'}
- House Ownership: ${data.houseOwnership || 'Not provided'}
- Vehicle Ownership: ${data.vehicleOwnership || 'Not provided'}
- Property Details: ${data.propertyDetails || 'Not provided'}

SOCIAL TIES:
- Community Involvement: ${data.communityInvolvement || 'Not provided'}
- Memberships: ${data.memberships || 'Not provided'}
- Social Connections: ${data.socialConnections || 'Not provided'}

EDUCATIONAL TIES:
- Ongoing Studies: ${data.ongoingStudies || 'Not provided'}
- Enrolled Courses: ${data.enrolledCourses || 'Not provided'}
- Educational Commitments: ${data.educationalCommitments || 'Not provided'}

ADDITIONAL INFORMATION:
- Previous Travel History: ${data.previousTravelHistory || 'Not provided'}
- Return Ticket: ${data.returnTicket || 'Not provided'}
- Accommodation Proof: ${data.accommodationProof || 'Not provided'}
- Other Ties: ${data.otherTies || 'Not provided'}

The document should be structured with clear sections:
1. Introduction - Statement of intent to return
2. Financial Ties - Bank accounts, investments, property, income
3. Employment Ties - Job, business ownership, career commitments
4. Family Ties - Spouse, children, dependents, parents
5. Property Ties - Land, house, vehicle ownership
6. Social Ties - Community involvement, memberships
7. Educational Ties - Ongoing studies, enrolled courses
8. Additional Evidence - Travel history, return plans
9. Conclusion - Summary of strong ties and commitment to return

For each section, provide specific, verifiable evidence. Address common concerns about immigration intent. Be professional, credible, specific, and compelling.

Length: 600-700 words. Comprehensive and well-organized.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const document = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;

    logger.info('Ties to Home Country document generated', { tokensUsed, length: document.length });

    return { document, tokensUsed };
  } catch (error: any) {
    logger.error('Ties to home country generation error', { error: error.message });
    throw new Error('Failed to generate ties to home country document. Please try again.');
  }
};

// Generate Travel Itinerary Builder
export const generateTravelItinerary = async (data: {
  applicantName: string;
  targetCountry: string;
  visaType: string;
  travelDates: string;
  cities: string;
  purpose: string;
  accommodation?: string;
  activities?: string;
  transportation?: string;
  budget?: string;
  travelCompanions?: string;
}): Promise<{ itinerary: string; tokensUsed: number }> => {
  try {
    logger.info('Travel Itinerary Generation', { country: data.targetCountry, visaType: data.visaType });

    const systemPrompt = `You are an expert in creating detailed travel itineraries for visa applications.

Your itineraries:
- Are detailed and specific
- Show clear travel plans
- Include dates, locations, and activities
- Are realistic and credible
- Follow embassy requirements
- Are professionally formatted
- Include budget breakdowns
- Show accommodation arrangements`;

    const prompt = `Generate a DETAILED TRAVEL ITINERARY for ${data.targetCountry} ${data.visaType} visa application.

APPLICANT DETAILS:
- Name: ${data.applicantName}
- Target Country: ${data.targetCountry}
- Visa Type: ${data.visaType}
- Travel Dates: ${data.travelDates}
- Cities to Visit: ${data.cities}
- Purpose of Visit: ${data.purpose}

TRAVEL DETAILS:
- Accommodation: ${data.accommodation || 'To be arranged'}
- Planned Activities: ${data.activities || 'Not specified'}
- Transportation: ${data.transportation || 'Not specified'}
- Budget: ${data.budget || 'Not specified'}
- Travel Companions: ${data.travelCompanions || 'Solo travel'}

The itinerary should include:
1. Day-by-day breakdown with dates
2. Cities and locations to visit
3. Specific activities and attractions
4. Accommodation details for each location
5. Transportation between cities
6. Budget breakdown (if provided)
7. Return travel plans
8. Professional format suitable for embassy submission

Format as a structured document with clear sections. Length: 500-600 words. Be specific, realistic, and detailed.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const itinerary = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;

    logger.info('Travel Itinerary generated', { tokensUsed, length: itinerary.length });

    return { itinerary, tokensUsed };
  } catch (error: any) {
    logger.error('Travel itinerary generation error', { error: error.message });
    throw new Error('Failed to generate travel itinerary. Please try again.');
  }
};


