import { z } from 'zod';

import { AppError } from '@/lib/errors/app-errors';
import { SessionSchema, type Session } from '@/lib/auth/session';

export const RequireSessionInputSchema = z
  .object({
    session: SessionSchema.nullish(),
    now_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

export const RequireSessionResultSchema = z
  .object({
    session: SessionSchema,
  })
  .strict();

export type RequireSessionInput = z.infer<typeof RequireSessionInputSchema>;
export type RequireSessionResult = z.infer<typeof RequireSessionResultSchema>;

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

export function requireSession(
  input: RequireSessionInput,
): RequireSessionResult {
  const parsed = RequireSessionInputSchema.parse(input);

  if (parsed.session === null || parsed.session === undefined) {
    throw new AppError({
      code: 'AUTH_REQUIRED',
      message: 'Authentication is required.',
      statusCode: 401,
      source: 'auth.require-session',
      recoverable: false,
    });
  }

  const session = SessionSchema.parse(parsed.session);

  if (session.revoked_at_epoch_ms !== null) {
    throw new AppError({
      code: 'SESSION_REVOKED',
      message: 'The session has been revoked.',
      statusCode: 401,
      source: 'auth.require-session',
      recoverable: false,
      details: {
        session_id: session.session_id,
        revoked_at_epoch_ms: session.revoked_at_epoch_ms,
      },
    });
  }

  if (session.expires_at_epoch_ms <= parsed.now_epoch_ms) {
    throw new AppError({
      code: 'SESSION_EXPIRED',
      message: 'The session has expired.',
      statusCode: 401,
      source: 'auth.require-session',
      recoverable: false,
      details: {
        session_id: session.session_id,
        now_epoch_ms: parsed.now_epoch_ms,
        expires_at_epoch_ms: session.expires_at_epoch_ms,
      },
    });
  }

  return RequireSessionResultSchema.parse({
    session: cloneSession(session),
  });
}
