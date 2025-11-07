import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // No middleware restrictions - let the admin pages handle their own auth
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api).*)'],
};



