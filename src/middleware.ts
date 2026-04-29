import { NextResponse } from 'next/server';

export function middleware(): NextResponse {
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
