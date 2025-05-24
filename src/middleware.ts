
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from './lib/session'; // Adjust path as necessary
import type { User } from './lib/definitions';

interface AppSessionData {
  user?: User;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/register']; 
  const isApiAuthRoute = pathname.startsWith('/api/auth'); // Specific check for API auth routes
  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico');


  // Get session
  const res = NextResponse.next();
  const session = await getIronSession<AppSessionData>(request, res, sessionOptions);
  const user = session.user;

  // If trying to access a protected route and not logged in, redirect to login
  if (!user && !publicPaths.some(path => pathname.startsWith(path)) && !isApiAuthRoute && !isStaticAsset) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname); // Optionally add redirect_to for better UX
    return NextResponse.redirect(loginUrl);
  }

  // If logged in
  if (user) {
    // If trying to access login/register page but already logged in, redirect to home (or OOBE if needed)
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL(user.oobe_completed ? '/' : '/profile/setup', request.url));
    }

    // If OOBE is not completed, redirect to OOBE setup page,
    // unless already on OOBE page, profile page (to allow editing before OOBE is formally "done"), or logging out.
    if (!user.oobe_completed && 
        pathname !== '/profile/setup' && 
        !pathname.startsWith('/api/auth/logout') && // Allow logout
        pathname !== '/profile' // Allow access to full profile page even during OOBE
        ) {
      return NextResponse.redirect(new URL('/profile/setup', request.url));
    }
  }

  return res; 
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * API routes under /api/auth are handled explicitly.
     * Other /api routes might need specific protection if not public.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

