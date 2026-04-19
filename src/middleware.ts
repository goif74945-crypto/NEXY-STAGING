import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { createRequestId } from '@/lib/utils/ids';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', createRequestId('mw'));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
