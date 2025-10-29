import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export interface AIFeedbackRequest {
  question: string;
  userAnswer: string;
  visaType: string;
  questionContext: {
    context_tips: string[];
    red_flags: string[];
    ideal_elements: string[];
    example_good_answer: string;
    example_bad_answer: string;
  };
}

export interface AIFeedbackResponse {
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
}

export async function getAIFeedback(request: AIFeedbackRequest): Promise<AIFeedbackResponse> {
  try {
    const prompt = `You are an expert immigration officer conducting a ${request.visaType} visa interview. 

ORIGINAL QUESTION: "${request.question}"

WHAT THE OFFICER IS REALLY ASKING:
${request.questionContext.context_tips.map(tip => `- ${tip}`).join('\n')}

RED FLAGS (Things they should NEVER say):
${request.questionContext.red_flags.map(flag => `- ${flag}`).join('\n')}

IDEAL ELEMENTS (What should be included):
${request.questionContext.ideal_elements.map(elem => `- ${elem}`).join('\n')}

GOOD ANSWER EXAMPLE:
${request.questionContext.example_good_answer}

BAD ANSWER EXAMPLE:
${request.questionContext.example_bad_answer}

---

APPLICANT'S ACTUAL ANSWER:
"${request.userAnswer}"

ANALYZE THE APPLICANT'S ANSWER AND PROVIDE DETAILED FEEDBACK:

1. Score it 1-10 (10 = perfect immigration officer answer)
2. Identify what they did WELL (be specific)
3. Identify areas for IMPROVEMENT (be constructive)
4. Provide 3-5 specific SUGGESTIONS to improve
5. Flag any RED FLAGS if present
6. Check if answer is CONSISTENT with typical visa applications
7. Assess clarity, completeness, confidence, and relevance

RESPOND ONLY WITH VALID JSON (no markdown):
{
  "overall_score": <number 1-10>,
  "category_scores": {
    "clarity": <number 1-10>,
    "completeness": <number 1-10>,
    "confidence": <number 1-10>,
    "consistency": <number 1-10>,
    "relevance": <number 1-10>
  },
  "strengths": [
    "<specific strength 1>",
    "<specific strength 2>",
    "<specific strength 3>"
  ],
  "improvements": [
    "<specific area to improve 1>",
    "<specific area to improve 2>",
    "<specific area to improve 3>"
  ],
  "suggestions": [
    "<actionable suggestion 1>",
    "<actionable suggestion 2>",
    "<actionable suggestion 3>",
    "<actionable suggestion 4>",
    "<actionable suggestion 5>"
  ],
  "red_flags_detected": [
    "<red flag 1 if detected>",
    "<red flag 2 if detected>"
  ],
  "positive_elements": [
    "<positive element 1>",
    "<positive element 2>"
  ],
  "lawyer_notes": [
    "<professional note 1>",
    "<professional note 2>"
  ],
  "recommended_practice_areas": [
    "<area 1>",
    "<area 2>"
  ],
  "next_questions_to_practice": [
    "<question type 1>",
    "<question type 2>"
  ],
  "consistency_with_sop": true,
  "key_phrases_used": [
    "<phrase 1>",
    "<phrase 2>"
  ],
  "confidence_level": "<low|medium|high>",
  "clarity_score": <number 1-10>,
  "completeness_score": <number 1-10>
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an experienced immigration officer conducting visa interviews. Provide detailed, constructive feedback on visa interview answers. Be objective, fair, and helpful. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    
    const feedback = JSON.parse(content);
    
    // Ensure all required fields are present with defaults
    return {
      overall_score: feedback.overall_score || 5,
      category_scores: {
        clarity: feedback.category_scores?.clarity || 5,
        completeness: feedback.category_scores?.completeness || 5,
        confidence: feedback.category_scores?.confidence || 5,
        consistency: feedback.category_scores?.consistency || 5,
        relevance: feedback.category_scores?.relevance || 5,
      },
      strengths: feedback.strengths || ['Attempted to answer the question'],
      improvements: feedback.improvements || ['Could provide more specific details'],
      suggestions: feedback.suggestions || ['Be more specific', 'Include examples', 'Show confidence'],
      red_flags_detected: feedback.red_flags_detected || [],
      positive_elements: feedback.positive_elements || ['Showed effort'],
      lawyer_notes: feedback.lawyer_notes || ['Good attempt, keep practicing'],
      recommended_practice_areas: feedback.recommended_practice_areas || ['Specificity', 'Detail'],
      next_questions_to_practice: feedback.next_questions_to_practice || [],
      consistency_with_sop: feedback.consistency_with_sop || true,
      key_phrases_used: feedback.key_phrases_used || [],
      confidence_level: feedback.confidence_level || 'medium',
      clarity_score: feedback.clarity_score || 5,
      completeness_score: feedback.completeness_score || 5,
    };

  } catch (error) {
    console.error('Error getting AI feedback:', error);
    
    // Return fallback feedback if AI fails
    return {
      overall_score: 5,
      category_scores: {
        clarity: 5,
        completeness: 5,
        confidence: 5,
        consistency: 5,
        relevance: 5,
      },
      strengths: ['Attempted to answer the question'],
      improvements: ['Could provide more specific details'],
      suggestions: ['Be more specific', 'Include examples', 'Show confidence'],
      red_flags_detected: [],
      positive_elements: ['Showed effort'],
      lawyer_notes: ['Good attempt, keep practicing'],
      recommended_practice_areas: ['Specificity', 'Detail'],
      next_questions_to_practice: [],
      consistency_with_sop: true,
      key_phrases_used: [],
      confidence_level: 'medium',
      clarity_score: 5,
      completeness_score: 5,
    };
  }
}

