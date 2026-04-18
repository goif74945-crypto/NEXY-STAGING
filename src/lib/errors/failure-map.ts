export const FAILURE_MAP = {
  VALIDATION_ERROR: {
    httpStatus: 400,
    retryable: false,
  },
  UNAUTHORIZED: {
    httpStatus: 401,
    retryable: false,
  },
  FORBIDDEN: {
    httpStatus: 403,
    retryable: false,
  },
  NOT_FOUND: {
    httpStatus: 404,
    retryable: false,
  },
  CONFLICT: {
    httpStatus: 409,
    retryable: false,
  },
  INTERNAL_ERROR: {
    httpStatus: 500,
    retryable: true,
  },
} as const;

export type FailureCode = keyof typeof FAILURE_MAP;
