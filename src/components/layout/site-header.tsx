import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import { LocaleSwitcher } from "./locale-switcher";

export async function SiteHeader() {
  const t = await getTranslations("Navigation");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="text-ui font-semibold tracking-nx-brand text-foreground transition-colors hover:text-accent"
        >
          {t("brand")}
        </Link>
        <nav aria-label={t("mainLabel")}>
          <ul className="flex items-center gap-2">
            <li>
              <Link
                href="/"
                className="inline-flex h-9 items-center rounded-full px-3 text-ui text-muted transition-colors hover:text-foreground"
              >
                {t("home")}
              </Link>
            </li>
            <li>
              <LocaleSwitcher />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
