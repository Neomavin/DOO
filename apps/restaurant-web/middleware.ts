import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/favicon.ico'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isStatic = pathname.startsWith('/api') || pathname.startsWith('/_next');

  if (isStatic) {
    return NextResponse.next();
  }

  if (isPublicPath) {
    if (token) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!static|_next/image|favicon.ico).*)'],
};
