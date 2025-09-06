import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import { routing } from "./i18n/routing";

const locales = ["fr", "en"];
const defaultLocale = "fr";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/api")
  ) {
    return;
  }

  const pathLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathLocale) {
    const matchedLocale = match(locales, locales, defaultLocale);

    const newUrl = new URL(`/${matchedLocale}${pathname}`, req.url);

    return NextResponse.redirect(newUrl);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!_next|images|.*\\..*).*)"],
};
