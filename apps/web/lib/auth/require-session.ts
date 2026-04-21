import { z } from 'zod';

import { SessionRecordSchema, SessionTokenSchema } from '../../packages/auth/session';
import { verifySessionRecordToken } from './session';
import {
  SessionGateResultSchema,
  type SessionGateResult,
} from './session-types';

export const RequireSessionInputSchema = z
  .object({
    record: SessionRecordSchema.nullable().optional(),
    token: SessionTokenSchema.nullable().optional(),
    current_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();
export type RequireSessionInput = z.infer<typeof RequireSessionInputSchema>;

export function requireSession(input: unknown): SessionGateResult {
  const parsed = RequireSessionInputSchema.parse(input);

  if (parsed.record === undefined || parsed.record === null) {
    return SessionGateResultSchema.parse({
      allowed: false,
      reason: 'missing_session',
    });
  }

  if (parsed.token === undefined || parsed.token === null) {
    return SessionGateResultSchema.parse({
      allowed: false,
      reason: 'missing_token',
    });
  }

  return verifySessionRecordToken(parsed.record, parsed.token, parsed.current_epoch_ms);
}