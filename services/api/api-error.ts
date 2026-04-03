type ApiErrorPayload = {
  error?: string;
  message?: string;
};

const DEFAULT_API_ERROR_MESSAGE = "Something went wrong. Please try again.";
const UNAUTHORIZED_STATUSES = new Set([401, 403]);
const TOKEN_MESSAGE_PATTERN = /\b(token|bearer|jwt)\b/i;
const TOKEN_FAILURE_PATTERN = /\b(invalid|expired|malformed|revoked|unauthorized)\b/i;

const extractApiErrorMessage = (
  payload: unknown,
  fallback = DEFAULT_API_ERROR_MESSAGE,
) => {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const typedPayload = payload as ApiErrorPayload;

    if (typedPayload.message?.trim()) {
      return typedPayload.message;
    }

    if (typedPayload.error?.trim()) {
      return typedPayload.error;
    }
  }

  return fallback;
};

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }

  static fromResponse(status: number, payload: unknown) {
    return new ApiError(status, extractApiErrorMessage(payload), payload);
  }
}

export const isUnauthorizedStatus = (status: number) =>
  UNAUTHORIZED_STATUSES.has(status);

const getNormalizedErrorMessage = (error: unknown) =>
  extractApiErrorMessage(error).trim().toLowerCase();

export const isInvalidBearerTokenError = (error: unknown) => {
  if (!(error instanceof ApiError)) {
    return false;
  }

  if (!isUnauthorizedStatus(error.status)) {
    return false;
  }

  const normalizedMessage = getNormalizedErrorMessage(error);

  return (
    TOKEN_MESSAGE_PATTERN.test(normalizedMessage) &&
    TOKEN_FAILURE_PATTERN.test(normalizedMessage)
  );
};

export const getErrorMessage = (
  error: unknown,
  fallback = DEFAULT_API_ERROR_MESSAGE,
) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
