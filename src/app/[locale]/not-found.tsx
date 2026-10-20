import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("NotFound");

  return (
    <section className="mx-auto flex w-full max-w-[80rem] flex-col items-start gap-4 px-5 py-24 sm:px-8 sm:py-32">
      <p className="text-sm font-medium tracking-[0.3em] text-accent">404</p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      <p className="max-w-xl text-muted">{t("description")}</p>
      <Link
        href="/"
        className="mt-2 inline-flex h-10 items-center rounded-full border border-border bg-surface px-5 text-sm font-medium text-foreground transition-colors hover:border-accent/60"
      >
        {t("backHome")}
      </Link>
    </section>
  );
}
