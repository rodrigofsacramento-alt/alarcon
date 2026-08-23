import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('auth_session_v3')?.value;
  const isLoginPage = request.nextUrl.pathname === '/';

  // Se não houver sessão e não for a página de login, redireciona para login
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }


  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json
     * - logo.png (and other public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|logo.png|sw.js).*)',
  ],
};
