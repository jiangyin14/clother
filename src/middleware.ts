
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from './lib/session'; // Adjust path as necessary

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/api/auth']; // Add any other public paths like /about, /contact

  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path)) || pathname === '/';


  // Get session
  // For middleware, we need to pass the request and a dummy response object
  // as `iron-session` expects them for cookie handling.
  const res = NextResponse.next();
  const session = await getIronSession(request, res, sessionOptions);

  // If trying to access a protected route and not logged in, redirect to login
  if (!session.user && !isPublicPath && !pathname.startsWith('/_next') && !pathname.startsWith('/favicon.ico')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login/register page but already logged in, redirect to home
  if (session.user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return res; // Allow request to proceed, res contains any session cookies set by getIronSession
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, unless you want to protect them too)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * You might want to adjust this to include specific pages that need protection.
     * For instance, if you want to protect '/dashboard/:path*', you can add it here.
     * For now, let's protect all non-public, non-asset paths implicitly by the logic above.
     */
    // '/((?!api|_next/static|_next/image|favicon.ico).*)', // This is a common pattern
    // Simpler: let the logic inside the middleware handle redirection for now.
    // Apply middleware to all paths and then filter inside.
     '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
