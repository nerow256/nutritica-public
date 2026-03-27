import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'nutritica_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Read the session userId from the httpOnly cookie. Returns null if not authenticated. */
export function getSessionUserId(req: NextRequest): string | null {
  const val = req.cookies.get(SESSION_COOKIE)?.value;
  if (!val || typeof val !== 'string' || val.length > 100) return null;
  if (!/^[0-9a-f-]{36}$/.test(val)) return null;
  return val;
}

/** Attach a session cookie to an existing NextResponse. */
export function attachSessionCookie(res: NextResponse, userId: string): NextResponse {
  res.cookies.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}

/** Clear the session cookie. */
export function clearSessionCookie(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return res;
}

/** Return a 401 Unauthorized response. */
export function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
