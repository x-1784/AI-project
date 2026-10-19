"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const nextLocale = locale === "zh-CN" ? "en" : "zh-CN";

  function handleSwitch() {
    const { pathname, search, hash } = window.location;
    // next-intl 的路由 API 接收不带语言前缀的路径。
    const pathnameWithoutLocale =
      pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
        ? pathname.slice(locale.length + 1) || "/"
        : pathname;

    // 保留查询参数和锚点，切换语言后不整页刷新。
    startTransition(() => {
      router.replace(`${pathnameWithoutLocale}${search}${hash}`, {
        locale: nextLocale,
      });
    });
  }

  return (
    <button
      type="button"
      onClick={handleSwitch}
      disabled={isPending}
      aria-label={t("label")}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-xs font-medium text-muted transition-colors hover:border-accent/60 hover:text-foreground disabled:cursor-wait disabled:opacity-60"
    >
      <Languages aria-hidden="true" className="size-4" />
      <span>{t("switchTo")}</span>
    </button>
  );
}
