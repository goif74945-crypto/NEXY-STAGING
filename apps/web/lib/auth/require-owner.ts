import { z } from 'zod';

import { RequireSessionInputSchema, requireSession } from './require-session';
import {
  SessionGateResultSchema,
  type SessionGateResult,
} from './session-types';

export const RequireOwnerInputSchema = RequireSessionInputSchema;
export type RequireOwnerInput = z.infer<typeof RequireOwnerInputSchema>;

export function requireOwner(input: unknown): SessionGateResult {
  const parsed = RequireOwnerInputSchema.parse(input);
  const sessionGate = requireSession(parsed);

  if (!sessionGate.allowed) {
    return sessionGate;
  }

  if (!sessionGate.session || sessionGate.session.role !== 'owner') {
    return SessionGateResultSchema.parse({
      allowed: false,
      reason: 'insufficient_role',
      session: sessionGate.session,
    });
  }

  return SessionGateResultSchema.parse({
    allowed: true,
    reason: 'ok',
    session: sessionGate.session,
  });
}