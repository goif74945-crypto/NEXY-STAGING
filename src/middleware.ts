import { NextRequest, NextResponse } from 'next/server';

import { evaluateRoutePolicy } from '@/lib/auth/route-policy';
import { getSessionCookieValue } from '@/lib/auth/session-cookie';
import { makeEnvelope } from '@/lib/http/envelope';

const AUTH_REQUIRED_REQUEST_ID = 'middleware_auth_required';

function buildAuthRequiredResponse(): NextResponse {
  return NextResponse.json(
    makeEnvelope({
      status: 'ERROR',
      requestId: AUTH_REQUIRED_REQUEST_ID,
      traceId: AUTH_REQUIRED_REQUEST_ID,
      data: null,
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Authentication is required for this route.',
      },
    }),
    {
      status: 401,
    },
  );
}

export function middleware(request: NextRequest): NextResponse {
  const decision = evaluateRoutePolicy(request.nextUrl.pathname);

  if (decision.access === 'bypass' || decision.access === 'public') {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookieValue(request.headers.get('cookie'));

  if (sessionCookie === null) {
    return buildAuthRequiredResponse();
  }

  const response = NextResponse.next();

  response.headers.set(
    'x-nexy-auth-mode',
    'deterministic_fixture_not_production',
  );
  response.headers.set('x-nexy-route-access', 'requires_session');

  return response;
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
