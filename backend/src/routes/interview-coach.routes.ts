import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { analyzeInterviewAnswer } from '../services/aiService';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Start interview session
router.post('/start-session', async (req, res) => {
  try {
    const { visaType } = req.body;
    const userId = req.headers['x-user-id'] as string || '6d4faab5-d1c6-46da-ab34-c080509d64ac'; // Use our test user ID
    console.log('UserID being used:', userId, 'Length:', userId.length);

    if (!visaType) {
      return res.status(400).json({ error: 'Visa type is required' });
    }

    // Fetch a random question for the given visa type
    const questions = await prisma.interviewQuestion.findMany({
      where: { visaType: visaType },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions found for this visa type' });
    }

    const question = questions[0];

    // Create an interview session record
    const session = await prisma.interviewSession.create({
      data: {
        userId: userId,
        visaType: visaType,
        sessionName: `Practice Session ${new Date().toLocaleDateString()}`,
        questionsAttempted: 0,
        averageScore: 0,
        durationMinutes: 0,
        startedAt: new Date(),
      }
    });

    res.json({ 
      question,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Error starting interview session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// Analyze answer and provide feedback
router.post('/analyze-answer', async (req, res) => {
  try {
    const { questionId, userAnswer, visaType, sessionId } = req.body;
    const userId = req.headers['x-user-id'] as string || '6d4faab5-d1c6-46da-ab34-c080509d64ac'; // Use our test user ID

    if (!questionId || !userAnswer) {
      return res.status(400).json({ error: 'Question ID and user answer are required' });
    }

    // Fetch the question details
    const question = await prisma.interviewQuestion.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Calculate duration (rough estimate based on answer length)
    const durationSeconds = Math.max(30, Math.floor(userAnswer.length / 10));

    // Get AI feedback using real AI service
    let aiFeedback;
    try {
      const feedbackResult = await analyzeInterviewAnswer({
        question: question.question,
        userAnswer: userAnswer,
        visaType: visaType,
        questionCategory: question.category || undefined,
        questionDifficulty: question.difficulty || undefined,
        redFlags: question.red_flags || [],
        idealElements: question.ideal_elements || [],
      });

      aiFeedback = {
        overall_score: feedbackResult.overall_score,
        score_reasoning: feedbackResult.score_reasoning,
        strengths: feedbackResult.strengths,
        improvements: feedbackResult.improvements,
        suggestions: feedbackResult.suggestions,
        red_flags_detected: feedbackResult.red_flags_detected,
        positive_elements: feedbackResult.positive_elements,
        lawyer_notes: feedbackResult.lawyer_notes,
        recommended_practice_areas: feedbackResult.recommended_practice_areas,
        next_questions_to_practice: feedbackResult.next_questions_to_practice,
        consistency_with_sop: feedbackResult.consistency_with_sop,
        key_phrases_used: feedbackResult.key_phrases_used,
        confidence_level: feedbackResult.confidence_level,
        clarity_score: feedbackResult.clarity_score,
        completeness_score: feedbackResult.completeness_score,
        confidence_assessment: feedbackResult.confidence_assessment,
        overall_assessment: feedbackResult.overall_assessment,
        category_scores: feedbackResult.category_scores,
      };

      logger.info('AI feedback generated', { 
        interviewId: questionId,
        overall_score: feedbackResult.overall_score,
        tokensUsed: feedbackResult.tokensUsed
      });
    } catch (aiError: any) {
      logger.error('AI feedback generation failed', { error: aiError.message });
      // Fallback to basic feedback if AI service fails
      aiFeedback = {
        overall_score: 6,
        score_reasoning: "AI analysis temporarily unavailable. Please try again.",
        strengths: ["Answer provided"],
        improvements: ["Please retry for detailed feedback"],
        suggestions: ["Try again for AI-powered analysis"],
        red_flags_detected: [],
        positive_elements: [],
        lawyer_notes: ["AI service unavailable"],
        recommended_practice_areas: [],
        next_questions_to_practice: [],
        consistency_with_sop: true,
        key_phrases_used: [],
        confidence_level: "medium" as const,
        clarity_score: 6,
        completeness_score: 6,
        confidence_assessment: "unable to assess",
        overall_assessment: "AI analysis service temporarily unavailable.",
        category_scores: {
          clarity: 6,
          completeness: 6,
          confidence: 6,
          consistency: 7,
          relevance: 6
        }
      };
    }

    // Create interview record with real AI feedback
    const mockInterview = await prisma.mockInterview.create({
      data: {
        userId: userId,
        visaType: visaType,
        questionId: questionId,
        userAnswer: userAnswer,
        durationSeconds: durationSeconds,
        aiFeedback: aiFeedback as any,
        score: aiFeedback.overall_score,
      }
    });

    // Update user progress
    await updateUserProgress(userId, visaType);

    res.json({ 
      interviewId: mockInterview.id,
      feedback: mockInterview.aiFeedback,
      score: mockInterview.score
    });
  } catch (error) {
    console.error('Error analyzing answer:', error);
    res.status(500).json({ error: 'Failed to analyze answer' });
  }
});

// Get user progress
router.get('/progress', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || '6d4faab5-d1c6-46da-ab34-c080509d64ac'; // Use our test user ID

    const userProgress = await prisma.userInterviewProgress.findMany({
      where: { userId: userId },
      orderBy: { lastPracticeDate: 'desc' },
    });

    res.json({ progress: userProgress });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// Get user's past interviews
router.get('/interviews', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || '6d4faab5-d1c6-46da-ab34-c080509d64ac'; // Use our test user ID

    const interviews = await prisma.mockInterview.findMany({
      where: { userId: userId },
      include: {
        question: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ interviews });
  } catch (error) {
    console.error('Error fetching mock interviews:', error);
    res.status(500).json({ error: 'Failed to fetch mock interviews' });
  }
});

// Helper function to update user progress
async function updateUserProgress(userId: string, visaType: string) {
  try {
    // Get user's interviews for this visa type
    const interviews = await prisma.mockInterview.findMany({
      where: { 
        userId: userId,
        visaType: visaType
      }
    });

    const questionsPracticed = interviews.length;
    const averageScore = interviews.length > 0 
      ? interviews.reduce((sum, interview) => sum + (interview.score || 0), 0) / interviews.length 
      : 0;

    // Calculate readiness score (0-100)
    const readinessScore = Math.min(100, Math.floor(averageScore * 10));

    // Upsert user progress
    await prisma.userInterviewProgress.upsert({
      where: {
        userId_visaType: {
          userId: userId,
          visaType: visaType
        }
      },
      update: {
        questionsPracticed: questionsPracticed,
        averageScore: averageScore,
        readinessScore: readinessScore,
        lastPracticeDate: new Date(),
      },
      create: {
        userId: userId,
        visaType: visaType,
        questionsPracticed: questionsPracticed,
        averageScore: averageScore,
        readinessScore: readinessScore,
        lastPracticeDate: new Date(),
      }
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
  }
}

export default router;
