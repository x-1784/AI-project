"use client";

import { useEffect, useState } from "react";

import { EnergyCoreStage } from "@/components/three/energy-core-stage";

export type HeroMessages = {
  nav: {
    home: string;
    workspace: string;
    capabilities: string;
    langLabel: string;
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    lead: string;
    composerPlaceholder: string;
    composerHint: string;
    send: string;
    quickLabel: string;
    quickWriting: string;
    quickSummarize: string;
    quickCode: string;
    quickImage: string;
  };
  core: { ariaLabel: string; fallbackLabel: string };
};

type Locale = "zh" | "en";

const STARDUST = [
  "radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,.55), transparent)",
  "radial-gradient(1px 1px at 78% 12%, rgba(255,255,255,.40), transparent)",
  "radial-gradient(1px 1px at 34% 62%, rgba(255,255,255,.30), transparent)",
  "radial-gradient(1px 1px at 88% 74%, rgba(255,255,255,.35), transparent)",
  "radial-gradient(1px 1px at 56% 34%, rgba(255,255,255,.25), transparent)",
  "radial-gradient(1px 1px at 22% 84%, rgba(255,255,255,.30), transparent)",
  "radial-gradient(1px 1px at 66% 88%, rgba(255,255,255,.22), transparent)",
  "radial-gradient(1px 1px at 44% 8%, rgba(255,255,255,.28), transparent)",
].join(",");

type Props = {
  /** 两种语言的文案。接入 next-intl 后换成 useTranslations() 即可，组件结构不变。 */
  messages: Record<Locale, HeroMessages>;
  defaultLocale?: Locale;
};

/**
 * 首页首屏。
 * 语言切换目前是组件内临时实现（阶段 1 占位），
 * 正式方案由 C 用 next-intl 的路由 + Cookie 接管。
 */
