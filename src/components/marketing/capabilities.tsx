import { getTranslations } from "next-intl/server";

import { Panel } from "@/components/ui/panel";

import "./marketing.css";

/** 能力展示。构图依据 docs/design/HOME_IA.md §4：7 + 5 不对称双列 + 一条流程带。 */
export async function Capabilities() {
  const t = await getTranslations("Home");

  /* 静态取文案而不是拼 key：next-intl 对动态 key 无法做类型校验，
     少一层字符串拼接就少一类双语漏翻的可能。 */
  const indexItems = [
    { no: "02", label: t("capabilities.item.summarize") },
    { no: "03", label: t("capabilities.item.code") },
    { no: "04", label: t("capabilities.item.image") },
  ];

  const flow = [
    t("capabilities.flow.idea"),
    t("capabilities.flow.generate"),
    t("capabilities.flow.refine"),
    t("capabilities.flow.finish"),
  ];

  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-title"
      className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 lg:py-36"
    >
      <div className="flex items-end justify-between gap-8">
        <div>
          <p className="text-caption uppercase tracking-nx-caption text-nx-ink-3">
            {t("capabilities.eyebrow")}
          </p>
          <h2
            id="capabilities-title"
            className="nx-h2 mt-4 max-w-xl text-balance text-nx-ink"
          >
            {t("capabilities.title")}
          </h2>
          <p className="mt-4 max-w-lg text-body text-nx-ink-3">
            {t("capabilities.lead")}
          </p>
        </div>
        {/* 序号索引只是版式标记，对读屏无信息量 */}
        <span
          aria-hidden="true"
          className="hidden shrink-0 pb-2 text-caption tracking-nx-caption text-nx-ink-4 sm:block"
        >
          {t("capabilities.index")}
        </span>
      </div>

      <div className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-12">
        <Panel
          tone="glass"
          padding="lg"
          className="flex min-h-[19rem] flex-col justify-between gap-10 lg:col-span-7 lg:min-h-[26rem]"
        >
          <span
            aria-hidden="true"
            className="text-caption tracking-nx-caption text-nx-ion"
          >
            01
          </span>
          <div>
            <h3 className="nx-h2 text-nx-ink">
              {t("capabilities.primary.title")}
            </h3>
            <p className="mt-3 max-w-sm text-body text-nx-ink-2">
              {t("capabilities.primary.body")}
            </p>
          </div>
        </Panel>

        {/* 右侧三张降级为一条索引列：不与之并列，避免四张同构卡片 */}
        <Panel
          tone="solid"
          padding="none"
          className="divide-y divide-nx-line-hair lg:col-span-5"
        >
          {indexItems.map((item) => (
            <div
              key={item.no}
              className="flex items-center justify-between gap-4 px-6 py-6"
            >
              <span
                aria-hidden="true"
                className="text-caption tracking-nx-caption text-nx-ink-4"
              >
                {item.no}
              </span>
              <span className="text-body font-medium text-nx-ink-2">
                {item.label}
              </span>
            </div>
          ))}
        </Panel>
      </div>

      {/* 流程带：用 hairline 连接，不用箭头图标 */}
      <ol className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
        {flow.map((step, i) => (
          <li key={step} className="border-t border-nx-line-hair pt-4">
            <span
              aria-hidden="true"
              className="text-caption tracking-nx-caption text-nx-ink-4"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="mt-1 block text-ui text-nx-ink-2">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
