import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "zh-CN": "/zh-CN",
        en: "/en",
      },
    },
    openGraph: {
      title,
      description,
      locale: locale === "zh-CN" ? "zh_CN" : "en_US",
      siteName: "NEBULA AI",
      type: "website",
      url: `/${locale}`,
    },
  };
}

export default async function HomePage() {
  const t = await getTranslations("Home");

  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-24 sm:px-8 sm:py-32">
      <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[0.7rem] font-medium tracking-[0.2em] text-muted">
        <span
          className="size-1.5 rounded-full bg-accent-strong"
          aria-hidden="true"
        />
        {t("badge")}
      </p>
      <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
        {t("title")}
      </h1>
      <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
        {t("subtitle")}
      </p>
      <p className="max-w-2xl border-l border-accent/40 pl-4 text-sm leading-relaxed text-muted">
        {t("status")}
      </p>
    </section>
  );
}