export function HomeHero({ messages, defaultLocale = "zh" }: Props) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const t = messages[locale];
  const isZh = locale === "zh";

  useEffect(() => {
    document.documentElement.lang = isZh ? "zh-CN" : "en";
  }, [isZh]);

  const toggleLocale = () => setLocale((v) => (v === "zh" ? "en" : "zh"));

  return (
    <section className="relative h-dvh w-full overflow-hidden bg-nx-void">
      {/* 远景星尘：极低透明度，只为制造"距离" */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ backgroundImage: STARDUST }}
      />

      {/* 3D 核心：桌面偏置在右上并被上边界裁切，竖屏居中独立占位 */}
      <EnergyCoreStage
        fallbackLabel={t.core.fallbackLabel}
        className="pointer-events-none absolute left-1/2 top-[30%] z-[5] aspect-square w-[100vw] -translate-x-1/2 -translate-y-1/2 md:left-[74%] md:top-[26%] md:w-[74vw] lg:left-[70%] lg:top-[29%] lg:w-[84vw]"
      />

      {/* 地平线：核心底部一条极淡的水平光带，把 3D 锚进页面 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[52%] h-px bg-[linear-gradient(90deg,transparent,rgba(75,140,255,.16)_34%,rgba(111,227,255,.22)_62%,transparent)] opacity-80 md:top-[60%]"
      />

      {/* 导航 */}
      <nav className="absolute inset-x-[6%] top-0 z-20 flex h-14 items-center gap-1 border-b border-white/[0.055] md:inset-x-[5.5%] md:gap-4">
        <span className="flex items-center gap-1.5 font-display text-[13px] uppercase tracking-[0.18em] text-nx-ink">
          <i className="size-[14px] rounded-[3px] bg-[linear-gradient(140deg,#6FE3FF,#4B8CFF_45%,#8B5CF6)] shadow-[0_0_14px_-3px_rgba(75,140,255,0.8)]" />
          NEBULA AI
        </span>

        <div className="ml-auto hidden items-center gap-7 text-xs text-nx-ink-2 md:flex">
          <button type="button" className="transition-colors hover:text-nx-ink">
            {t.nav.home}
          </button>
          <button type="button" className="transition-colors hover:text-nx-ink">
            {t.nav.workspace}
          </button>
          <button type="button" className="transition-colors hover:text-nx-ink">
            {t.nav.capabilities}
          </button>
        </div>

        <button
          type="button"
          onClick={toggleLocale}
          aria-label={t.nav.langLabel}
          className="ml-4 flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 font-mono text-[11px] transition-colors hover:border-white/25"
        >
          <b className="font-normal text-nx-ink">{isZh ? "中文" : "EN"}</b>
          <i className="not-italic text-nx-ink-4">/</i>
          <span className="text-nx-ink-3">{isZh ? "EN" : "中文"}</span>
        </button>
      </nav>

      {/* 文字轴：桌面垂直居中，竖屏下锚在快捷入口上方 */}
      <div className="absolute inset-x-[6%] bottom-[27%] z-[15] flex flex-col md:inset-x-auto md:bottom-[16%] md:left-[6%] md:w-[56%] lg:bottom-0 lg:left-[5.5%] lg:top-0 lg:w-[40%] lg:justify-center lg:pt-[5.8vw]">
        <span className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-nx-electric md:mb-6">
          <i className="h-px w-5 bg-[linear-gradient(90deg,transparent,#4B8CFF)] md:w-8" />
          {t.hero.eyebrow}
        </span>

        <h1
          className={`mb-5 text-[clamp(30px,9.2vw,44px)] leading-[1.04] font-semibold text-nx-ink md:mb-6 md:text-[clamp(40px,7.4vw,68px)] lg:text-[clamp(46px,6.3vw,92px)] ${
            isZh
              ? "font-cjk tracking-normal"
              : "font-display font-medium leading-[0.98] tracking-[-0.035em]"
          }`}
        >
          <span className="block">{t.hero.titleLine1}</span>
          <span className="block">{t.hero.titleLine2}</span>
        </h1>

        <p className="max-w-none text-[15px] leading-[1.7] text-nx-ink-2 md:max-w-[52vw] md:text-[17px] lg:max-w-[37vw] lg:text-[19px]">
          {t.hero.lead}
        </p>

        <div className="mt-7 flex h-[52px] w-full items-center gap-2 rounded-full border border-white/[0.18] bg-[rgba(14,19,32,0.62)] pl-4 pr-1.5 backdrop-blur-[14px] transition-colors hover:border-white/30 focus-within:border-nx-electric/55 focus-within:shadow-[0_0_0_3px_rgba(75,140,255,0.14)] md:mt-8 md:h-14 md:w-[62%] md:pl-6 lg:w-[44vw]">
          <input
            type="text"
            placeholder={t.hero.composerPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-[14px] text-nx-ink outline-none placeholder:text-nx-ink-3 md:text-[15px]"
          />
          <button
            type="button"
            aria-label={t.hero.send}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(140deg,#4B8CFF,#2B5FD9)] shadow-[0_0_22px_-5px_rgba(75,140,255,0.85)] transition-transform hover:scale-[1.04] md:size-11"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden="true"
            >
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </button>
        </div>

        <p className="mt-3 hidden font-mono text-[11px] text-nx-ink-3 md:block">
          <kbd className="rounded border border-white/10 px-1.5 py-0.5">
            ⌘
          </kbd>{" "}
          <kbd className="rounded border border-white/10 px-1.5 py-0.5">K</kbd>{" "}
          {t.hero.composerHint}
        </p>
      </div>

      {/* 快捷入口 */}
      <div className="absolute inset-x-[6%] bottom-5 z-[15] flex items-center gap-2 overflow-hidden border-t border-white/[0.06] pt-4 md:inset-x-[5.5%] md:bottom-8 md:gap-3 md:pt-6">
        <span className="mr-1 hidden font-mono text-[11px] uppercase tracking-[0.12em] text-nx-ink-4 md:inline">
          {t.hero.quickLabel}
        </span>
        {[
          t.hero.quickWriting,
          t.hero.quickSummarize,
          t.hero.quickCode,
          t.hero.quickImage,
        ].map((label, i) => (
          <button
            key={label}
            type="button"
            className={`whitespace-nowrap rounded-full border border-white/10 bg-white/[0.018] px-3 py-2 text-[12px] text-nx-ink-2 transition-all hover:-translate-y-px hover:border-white/25 hover:bg-white/[0.04] hover:text-nx-ink md:px-4 md:text-[13px] ${
              i >= 3 ? "hidden md:inline-block" : ""
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
