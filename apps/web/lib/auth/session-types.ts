import { z } from 'zod';

import {
  SessionIdSchema,
  SessionRoleSchema,
  SessionStatusSchema,
  SessionSubjectSchema,
} from '../../packages/auth/session';

export const RouteSessionRoleSchema = SessionRoleSchema;
export type RouteSessionRole = z.infer<typeof RouteSessionRoleSchema>;

export const RouteSessionStatusSchema = SessionStatusSchema;
export type RouteSessionStatus = z.infer<typeof RouteSessionStatusSchema>;

export const SessionPublicViewSchema = z
  .object({
    session_id: SessionIdSchema,
    subject: SessionSubjectSchema,
    role: RouteSessionRoleSchema,
    status: RouteSessionStatusSchema,
    issued_at_epoch_ms: z.number().int().nonnegative(),
    expires_at_epoch_ms: z.number().int().nonnegative(),
    revoked_at_epoch_ms: z.number().int().nonnegative().optional(),
  })
  .strict();
export type SessionPublicView = z.infer<typeof SessionPublicViewSchema>;

export const SessionAuthContextSchema = z
  .object({
    session: SessionPublicViewSchema.optional(),
    token_present: z.boolean(),
    current_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type SessionAuthContext = z.infer<typeof SessionAuthContextSchema>;

export const SessionGateReasonSchema = z.enum([
  'ok',
  'missing_session',
  'missing_token',
  'invalid_session',
  'revoked',
  'expired',
  'insufficient_role',
]);
export type SessionGateReason = z.infer<typeof SessionGateReasonSchema>;

export const SessionGateResultSchema = z
  .object({
    allowed: z.boolean(),
    reason: SessionGateReasonSchema,
    session: SessionPublicViewSchema.optional(),
  })
  .strict();
export type SessionGateResult = z.infer<typeof SessionGateResultSchema>;

export function parseSessionPublicView(input: unknown): SessionPublicView {
  return SessionPublicViewSchema.parse(input);
}

export function validateSessionPublicView(input: unknown): boolean {
  return SessionPublicViewSchema.safeParse(input).success;
}

export function parseSessionAuthContext(input: unknown): SessionAuthContext {
  return SessionAuthContextSchema.parse(input);
}

export function validateSessionAuthContext(input: unknown): boolean {
  return SessionAuthContextSchema.safeParse(input).success;
}

export function parseSessionGateResult(input: unknown): SessionGateResult {
  return SessionGateResultSchema.parse(input);
}

export function validateSessionGateResult(input: unknown): boolean {
  return SessionGateResultSchema.safeParse(input).success;
}