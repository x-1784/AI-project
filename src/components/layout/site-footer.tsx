import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("Footer");

  return (
    <footer className="border-t border-border bg-background/40">
      <div className="mx-auto flex w-full max-w-[80rem] flex-col gap-2 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>{t("rights")}</p>
        <p>{t("note")}</p>
      </div>
    </footer>
  );
}
