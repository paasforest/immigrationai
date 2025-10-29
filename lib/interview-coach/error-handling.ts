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

// Note: Mock fallback functions removed for production.
// All services should use real API calls. If services fail, proper error handling
// should be used instead of returning mock data.

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


