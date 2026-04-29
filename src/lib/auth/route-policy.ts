import { z } from 'zod';

export const RouteAccessLevelSchema = z.enum([
  'bypass',
  'public',
  'requires_session',
]);

export const RoutePolicyDecisionSchema = z
  .object({
    pathname: z.string().trim().min(1),
    access: RouteAccessLevelSchema,
    matched_prefix: z.string().trim().min(1),
  })
  .strict();

export type RouteAccessLevel = z.infer<typeof RouteAccessLevelSchema>;
export type RoutePolicyDecision = z.infer<typeof RoutePolicyDecisionSchema>;

const BYPASS_PATH_PREFIXES = ['/_next/static', '/_next/image'] as const;
const BYPASS_EXACT_PATHS = ['/favicon.ico'] as const;

const PUBLIC_EXACT_PATHS = [
  '/',
  '/front-door',
  '/view',
  '/run',
  '/forge',
  '/sessions',
  '/api/auth/request-otac',
  '/api/auth/verify-otac',
] as const;

const PROTECTED_PATH_PREFIXES = [
  '/api/auth/me',
  '/api/auth/sessions',
  '/api/auth/logout',
  '/api/auth/revoke-session',
  '/api/auth/revoke-all-other-sessions',
  '/api/runs',
  '/api/directives',
  '/api/incidents',
  '/api/artifacts',
  '/api/outputs',
  '/api/telemetry',
  '/api/queue',
  '/api/agents',
] as const;

const DANGEROUS_APP_PATH_PREFIXES = [
  '/admin',
  '/internal',
  '/private',
  '/security',
  '/vault',
] as const;

function normalizePathname(pathname: string): string {
  const trimmed = pathname.trim();

  if (trimmed.length === 0) {
    return '/';
  }

  if (!trimmed.startsWith('/')) {
    return `/${trimmed}`;
  }

  return trimmed;
}

function matchesExact(pathname: string, exactPaths: readonly string[]): string | null {
  return exactPaths.find((path) => pathname === path) ?? null;
}

function matchesPrefix(
  pathname: string,
  prefixes: readonly string[],
): string | null {
  return (
    prefixes.find(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) ?? null
  );
}

export function isBypassPath(pathname: string): boolean {
  const normalizedPathname = normalizePathname(pathname);

  return (
    matchesExact(normalizedPathname, BYPASS_EXACT_PATHS) !== null ||
    matchesPrefix(normalizedPathname, BYPASS_PATH_PREFIXES) !== null
  );
}

export function isPublicPath(pathname: string): boolean {
  const normalizedPathname = normalizePathname(pathname);

  return matchesExact(normalizedPathname, PUBLIC_EXACT_PATHS) !== null;
}

export function isProtectedPath(pathname: string): boolean {
  const normalizedPathname = normalizePathname(pathname);

  if (matchesPrefix(normalizedPathname, PROTECTED_PATH_PREFIXES) !== null) {
    return true;
  }

  if (normalizedPathname.startsWith('/api/')) {
    return true;
  }

  return matchesPrefix(normalizedPathname, DANGEROUS_APP_PATH_PREFIXES) !== null;
}

export function evaluateRoutePolicy(pathname: string): RoutePolicyDecision {
  const normalizedPathname = normalizePathname(pathname);
  const bypassMatch =
    matchesExact(normalizedPathname, BYPASS_EXACT_PATHS) ??
    matchesPrefix(normalizedPathname, BYPASS_PATH_PREFIXES);

  if (bypassMatch !== null) {
    return RoutePolicyDecisionSchema.parse({
      pathname: normalizedPathname,
      access: 'bypass',
      matched_prefix: bypassMatch,
    });
  }

  const publicMatch = matchesExact(normalizedPathname, PUBLIC_EXACT_PATHS);

  if (publicMatch !== null) {
    return RoutePolicyDecisionSchema.parse({
      pathname: normalizedPathname,
      access: 'public',
      matched_prefix: publicMatch,
    });
  }

  const protectedMatch = matchesPrefix(
    normalizedPathname,
    PROTECTED_PATH_PREFIXES,
  );

  if (protectedMatch !== null) {
    return RoutePolicyDecisionSchema.parse({
      pathname: normalizedPathname,
      access: 'requires_session',
      matched_prefix: protectedMatch,
    });
  }

  if (normalizedPathname.startsWith('/api/')) {
    return RoutePolicyDecisionSchema.parse({
      pathname: normalizedPathname,
      access: 'requires_session',
      matched_prefix: '/api/*',
    });
  }

  const dangerousPathMatch = matchesPrefix(
    normalizedPathname,
    DANGEROUS_APP_PATH_PREFIXES,
  );

  if (dangerousPathMatch !== null) {
    return RoutePolicyDecisionSchema.parse({
      pathname: normalizedPathname,
      access: 'requires_session',
      matched_prefix: dangerousPathMatch,
    });
  }

  return RoutePolicyDecisionSchema.parse({
    pathname: normalizedPathname,
    access: 'public',
    matched_prefix: 'unknown_non_api_app_path',
  });
}
