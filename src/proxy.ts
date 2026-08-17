import { NextResponse, type NextRequest } from "next/server";

const COOKIE = process.env.AUTH_COOKIE_NAME ?? "ecab_session";

/**
 * Optimistic gate only — it checks that a session cookie is present so an
 * unauthenticated visitor bounces to sign-in without rendering the console.
 * The cookie's value is verified in the page itself (`isAuthenticated`),
 * which is the check that actually protects anything.
 *
 * The `/auth/*` routes are deliberately outside the matcher: they must stay
 * reachable without a session, and each one redirects a signed-in visitor to
 * the console itself.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.get(COOKIE)?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/welcome"],
};
