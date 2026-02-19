import { AxiosError } from 'axios';

/**
 * Custom error class for API errors with user-friendly messages
 */
export class ApiError extends Error {
  code?: string;
  statusCode?: number;
  isRetryable?: boolean;

  constructor(
    message: string,
    code?: string,
    statusCode?: number,
    isRetryable?: boolean
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.isRetryable = isRetryable;
  }
}

/**
 * Maps HTTP status codes to user-friendly error messages
 */
const errorMessages: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'You are not authorized. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested item was not found.',
  409: 'This action conflicts with existing data.',
  422: 'Validation failed. Please check your input.',
  429: 'Too many requests. Please wait a moment.',
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable. Please try again.',
  503: 'Service temporarily unavailable. Please try again.',
};

/**
 * Checks if an error is retryable based on status code
 */
function isRetryableError(statusCode?: number): boolean {
  if (!statusCode) return true;
  // Retry on network errors or server errors (5xx)
  return statusCode >= 500 || statusCode === 429;
}

/**
 * Handles API errors and returns user-friendly error messages
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const message = 
      errorMessages[statusCode || 0] || 
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    
    return new ApiError(
      message,
      error.code,
      statusCode,
      isRetryableError(statusCode)
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 'UNKNOWN_ERROR', undefined, true);
  }

  return new ApiError('An unexpected error occurred', 'UNKNOWN_ERROR', undefined, true);
}

/**
 * Creates retry configuration for React Query
 * Returns retry count based on error type
 */
export function createRetryConfig(maxRetries = 3) {
  return (failureCount: number, error: unknown) => {
    if (error instanceof ApiError) {
      // Don't retry non-retryable errors
      if (!error.isRetryable) return false;
      // Retry retryable errors up to maxRetries
      return failureCount < maxRetries;
    }
    // Default retry behavior for unknown errors
    return failureCount < maxRetries;
  };
}

/**
 * Debounces a function to prevent rapid firing
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttles a function to limit execution rate
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Formats error messages for display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
