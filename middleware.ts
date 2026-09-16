import createMiddleware from "next-intl/middleware";
import {NextResponse, type NextRequest} from "next/server";
import {routing} from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Old /en links (indexed pages, shared posts) land on the Ukrainian page instead of a 404
// while English is switched off.
export default function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${routing.defaultLocale}${pathname.slice(3)}`;
    return NextResponse.redirect(url, 308);
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
