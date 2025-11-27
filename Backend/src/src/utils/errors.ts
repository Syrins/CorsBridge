export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly cause?: unknown;

  constructor(message: string, statusCode = 500, details?: Record<string, unknown>, cause?: unknown) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.details = details;
    this.cause = cause;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, statusCode = 400, details?: Record<string, unknown>, cause?: unknown) {
    super(message, statusCode, details, cause);
  }
}

export class RateLimitError extends HttpError {
  constructor(message: string, statusCode = 429, details?: Record<string, unknown>, cause?: unknown) {
    super(message, statusCode, details, cause);
  }
}

export class PayloadTooLargeError extends HttpError {
  constructor(message = 'Payload too large', details?: Record<string, unknown>, cause?: unknown) {
    super(message, 413, details, cause);
  }
}

export class BadGatewayError extends HttpError {
  constructor(message = 'Bad Gateway', details?: Record<string, unknown>, cause?: unknown) {
    super(message, 502, details, cause);
  }
}

export class GatewayTimeoutError extends HttpError {
  constructor(message = 'Gateway Timeout', details?: Record<string, unknown>, cause?: unknown) {
    super(message, 504, details, cause);
  }
}
