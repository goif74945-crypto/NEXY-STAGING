import { z } from 'zod';

import {
  SESSION_ROLES,
  type SessionRole as RootSessionRole,
} from '@/lib/auth/session-types';

export const SESSION_COOKIE_NAME = 'nexy_session';

export const SessionRoleSchema = z.enum(SESSION_ROLES);

export const SessionSchema = z
  .object({
    session_id: z.string().trim().min(1).max(256),
    user_id: z.string().trim().min(1).max(256),
    email: z.string().trim().email().max(320),
    role: SessionRoleSchema,
    device_id: z.string().trim().min(1).max(256),
    issued_at_epoch_ms: z.number().int().nonnegative(),
    expires_at_epoch_ms: z.number().int().nonnegative(),
    revoked_at_epoch_ms: z.number().int().nonnegative().nullable(),
  })
  .strict();

export const SessionListSchema = z.array(SessionSchema);

export type SessionRole = RootSessionRole;
export type Session = z.infer<typeof SessionSchema>;
export type SessionList = z.infer<typeof SessionListSchema>;

function assertSessionTiming(session: Session): void {
  if (session.expires_at_epoch_ms < session.issued_at_epoch_ms) {
    throw new Error(
      'expires_at_epoch_ms must be greater than or equal to issued_at_epoch_ms',
    );
  }

  if (
    session.revoked_at_epoch_ms !== null &&
    session.revoked_at_epoch_ms < session.issued_at_epoch_ms
  ) {
    throw new Error(
      'revoked_at_epoch_ms must be greater than or equal to issued_at_epoch_ms',
    );
  }
}

function cloneSession(session: Session): Session {
  return {
    session_id: session.session_id,
    user_id: session.user_id,
    email: session.email,
    role: session.role,
    device_id: session.device_id,
    issued_at_epoch_ms: session.issued_at_epoch_ms,
    expires_at_epoch_ms: session.expires_at_epoch_ms,
    revoked_at_epoch_ms: session.revoked_at_epoch_ms,
  };
}

export function parseSession(input: unknown): Session {
  const parsed = SessionSchema.parse(input);

  assertSessionTiming(parsed);

  return cloneSession(parsed);
}

export function parseSessionList(input: unknown): SessionList {
  const parsed = SessionListSchema.parse(input);

  return parsed.map((session) => parseSession(session));
}

export function buildDeterministicSession(input: Session): Session {
  return parseSession(input);
}

export function buildDeterministicSessionList(input: SessionList): SessionList {
  const parsed = parseSessionList(input);

  return [...parsed]
    .map((session) => cloneSession(session))
    .sort((left, right) => {
      if (left.issued_at_epoch_ms !== right.issued_at_epoch_ms) {
        return left.issued_at_epoch_ms - right.issued_at_epoch_ms;
      }

      if (left.expires_at_epoch_ms !== right.expires_at_epoch_ms) {
        return left.expires_at_epoch_ms - right.expires_at_epoch_ms;
      }

      return left.session_id.localeCompare(right.session_id);
    });
}
