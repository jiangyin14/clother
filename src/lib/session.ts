
import type { IronSessionOptions } from 'iron-session';
import type { User } from './definitions';

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'clother-app-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax', //CSRF protection
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};

// This is type-safe for session data
declare module 'iron-session' {
  interface IronSessionData {
    user?: User; // Store the full User object (excluding password_hash)
  }
}
