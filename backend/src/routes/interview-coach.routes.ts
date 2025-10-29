import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

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

    // Create mock interview record
    const mockInterview = await prisma.mockInterview.create({
      data: {
        userId: userId,
        visaType: visaType,
        questionId: questionId,
        userAnswer: userAnswer,
        durationSeconds: durationSeconds,
        aiFeedback: {
          overall_score: Math.floor(Math.random() * 3) + 6, // 6-8 range
          score_reasoning: "Mock feedback - AI service integration pending",
          strengths: ["Good attempt at answering the question"],
          improvements: ["Try to be more specific"],
          suggestions: ["Practice speaking more clearly"],
          red_flags_detected: [],
          consistency_with_sop: true,
          clarity_score: 7,
          confidence_assessment: "moderate",
          overall_assessment: "This is a reasonable answer.",
          category_scores: {
            clarity: 7,
            completeness: 6,
            confidence: 7,
            consistency: 8,
            relevance: 7
          }
        },
        score: Math.floor(Math.random() * 3) + 6,
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
