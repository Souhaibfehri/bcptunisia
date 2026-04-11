import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSupabaseSession } from "./src/utils/supabase/middleware";
import { routing } from "./src/i18n/routing";

const intlMiddleware = createMiddleware(routing);

function isSupabaseAppPath(pathname: string) {
  return (
    pathname.startsWith("/portal") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/employee")
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/studio")) {
    return NextResponse.next();
  }

  if (pathname === "/portal/workspace" || pathname.startsWith("/portal/workspace/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/employee" + pathname.slice("/portal/workspace".length);
    return NextResponse.redirect(url);
  }

  if (isSupabaseAppPath(pathname)) {
    return updateSupabaseSession(request);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(fr|en|ar)/:path*",
    "/((?!api|_next|_vercel|studio|.*\\..*).*)",
  ],
};
