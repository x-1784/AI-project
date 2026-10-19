import { getTranslations } from "next-intl/server";

export default async function LocaleLoading() {
  const t = await getTranslations("Loading");

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex w-full max-w-6xl items-center gap-3 px-6 py-24 text-sm text-muted"
    >
      <span
        className="size-2 animate-pulse rounded-full bg-accent"
        aria-hidden="true"
      />
      {t("label")}
    </div>
  );
}
