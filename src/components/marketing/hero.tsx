import { getTranslations } from "next-intl/server";

import { EnergyCoreStage } from "@/components/three/energy-core-stage";
import { Badge } from "@/components/ui/badge";

import { HeroComposer } from "./hero-composer";

/**
 * 首屏。
 *
 * 构图依据 docs/design/HOME_IA.md §3：12 列 / 1280 栅格，文字轴列 1–5，
 * 核心列 7–12 且重心偏右上、被上边界裁切。
 *
 * 只有一个 EnergyCoreStage 实例：手机上它在文档流里独立占位（约 34vh），
 * 桌面端同一个节点改为绝对定位贴右侧。**不能渲染两份**——那会产生两个
 * WebGL context，违反 P2-3D-01 的单 Canvas 约束。
 */
export async function Hero() {
  const t = await getTranslations("Home");

  const quick = [
    t("hero.quick.write"),
    t("hero.quick.summarize"),
    t("hero.quick.code"),
    t("hero.quick.image"),
  ];

  return (
    <section className="relative isolate overflow-hidden bg-nx-void">
      <div className="relative mx-auto mt-8 mb-10 h-[34vh] w-[min(62vw,260px)] sm:h-[38vh] lg:absolute lg:-top-[16%] lg:right-[2%] lg:m-0 lg:h-[120%] lg:w-[50%]">
        <EnergyCoreStage
          className="absolute inset-0"
          fallbackLabel={t("core.fallbackLabel")}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8 lg:grid lg:min-h-[100dvh] lg:grid-cols-12 lg:gap-6 lg:pb-32 lg:pt-[22vh]">
        <div className="lg:col-span-5">
          <Badge tone="accent">{t("hero.eyebrow")}</Badge>

          <h1 className="nx-h1 mt-6 text-balance text-nx-ink">
            <span className="block">{t("hero.titleLine1")}</span>
            <span className="block text-nx-ink-2">{t("hero.titleLine2")}</span>
          </h1>

          <p className="mt-5 max-w-md text-body text-nx-ink-3">
            {t("hero.lead")}
          </p>

          <HeroComposer
            placeholder={t("hero.composerPlaceholder")}
            sendLabel={t("hero.send")}
            hint={t("hero.composerHint")}
            quickLabel={t("hero.quickLabel")}
            quick={quick}
          />
        </div>
      </div>
    </section>
  );
}
