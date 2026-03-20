export { default } from 'next-auth/middleware';

export const config = {
  // Protège toutes les routes SAUF /login et les assets publics
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico|robots.txt|logo.svg).*)'],
};
