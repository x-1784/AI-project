import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";

import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  let currentLocale = locale;

  if (!currentLocale) {
    const paramLocale = await rootLocale();

    if (!hasLocale(routing.locales, paramLocale)) {
      // 非法 locale 直接返回 404，不静默回退到默认语言。
      notFound();
    }

    currentLocale = paramLocale;
  }

  if (!hasLocale(routing.locales, currentLocale)) {
    notFound();
  }

  return {
    locale: currentLocale,
    messages: (await import(`../../messages/${currentLocale}.json`)).default,
  };
});
