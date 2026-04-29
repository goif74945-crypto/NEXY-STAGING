import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateRoutePolicy,
  isBypassPath,
  isProtectedPath,
  isPublicPath,
} from '../src/lib/auth/route-policy';
import {
  getSessionCookieValue,
  parseCookieHeader,
} from '../src/lib/auth/session-cookie';

test('bypass path /_next/static/chunk.js resolves to bypass', () => {
  const decision = evaluateRoutePolicy('/_next/static/chunk.js');

  assert.equal(decision.access, 'bypass');
  assert.equal(decision.matched_prefix, '/_next/static');
  assert.equal(isBypassPath('/_next/static/chunk.js'), true);
});

test('public path /front-door resolves to public', () => {
  const decision = evaluateRoutePolicy('/front-door');

  assert.equal(decision.access, 'public');
  assert.equal(decision.matched_prefix, '/front-door');
  assert.equal(isPublicPath('/front-door'), true);
});

test('public OTAC route /api/auth/request-otac resolves to public', () => {
  const decision = evaluateRoutePolicy('/api/auth/request-otac');

  assert.equal(decision.access, 'public');
  assert.equal(decision.matched_prefix, '/api/auth/request-otac');
});

test('protected path /api/auth/me resolves to requires_session', () => {
  const decision = evaluateRoutePolicy('/api/auth/me');

  assert.equal(decision.access, 'requires_session');
  assert.equal(decision.matched_prefix, '/api/auth/me');
  assert.equal(isProtectedPath('/api/auth/me'), true);
});

test('protected unknown api /api/unknown resolves to requires_session', () => {
  const decision = evaluateRoutePolicy('/api/unknown');

  assert.equal(decision.access, 'requires_session');
  assert.equal(decision.matched_prefix, '/api/*');
});

test('getSessionCookieValue returns null for null header', () => {
  assert.equal(getSessionCookieValue(null), null);
});

test('getSessionCookieValue reads nexy_session cookie', () => {
  assert.equal(
    getSessionCookieValue('nexy_session=session_owner_001'),
    'session_owner_001',
  );
});

test('parseCookieHeader handles multiple cookies with last duplicate winning', () => {
  const cookies = parseCookieHeader(
    'theme=dark; nexy_session=session_old; mode=view; nexy_session=session_new',
  );

  assert.deepEqual(cookies, {
    theme: 'dark',
    nexy_session: 'session_new',
    mode: 'view',
  });
});

test('decode malformed cookie does not throw', () => {
  assert.doesNotThrow(() => parseCookieHeader('nexy_session=%E0%A4%A'));
  assert.equal(getSessionCookieValue('nexy_session=%E0%A4%A'), '%E0%A4%A');
});

test('evaluateRoutePolicy repeated call returns same object value', () => {
  const first = evaluateRoutePolicy('/api/auth/me');
  const second = evaluateRoutePolicy('/api/auth/me');

  assert.deepEqual(first, second);
}
);
