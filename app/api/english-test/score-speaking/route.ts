import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-mock',
});

export async function POST(request: NextRequest) {
  try {
    const { testType, part, userAnswer, targetBand, question } = await request.json();

    if (!testType || !userAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create scoring prompt based on test type
    const scoringPrompt = `You are an expert English language test examiner (IELTS/TOEFL/CELPIP).

TEST TYPE: ${testType}
PART/TASK: ${part}
TARGET BAND/SCORE: ${targetBand || 'Not specified'}
ORIGINAL QUESTION: ${question || 'Not provided'}

APPLICANT'S SPOKEN RESPONSE:
"${userAnswer}"

SCORE THIS RESPONSE ON:

1. FLUENCY & COHERENCE (How smoothly they speak)
   - Do they speak naturally without long pauses?
   - Is their speech organized and easy to follow?
   - Do they use linking words appropriately?
   - Score: 0-10

2. VOCABULARY (Word choice and range)
   - Do they use appropriate, varied vocabulary?
   - Any awkward word choices or repetition?
   - Do they use idiomatic expressions naturally?
   - Score: 0-10

3. GRAMMAR & SYNTAX (Sentence structure)
   - Are sentences grammatically correct?
   - Variety of structures (simple, complex, compound)?
   - Appropriate use of tenses?
   - Score: 0-10

4. PRONUNCIATION (Clarity and accent)
   - Are they easily understood?
   - Any significant pronunciation errors?
   - Do they stress words and sentences correctly?
   - Score: 0-10

5. TASK COMPLETION (Did they answer the question?)
   - Did they address the question fully?
   - Appropriate length for the task?
   - Did they stay on topic?
   - Score: 0-10

6. CONTENT & IDEAS (Quality of response)
   - Are ideas relevant and well-developed?
   - Do they provide specific examples?
   - Is the response engaging and interesting?
   - Score: 0-10

Return JSON:
{
  "fluency_score": 0-10,
  "vocabulary_score": 0-10,
  "grammar_score": 0-10,
  "pronunciation_score": 0-10,
  "task_completion_score": 0-10,
  "content_score": 0-10,
  "overall_band": <band equivalent (1-9 for IELTS, 0-30 for TOEFL, 1-12 for CELPIP)>,
  "band_level": "<A1|A2|B1|B2|C1|C2>",
  "strengths": ["strength1", "strength2", "strength3"],
  "areas_for_improvement": ["improvement1", "improvement2", "improvement3"],
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2", "actionable suggestion 3"],
  "comparison_to_target": "How this compares to the target band",
  "ready_for_real_test": true/false,
  "detailed_feedback": {
    "fluency_notes": "Specific notes about fluency",
    "vocabulary_notes": "Specific notes about vocabulary",
    "grammar_notes": "Specific notes about grammar",
    "pronunciation_notes": "Specific notes about pronunciation",
    "content_notes": "Specific notes about content"
  },
  "common_mistakes": ["mistake1", "mistake2"],
  "improvement_plan": {
    "immediate": ["What to fix right away"],
    "short_term": ["What to practice this week"],
    "long_term": ["What to work on over the next month"]
  }
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a strict, experienced IELTS/TOEFL/CELPIP examiner. Be objective and fair in your assessment. Provide constructive feedback that helps the student improve.'
        },
        { role: 'user', content: scoringPrompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const feedback = JSON.parse(response.choices[0].message.content);

    return NextResponse.json(feedback);

  } catch (error) {
    console.error('Error scoring speaking test:', error);
    return NextResponse.json(
      { error: 'Failed to score speaking test' },
      { status: 500 }
    );
  }
}




