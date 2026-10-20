import { getTranslations } from "next-intl/server";

/**
 * 收尾 CTA。构图依据 docs/design/HOME_IA.md §6.2：居中单列、最大 6 列宽，
 * 点击回到首屏输入框。
 *
 * 这里用 `<a href="#composer">` 而不是 `Button`：`Button` 渲染的是 `<button>`，
 * 用一个按钮做页面内跳转会丢掉"可复制链接、右键、在新标签打开"的原生锚点能力，
 * 也会诱使我们去写 JS 滚动劫持。样式按 Button primary / lg 的类逐一照抄。
 * 若后续 `Button` 支持 `asChild` 或 `href`，这里应换成 `<Button asChild>`。
 */
export async function ClosingCta() {
  const t = await getTranslations("Home");

  return (
    <section aria-labelledby="cta-title" className="bg-nx-void py-24 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
          <h2 id="cta-title" className="nx-h2 text-balance text-nx-ink">
            {t("cta.title")}
          </h2>
          <a
            href="#composer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-nx-pill border border-transparent bg-nx-electric px-6 text-body font-medium text-nx-void transition-[background-color,transform] duration-[180ms] ease-out hover:bg-nx-electric/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nx-line-accent focus-visible:ring-offset-2 focus-visible:ring-offset-nx-void active:translate-y-px"
          >
            {t("cta.button")}
          </a>
        </div>
      </div>
    </section>
  );
}
