import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { visaType } = await request.json();
    const userId = request.headers.get('x-user-id') || 'anonymous';

    if (!visaType) {
      return NextResponse.json(
        { error: 'Visa type is required' },
        { status: 400 }
      );
    }

    // Get a random question for the visa type
    const question = await prisma.interviewQuestion.findFirst({
      where: {
        visaType: visaType
      },
      orderBy: {
        id: 'asc' // Simple random for now
      }
    });

    if (!question) {
      return NextResponse.json(
        { error: 'No questions found for this visa type' },
        { status: 404 }
      );
    }

    // Create a new interview session
    const session = await prisma.interviewSession.create({
      data: {
        userId: userId,
        visaType: visaType,
        sessionName: `Practice Session ${new Date().toLocaleDateString()}`,
        questionsAttempted: 0,
        averageScore: 0,
        startedAt: new Date()
      }
    });

    return NextResponse.json({ 
      question: {
        id: question.id,
        question: question.question,
        category: question.category,
        difficulty: question.difficulty,
        visaType: question.visaType,
        context_tips: question.contextTips,
        red_flags: question.redFlags,
        ideal_elements: question.idealElements,
        example_good_answer: question.exampleGoodAnswer,
        example_bad_answer: question.exampleBadAnswer
      },
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error starting interview session:', error);
    return NextResponse.json(
      { error: 'Failed to start interview session' },
      { status: 500 }
    );
  }
}





