// Error handling utilities for interview coach
export class InterviewCoachError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'InterviewCoachError';
  }
}

export const ERROR_CODES = {
  MICROPHONE_ACCESS_DENIED: 'MICROPHONE_ACCESS_DENIED',
  RECORDING_FAILED: 'RECORDING_FAILED',
  TRANSCRIPTION_FAILED: 'TRANSCRIPTION_FAILED',
  AI_FEEDBACK_FAILED: 'AI_FEEDBACK_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  QUESTION_NOT_FOUND: 'QUESTION_NOT_FOUND',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
} as const;

export class ErrorHandler {
  static handleError(error: unknown): InterviewCoachError {
    if (error instanceof InterviewCoachError) {
      return error;
    }

    if (error instanceof Error) {
      // Handle specific error types
      if (error.name === 'NotAllowedError') {
        return new InterviewCoachError(
          'Microphone access denied',
          ERROR_CODES.MICROPHONE_ACCESS_DENIED,
          false,
          'Please allow microphone access to use the recording feature.'
        );
      }

      if (error.name === 'NotFoundError') {
        return new InterviewCoachError(
          'Microphone not found',
          ERROR_CODES.MICROPHONE_ACCESS_DENIED,
          false,
          'No microphone detected. Please connect a microphone and try again.'
        );
      }

      if (error.message.includes('network') || error.message.includes('fetch')) {
        return new InterviewCoachError(
          'Network error',
          ERROR_CODES.NETWORK_ERROR,
          true,
          'Please check your internet connection and try again.'
        );
      }

      if (error.message.includes('transcription')) {
        return new InterviewCoachError(
          'Transcription failed',
          ERROR_CODES.TRANSCRIPTION_FAILED,
          true,
          'Failed to transcribe your audio. Please try speaking more clearly and try again.'
        );
      }

      if (error.message.includes('AI') || error.message.includes('feedback')) {
        return new InterviewCoachError(
          'AI feedback failed',
          ERROR_CODES.AI_FEEDBACK_FAILED,
          true,
          'Failed to generate feedback. Please try again.'
        );
      }

      // Generic error
      return new InterviewCoachError(
        error.message,
        'UNKNOWN_ERROR',
        true,
        'An unexpected error occurred. Please try again.'
      );
    }

    // Unknown error type
    return new InterviewCoachError(
      'Unknown error occurred',
      'UNKNOWN_ERROR',
      true,
      'An unexpected error occurred. Please try again.'
    );
  }

  static getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(1000 * Math.pow(2, attempt), 16000);
  }

  static shouldRetry(error: InterviewCoachError, attempt: number): boolean {
    if (attempt >= 3) return false; // Max 3 retries
    if (!error.retryable) return false;
    
    // Don't retry authentication errors
    if (error.code === ERROR_CODES.AUTHENTICATION_REQUIRED) return false;
    if (error.code === ERROR_CODES.MICROPHONE_ACCESS_DENIED) return false;
    
    return true;
  }
}

// Fallback functions for when services fail
export class FallbackService {
  static getMockTranscription(): string {
    return "This is a mock transcription. The audio recording feature is currently unavailable, but you can still practice by typing your answer below.";
  }

  static getMockFeedback(answer: string): any {
    return {
      overall_score: Math.floor(Math.random() * 3) + 6, // 6-8 range
      score_reasoning: "This is mock feedback. The AI analysis service is currently unavailable.",
      strengths: [
        "Good attempt at answering the question",
        "Shows understanding of the topic"
      ],
      improvements: [
        "Try to be more specific in your examples",
        "Consider adding more personal details"
      ],
      suggestions: [
        "Practice speaking more clearly",
        "Prepare specific examples beforehand"
      ],
      red_flags_detected: [],
      consistency_with_sop: true,
      clarity_score: 7,
      confidence_assessment: "moderate",
      overall_assessment: "This is a reasonable answer that shows understanding of the question.",
      category_scores: {
        clarity: 7,
        completeness: 6,
        confidence: 7,
        consistency: 8,
        relevance: 7
      },
      positive_elements: ["Attempted to answer the question"],
      lawyer_notes: ["Mock feedback - AI service unavailable"],
      recommended_practice_areas: ["General speaking practice"],
      next_questions_to_practice: [],
      key_phrases_used: [],
      confidence_level: "medium",
      completeness_score: 6
    };
  }

  static getMockQuestions(visaType: string): any[] {
    const mockQuestions = {
      'us_f1': [
        {
          id: 'mock_1',
          question: 'Why do you want to study in the United States?',
          category: 'education',
          difficulty: 'medium',
          context_tips: ['Be specific about your chosen university', 'Mention academic goals'],
          red_flags: ['Generic answers', 'Mentioning work opportunities'],
          ideal_elements: ['Specific university details', 'Academic interests', 'Career goals'],
          example_good_answer: 'I want to study Computer Science at Stanford because of their strong AI research program...',
          example_bad_answer: 'The US has good universities.'
        }
      ],
      'canada_study': [
        {
          id: 'mock_2',
          question: 'Why did you choose Canada for your studies?',
          category: 'education',
          difficulty: 'medium',
          context_tips: ['Mention specific Canadian universities', 'Show knowledge of Canada'],
          red_flags: ['Generic answers', 'Only mentioning work opportunities'],
          ideal_elements: ['University specifics', 'Research opportunities', 'Cultural interest'],
          example_good_answer: 'I chose Canada because the University of Toronto has excellent AI research...',
          example_bad_answer: 'Canada is a good country.'
        }
      ]
    };

    return (mockQuestions as any)[visaType] || mockQuestions['us_f1'];
  }
}

// Utility function to show user-friendly error messages
export function showErrorToUser(error: InterviewCoachError): void {
  const message = error.userMessage || error.message;
  
  // You can customize this based on your UI framework
  if (typeof window !== 'undefined') {
    alert(message);
  }
  
  console.error('Interview Coach Error:', {
    code: error.code,
    message: error.message,
    retryable: error.retryable,
    userMessage: error.userMessage
  });
}


