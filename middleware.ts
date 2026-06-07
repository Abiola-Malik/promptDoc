// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from './db/appwrite';

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session')?.value;
  // console.log('Middleware: sessionId from cookie =', sessionId);

  // If no session cookie, redirect to login
  if (!sessionId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Create Appwrite client and set session
  const { account } = await createSessionClient(sessionId);

  try {
    await account.get(); // Throws if session is invalid
    return NextResponse.next();
  } catch (err) {
    console.log('[middleware] Error validating session:', err);
    
    const response= NextResponse.redirect(new URL('/login', req.url));
        response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: ['/dashboard', '/project/:path*'], // protect relevant routes
};
