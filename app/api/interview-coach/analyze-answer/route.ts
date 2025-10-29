import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-mock',
});

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { visaType, questionId, userAnswer, durationSeconds } = await request.json();
    const userId = request.headers.get('x-user-id') || 'anonymous';

    if (!visaType || !questionId || !userAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the question from database
    const question = await prisma.interviewQuestion.findUnique({
      where: {
        id: questionId
      }
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Generate AI Feedback using GPT-4o
    const feedbackPrompt = `You are an expert immigration officer conducting visa interviews.

VISA TYPE: ${visaType}
ORIGINAL QUESTION: ${question.question}

WHAT THE OFFICER IS REALLY ASKING:
${(question.contextTips as string[]).map(tip => `- ${tip}`).join('\n')}

RED FLAGS (Things they should NEVER say):
${(question.redFlags as string[]).map(flag => `- ${flag}`).join('\n')}

IDEAL ELEMENTS (What should be included):
${(question.idealElements as string[]).map(elem => `- ${elem}`).join('\n')}

GOOD ANSWER EXAMPLE:
${question.exampleGoodAnswer}

BAD ANSWER EXAMPLE:
${question.exampleBadAnswer}

---

APPLICANT'S ACTUAL ANSWER:
"${userAnswer}"

DURATION: ${durationSeconds} seconds

NOW ANALYZE THE APPLICANT'S ANSWER:

1. Score it 1-10 (10 = perfect immigration officer answer)
2. Identify what they did WELL (be specific)
3. Identify areas for IMPROVEMENT (be constructive)
4. Provide 3-5 specific SUGGESTIONS to improve
5. Flag any RED FLAGS if present
6. Check if answer is CONSISTENT with typical visa applications
7. Overall assessment

RESPOND ONLY WITH VALID JSON (no markdown):
{
  "score": <number 1-10>,
  "score_reasoning": "<brief explanation of score>",
  "duration_assessment": "<was 60-90 seconds good? Did they ramble or rush?>",
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
  "consistency_with_sop": true,
  "consistency_notes": "<explanation if not consistent>",
  "clarity_score": <1-10 how clear was the answer>,
  "confidence_assessment": "<seems confident/hesitant/unsure>",
  "overall_assessment": "<2-3 sentence summary for officer>"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an experienced immigration officer conducting visa interviews. Provide detailed, constructive feedback on visa interview answers. Be objective and fair.'
        },
        {
          role: 'user',
          content: feedbackPrompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const feedback = JSON.parse(response.choices[0].message.content);

    // Transform to match our expected format
    const transformedFeedback = {
      overall_score: feedback.score,
      category_scores: {
        clarity: feedback.clarity_score,
        completeness: Math.round(feedback.score * 0.8),
        confidence: feedback.confidence_assessment.includes('confident') ? 8 : 5,
        consistency: feedback.consistency_with_sop ? 8 : 5,
        relevance: Math.round(feedback.score * 0.9)
      },
      strengths: feedback.strengths,
      improvements: feedback.improvements,
      suggestions: feedback.suggestions,
      red_flags_detected: feedback.red_flags_detected,
      positive_elements: feedback.strengths,
      lawyer_notes: [feedback.overall_assessment],
      recommended_practice_areas: feedback.improvements.slice(0, 3),
      next_questions_to_practice: [],
      consistency_with_sop: feedback.consistency_with_sop,
      key_phrases_used: [],
      confidence_level: feedback.confidence_assessment.includes('confident') ? 'high' : 'medium',
      clarity_score: feedback.clarity_score,
      completeness_score: Math.round(feedback.score * 0.8)
    };

    // Save the interview to database
    const mockInterview = await prisma.mockInterview.create({
      data: {
        userId: userId,
        questionId: questionId,
        visaType: visaType,
        userAnswer: userAnswer,
        durationSeconds: durationSeconds,
        aiFeedback: transformedFeedback,
        score: transformedFeedback.overall_score
      }
    });

    // Update user progress
    await updateUserProgress(userId, visaType, transformedFeedback.overall_score, question.category);

    return NextResponse.json({
      ...transformedFeedback,
      interviewId: mockInterview.id
    });

  } catch (error) {
    console.error('Error analyzing interview answer:', error);
    return NextResponse.json(
      { error: 'Failed to analyze answer' },
      { status: 500 }
    );
  }
}

async function updateUserProgress(userId: string, visaType: string, score: number, category: string) {
  try {
    // Get or create user progress record
    let progress = await prisma.userInterviewProgress.findUnique({
      where: {
        userId_visaType: {
          userId: userId,
          visaType: visaType
        }
      }
    });

    if (!progress) {
      progress = await prisma.userInterviewProgress.create({
        data: {
          userId: userId,
          visaType: visaType,
          questionsPracticed: 0,
          averageScore: 0,
          readinessScore: 0
        }
      });
    }

    // Update progress
    const newQuestionsPracticed = progress.questionsPracticed + 1;
    const newAverageScore = ((progress.averageScore * progress.questionsPracticed) + score) / newQuestionsPracticed;
    
    await prisma.userInterviewProgress.update({
      where: {
        id: progress.id
      },
      data: {
        questionsPracticed: newQuestionsPracticed,
        averageScore: newAverageScore,
        lastPracticeDate: new Date(),
        readinessScore: Math.round(newAverageScore * 10) // Convert to 0-100 scale
      }
    });

  } catch (error) {
    console.error('Error updating user progress:', error);
  }
}