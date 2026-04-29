import type { NextResponse } from 'next/server';

import { buildBlockedRouteResponse } from '@/lib/security/blocked-route';

const REQUEST_ID = 'auth_verify_otac_blocked';

export function POST(): NextResponse {
  return buildBlockedRouteResponse({
    requestId: REQUEST_ID,
    message:
      'OTAC verification is blocked because client-supplied OTAC records are not a trusted source of truth.',
    details: {
      required_controls: [
        'server_side_otac_record_lookup',
        'one_time_consumption',
        'salted_hash_compare',
        'ttl_enforcement',
        'attempt_rate_limit',
      ],
    },
  });
}
