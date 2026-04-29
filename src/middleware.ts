import { NextResponse, type NextRequest } from 'next/server';

const BLOCKED_MUTATION_PREFIXES = [
  '/api/auth/request-otac',
  '/api/auth/verify-otac',
  '/api/auth/logout',
  '/api/auth/revoke-session',
  '/api/auth/revoke-all-other-sessions',
  '/api/directives',
  '/api/runs',
] as const;

function isBlockedMutation(pathname: string, method: string): boolean {
  if (method !== 'POST') {
    return false;
  }

  return BLOCKED_MUTATION_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest): NextResponse {
  if (isBlockedMutation(request.nextUrl.pathname, request.method)) {
    return NextResponse.json(
      {
        status: 'ERROR',
        meta: {
          request_id: 'middleware_zero_trust_block',
          trace_id: 'middleware_zero_trust_block',
          version: 'v1',
        },
        data: null,
        error: {
          code: 'FORBIDDEN',
          message:
            'This mutation route is blocked until authenticated repository-backed execution is implemented.',
          details: {
            path: request.nextUrl.pathname,
            method: request.method,
          },
        },
      },
      { status: 403 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
