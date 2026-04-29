import { NextResponse } from 'next/server';

import {
  createRouteError,
  getHttpStatusFromRouteError,
  toRouteErrorEnvelope,
  type RouteErrorCode,
  type RouteErrorDetails,
} from '@/lib/http/route-error';

export type BlockedRouteResponseInput = {
  requestId: string;
  code?: Extract<RouteErrorCode, 'unauthorized' | 'forbidden'>;
  message: string;
  details?: RouteErrorDetails;
};

export function buildBlockedRouteResponse(
  input: BlockedRouteResponseInput,
): NextResponse {
  const routeError = createRouteError(
    input.code ?? 'forbidden',
    input.message,
    input.details,
  );

  return NextResponse.json(toRouteErrorEnvelope(routeError, input.requestId), {
    status: getHttpStatusFromRouteError(routeError),
  });
}
