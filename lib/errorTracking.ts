/**
 * Error tracking utility
 * In production, this could integrate with Sentry, LogRocket, etc.
 */

interface ErrorContext {
  userId?: string;
  organizationId?: string;
  path?: string;
  userAgent?: string;
  [key: string]: any;
}

export function logError(error: Error | string, context?: ErrorContext): void {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;

  const logData = {
    message: errorMessage,
    stack: errorStack,
    context,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  // In production, send to error tracking service
  // Example: Sentry.captureException(error, { extra: context });
  
  // For now, structured console error
  console.error('[Error Tracking]', JSON.stringify(logData, null, 2));
}

/**
 * Handle API errors and return user-friendly messages
 */
export function handleApiError(error: any): string {
  // Network errors
  if (!error.response) {
    return 'Unable to connect. Check your internet connection.';
  }

  const status = error.response?.status;
  const data = error.response?.data;

  switch (status) {
    case 401:
      // Already handled by interceptor (redirect to login)
      return 'Please log in to continue';
    case 403:
      return "You don't have permission to do this";
    case 404:
      return 'Not found';
    case 422:
      // Validation errors
      if (data?.errors) {
        return Object.values(data.errors).flat().join(', ');
      }
      return data?.error || 'Validation error';
    case 500:
      return 'Something went wrong on our end. Please try again.';
    default:
      return data?.error || data?.message || 'An error occurred';
  }
}
