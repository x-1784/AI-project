import { getTranslations } from "next-intl/server";

export default async function LocaleLoading() {
  const t = await getTranslations("Loading");

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex w-full max-w-[80rem] items-center gap-3 px-5 py-24 text-sm text-muted sm:px-8"
    >
      <span
        className="size-2 animate-pulse rounded-full bg-accent"
        aria-hidden="true"
      />
      {t("label")}
    </div>
  );
}
