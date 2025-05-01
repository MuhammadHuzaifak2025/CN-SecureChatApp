// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const PUBLIC_ROUTES = ['/auth/login', '/auth/signup'];

const PROTECTED_ROUTES_PREFIXES = [
  '/chat',
  '/settings',
  '/profile',
  '/new-chat',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES_PREFIXES.some(prefix =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const isPublic = PUBLIC_ROUTES.some((route) => route === pathname)

  const cookieStore = await cookies();
  let session = cookieStore.get("access_token");

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
  }
  // Redirect authenticated users away from public routes
  if (isPublic && session) {
    return NextResponse.redirect(new URL("/chat", req.nextUrl));
  }

  return NextResponse.next();
}
