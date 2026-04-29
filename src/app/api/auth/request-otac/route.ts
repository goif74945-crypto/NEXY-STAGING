import type { NextResponse } from 'next/server';

import { buildBlockedRouteResponse } from '@/lib/security/blocked-route';

const REQUEST_ID = 'auth_request_otac_blocked';

export function POST(): NextResponse {
  return buildBlockedRouteResponse({
    requestId: REQUEST_ID,
    message:
      'OTAC issuance is blocked until server-side code generation, salted hashing, TTL, rate limiting, and delivery are implemented.',
    details: {
      required_controls: [
        'server_side_otac_store',
        'salted_code_hash',
        'ttl_enforcement',
        'attempt_rate_limit',
        'delivery_channel',
      ],
    },
  });
}
