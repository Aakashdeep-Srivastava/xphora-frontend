// Global error handling utilities
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 500,
    public isOperational = true,
  ) {
    super(message)
    this.name = "AppError"
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, "VALIDATION_ERROR", 400)
    this.name = "ValidationError"
  }
}

export class APIError extends AppError {
  constructor(message: string, service: string, statusCode = 500) {
    super(message, `API_ERROR_${service.toUpperCase()}`, statusCode)
    this.name = "APIError"
  }
}

// Error reporting utility
export function reportError(error: Error, context?: Record<string, any>) {
  console.error("Application Error:", {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  })

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or Bugsnag
  if (process.env.NODE_ENV === "production") {
    // Example: Sentry.captureException(error, { extra: context })
  }
}

// Global error boundary handler
export function handleGlobalError(error: Error, errorInfo?: any) {
  reportError(error, errorInfo)

  // You might want to show a user-friendly error message
  // or redirect to an error page
}
