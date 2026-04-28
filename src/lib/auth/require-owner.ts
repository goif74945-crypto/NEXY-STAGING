import { AppError } from '@/lib/errors/app-errors';
import { requireSession } from '@/lib/auth/require-session';

export function requireOwner(
  input: Parameters<typeof requireSession>[0],
): ReturnType<typeof requireSession>['session'] {
  const { session } = requireSession(input);

  if (session.role !== 'OWNER') {
    throw new AppError({
      code: 'FORBIDDEN',
      message: 'Owner access is required.',
      statusCode: 403,
      source: 'auth.require-owner',
      recoverable: false,
      details: {
        session_id: session.session_id,
        role: session.role,
      },
    });
  }

  return session;
}
