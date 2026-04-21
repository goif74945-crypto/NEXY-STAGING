import { z } from 'zod';

import { RequireSessionInputSchema, requireSession } from './require-session';
import {
  SessionGateResultSchema,
  type SessionGateResult,
} from './session-types';

export const RequireOperatorOrOwnerInputSchema = RequireSessionInputSchema;
export type RequireOperatorOrOwnerInput = z.infer<typeof RequireOperatorOrOwnerInputSchema>;

export function requireOperatorOrOwner(input: unknown): SessionGateResult {
  const parsed = RequireOperatorOrOwnerInputSchema.parse(input);
  const sessionGate = requireSession(parsed);

  if (!sessionGate.allowed) {
    return sessionGate;
  }

  const role = sessionGate.session?.role;

  if (role !== 'owner' && role !== 'operator') {
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