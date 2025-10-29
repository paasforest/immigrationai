import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const visaType = request.nextUrl.searchParams.get('visaType');

    // Build where clause
    const whereClause: any = { userId };
    if (visaType) {
      whereClause.visaType = visaType;
    }

    // Get interview history
    const interviews = await prisma.mockInterview.findMany({
      where: whereClause,
      include: {
        question: {
          select: {
            question: true,
            category: true,
            difficulty: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    // Transform the data to match expected format
    const transformedInterviews = interviews.map(interview => ({
      id: interview.id,
      question: interview.question.question,
      category: interview.question.category,
      difficulty: interview.question.difficulty,
      score: interview.score,
      createdAt: interview.createdAt,
      feedback: {
        strengths: interview.aiFeedback.strengths || [],
        improvements: interview.aiFeedback.improvements || []
      }
    }));

    return NextResponse.json(transformedInterviews);

  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}





