import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;

    if (req.nextUrl.pathname.startsWith('/admin') && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico|robots.txt|logo.svg).*)'],
};
