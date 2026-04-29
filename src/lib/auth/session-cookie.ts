import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

function safeDecodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseCookieHeader(
  header: string | null,
): Readonly<Record<string, string>> {
  if (header === null || header.trim().length === 0) {
    return {};
  }

  const cookies: Record<string, string> = {};

  for (const part of header.split(';')) {
    const separatorIndex = part.indexOf('=');

    if (separatorIndex < 0) {
      continue;
    }

    const key = part.slice(0, separatorIndex).trim();
    const rawValue = part.slice(separatorIndex + 1).trim();

    if (key.length === 0) {
      continue;
    }

    cookies[key] = safeDecodeCookieValue(rawValue);
  }

  return cookies;
}

export function getSessionCookieValue(header: string | null): string | null {
  const cookies = parseCookieHeader(header);
  const value = cookies[SESSION_COOKIE_NAME];

  if (value === undefined || value.trim().length === 0) {
    return null;
  }

  return value;
}
