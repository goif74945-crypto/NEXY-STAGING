import { AppError } from '@/lib/errors/app-errors';
import { requireSession } from '@/lib/auth/require-session';

export function requireOperatorOrOwner(
  input: Parameters<typeof requireSession>[0],
): ReturnType<typeof requireSession>['session'] {
  const { session } = requireSession(input);

  if (session.role !== 'OWNER' && session.role !== 'OPERATOR') {
    throw new AppError({
      code: 'FORBIDDEN',
      message: 'Operator or owner access is required.',
      statusCode: 403,
      source: 'auth.require-operator-or-owner',
      recoverable: false,
      details: {
        session_id: session.session_id,
        role: session.role,
      },
    });
  }

  return session;
}
