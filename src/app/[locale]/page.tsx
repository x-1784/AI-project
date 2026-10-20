import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import {
  Capabilities,
  ClosingCta,
  Hero,
  Manifesto,
  WorkspacePreview,
} from "@/components/marketing";
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
        "x-default": "/zh-CN",
      },
    },
    openGraph: {
      title,
      description,
      locale: locale === "zh-CN" ? "zh_CN" : "en_US",
      alternateLocale: locale === "zh-CN" ? "en_US" : "zh_CN",
      siteName: "NEBULA AI",
      type: "website",
      url: `/${locale}`,
    },
  };
}

/**
 * 首页。区块顺序与构图依据 docs/design/HOME_IA.md §2：
 * 首屏(100dvh) → 能力展示 → 工作台预览 → 品牌宣言 → 收尾 CTA。
 *
 * 导航与页脚由 [locale]/layout.tsx 提供，这里不重复实现。
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Capabilities />
      <WorkspacePreview />
      <Manifesto />
      <ClosingCta />
    </>
  );
}
