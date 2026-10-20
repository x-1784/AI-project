"use client";

import { useTranslations } from "next-intl";

type LocaleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ reset }: LocaleErrorProps) {
  const t = useTranslations("Error");

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col items-start gap-4 px-5 py-24 sm:px-8 sm:py-32">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      <p className="max-w-xl text-muted">{t("description")}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex h-10 items-center rounded-full border border-border bg-surface px-5 text-ui font-medium text-foreground transition-colors hover:border-accent/60"
      >
        {t("retry")}
      </button>
    </section>
  );
}
