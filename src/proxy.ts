import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

const locales: readonly string[] = routing.locales;

function isLocale(value: unknown): value is string {
  return typeof value === "string" && locales.includes(value);
}

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/")[1];

  // next-intl 关闭 localeDetection 后也不会读取 Cookie。
  // 这里只恢复用户显式选择过的语言，不读取 Accept-Language。
  if (!isLocale(firstSegment)) {
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;

    if (isLocale(cookieLocale)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${cookieLocale}${pathname === "/" ? "" : pathname}`;
      return NextResponse.redirect(url);
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
