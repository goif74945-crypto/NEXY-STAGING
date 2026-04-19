import { z } from 'zod';

export const ErrorCodeValues = [
  'INVALID_DIRECTIVE',
  'EMPTY_INPUT',
  'AMBIGUOUS_INPUT',
  'UNVERIFIED_OUTPUT',
  'CONSENSUS_FAILED',
  'EVIDENCE_MISSING',
  'INSUFFICIENT_EVIDENCE',
  'SCHEMA_VIOLATION',
  'STATE_TRANSITION_DENIED',
  'INVALID_STATE',
  'AUTH_REQUIRED',
  'AUTH_INVALID',
  'AUTH_EXPIRED',
  'SESSION_EXPIRED',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'SESSION_REVOKED',
  'DEVICE_MISMATCH',
  'DEVICE_BINDING_MISMATCH',
  'CSRF_INVALID',
  'OTAC_LOCKED',
  'OTAC_EXPIRED',
  'OTAC_ATTEMPTS_EXCEEDED',
  'RATE_LIMIT_EXCEEDED',
  'RESOURCE_LIMIT_EXCEEDED',
  'SECURITY_BREACH_DETECTED',
  'SYSTEM_IN_FREEZE',
  'DEPENDENCY_FAILURE',
  'DEPENDENCY_UNHEALTHY',
  'TIMEOUT',
  'AGENT_TIMEOUT',
  'AGENT_SCHEMA_INVALID',
  'FREEZE_RECOVERY_DENIED',
  'VAULT_COMMIT_CONFLICT',
  'REVISION_NOT_FOUND',
  'REPOSITORY_FAILURE',
  'PIPELINE_CAP_EXCEEDED',
  'RELEASE_POLICY_FAILED',
  'UNRELEASEABLE_OUTPUT',
  'EXPORT_NOT_FOUND',
  'INCIDENT_NOT_FOUND',
  'UNKNOWN_INTERNAL_ERROR',
] as const;

export const ErrorCodeSchema = z.enum(ErrorCodeValues);
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ErrorSourceSchema = z.string().trim().min(1).max(128);
export type ErrorSource = z.infer<typeof ErrorSourceSchema>;

export const ErrorMessageSchema = z.string().trim().min(1).max(4096);
export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;

export const ErrorDetailsSchema = z.record(z.unknown());
export type ErrorDetails = z.infer<typeof ErrorDetailsSchema>;

export const ErrorInfoSchema = z
  .object({
    code: ErrorCodeSchema,
    message: ErrorMessageSchema,
    source: ErrorSourceSchema,
    recoverable: z.boolean(),
    details: ErrorDetailsSchema.optional(),
  })
  .strict();
export type ErrorInfo = z.infer<typeof ErrorInfoSchema>;

export const ErrorCodeSetSchema = z.array(ErrorCodeSchema);
export type ErrorCodeSet = z.infer<typeof ErrorCodeSetSchema>;

export function isErrorCode(value: unknown): value is ErrorCode {
  return ErrorCodeSchema.safeParse(value).success;
}

export function parseErrorCode(value: unknown): ErrorCode {
  return ErrorCodeSchema.parse(value);
}

export function parseErrorInfo(value: unknown): ErrorInfo {
  return ErrorInfoSchema.parse(value);
}