import { z } from 'zod';

import {
  SessionRecordSchema,
  SessionTokenSchema,
  verifySessionToken,
  type SessionRecord,
} from '../../packages/auth/session';
import {
  SessionGateResultSchema,
  SessionPublicViewSchema,
  type SessionGateResult,
  type SessionPublicView,
} from './session-types';

export const AuthorizationHeaderSchema = z.string().trim().min(1).nullable().optional();

export const BearerTokenExtractionReasonSchema = z.enum([
  'ok',
  'missing_authorization',
  'invalid_authorization_scheme',
  'missing_bearer_token',
  'invalid_token_format',
]);
export type BearerTokenExtractionReason = z.infer<typeof BearerTokenExtractionReasonSchema>;

export const BearerTokenExtractionResultSchema = z
  .object({
    found: z.boolean(),
    reason: BearerTokenExtractionReasonSchema,
    token: SessionTokenSchema.optional(),
  })
  .strict();
export type BearerTokenExtractionResult = z.infer<typeof BearerTokenExtractionResultSchema>;

const SessionRecordListSchema = z.array(SessionRecordSchema);

export function extractBearerToken(headerInput: unknown): BearerTokenExtractionResult {
  const header = AuthorizationHeaderSchema.parse(headerInput);

  if (header === undefined || header === null || header.length === 0) {
    return BearerTokenExtractionResultSchema.parse({
      found: false,
      reason: 'missing_authorization',
    });
  }

  const firstSpaceIndex = header.indexOf(' ');

  if (firstSpaceIndex === -1) {
    return BearerTokenExtractionResultSchema.parse({
      found: false,
      reason: 'invalid_authorization_scheme',
    });
  }

  const scheme = header.slice(0, firstSpaceIndex).trim();
  const tokenPart = header.slice(firstSpaceIndex + 1).trim();

  if (scheme.toLowerCase() !== 'bearer') {
    return BearerTokenExtractionResultSchema.parse({
      found: false,
      reason: 'invalid_authorization_scheme',
    });
  }

  if (tokenPart.length === 0) {
    return BearerTokenExtractionResultSchema.parse({
      found: false,
      reason: 'missing_bearer_token',
    });
  }

  const tokenResult = SessionTokenSchema.safeParse(tokenPart);

  if (!tokenResult.success) {
    return BearerTokenExtractionResultSchema.parse({
      found: false,
      reason: 'invalid_token_format',
    });
  }

  return BearerTokenExtractionResultSchema.parse({
    found: true,
    reason: 'ok',
    token: tokenResult.data,
  });
}

export function buildSessionPublicView(recordInput: unknown): SessionPublicView {
  const record = SessionRecordSchema.parse(recordInput);

  return SessionPublicViewSchema.parse({
    session_id: record.session_id,
    subject: record.subject,
    role: record.role,
    status: record.status,
    issued_at_epoch_ms: record.issued_at_epoch_ms,
    expires_at_epoch_ms: record.expires_at_epoch_ms,
    ...(record.revoked_at_epoch_ms !== undefined
      ? { revoked_at_epoch_ms: record.revoked_at_epoch_ms }
      : {}),
  });
}

export function redactSessionRecord(recordInput: unknown): SessionPublicView {
  return buildSessionPublicView(recordInput);
}

export function verifySessionRecordToken(
  recordInput: unknown,
  tokenInput: unknown,
  currentEpochMsInput: unknown,
): SessionGateResult {
  const record = SessionRecordSchema.parse(recordInput);
  const token = SessionTokenSchema.parse(tokenInput);
  const current_epoch_ms = z.number().int().nonnegative().parse(currentEpochMsInput);

  const verification = verifySessionToken({
    record,
    token,
    current_epoch_ms,
  });

  if (verification.accepted) {
    return SessionGateResultSchema.parse({
      allowed: true,
      reason: 'ok',
      session: buildSessionPublicView(verification.next_record),
    });
  }

  const mappedReason =
    verification.reason === 'invalid_token'
      ? 'invalid_session'
      : verification.reason;

  return SessionGateResultSchema.parse({
    allowed: false,
    reason: mappedReason,
    session: buildSessionPublicView(verification.next_record),
  });
}

export function selectSessionById(
  recordsInput: unknown,
  sessionIdInput: unknown,
): SessionRecord | null {
  const records = SessionRecordListSchema.parse(recordsInput);
  const session_id = z.string().trim().min(1).max(128).parse(sessionIdInput);

  return records.find((record) => record.session_id === session_id) ?? null;
}