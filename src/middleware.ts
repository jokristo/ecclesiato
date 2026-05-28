import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = new Set(['/', '/pricing']);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/login')) return true;
  return false;
}

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;

    if (req.nextUrl.pathname.startsWith('/admin') && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (isPublicPath(req.nextUrl.pathname)) return true;
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico|robots.txt|logo.svg).*)'],
};
