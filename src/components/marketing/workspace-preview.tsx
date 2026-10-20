import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";

/**
 * 工作台预览。构图依据 docs/design/HOME_IA.md §5。
 *
 * 刻意倾斜并溢出右边界：倾斜 + 溢出暗示"这是可以进去的空间"，
 * 正放的截图框会被读成产品截图。面板必须明确标注为预览，
 * 内部骨架全部 aria-hidden，避免读屏朗读占位文本。
 */
export async function WorkspacePreview() {
  const t = await getTranslations("Home");

  return (
    <section
      id="workspace"
      aria-labelledby="workspace-title"
      className="relative overflow-hidden bg-nx-abyss py-24 lg:py-36"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="max-w-xl">
          <p className="text-caption uppercase tracking-nx-caption text-nx-ink-3">
            {t("workspace.eyebrow")}
          </p>
          <h2
            id="workspace-title"
            className="nx-h2 mt-4 text-balance text-nx-ink"
          >
            {t("workspace.title")}
          </h2>
          <p className="mt-4 text-body text-nx-ink-3">{t("workspace.body")}</p>
        </div>

        {/* 宽出容器 6rem：面板溢出右边界后由 section 的 overflow-hidden 裁掉 */}
        <div className="relative mt-12 lg:mt-16 lg:w-[calc(100%+6rem)]">
          <Panel
            tone="glass"
            padding="none"
            aria-label={t("workspace.previewAriaLabel")}
            className="relative overflow-hidden lg:origin-top-right lg:-rotate-[1.2deg]"
          >
            <Badge tone="muted" className="absolute left-4 top-4 z-10">
              {t("workspace.previewBadge")}
            </Badge>

            <div
              aria-hidden="true"
              className="grid grid-cols-1 sm:grid-cols-[14rem_1fr]"
            >
              {/* 左：会话列表骨架 */}
              <div className="hidden flex-col gap-5 border-r border-nx-line-hair p-5 pt-16 sm:flex">
                {[0, 1, 2, 3, 4].map((row) => (
                  <div key={row} className="flex items-center gap-3">
                    <span className="size-6 shrink-0 rounded-full bg-nx-line-strong" />
                    <span className="flex-1 space-y-1.5">
                      <span className="block h-2 w-3/5 rounded-full bg-nx-line-base" />
                      <span className="block h-2 w-4/5 rounded-full bg-nx-line-hair" />
                    </span>
                  </div>
                ))}
              </div>

              {/* 右：消息流骨架 */}
              <div className="flex flex-col gap-4 p-5 pt-16 sm:p-8 sm:pt-16">
                <div className="ml-auto w-[62%] space-y-2 rounded-nx-lg border border-nx-line-base bg-nx-glass p-4">
                  <span className="block h-2 w-11/12 rounded-full bg-nx-line-base" />
                  <span className="block h-2 w-2/3 rounded-full bg-nx-line-hair" />
                </div>
                <div className="w-[78%] space-y-2 rounded-nx-lg border border-nx-line-hair bg-nx-shelf/60 p-4">
                  <span className="block h-2 w-full rounded-full bg-nx-line-base" />
                  <span className="block h-2 w-10/12 rounded-full bg-nx-line-base" />
                  <span className="block h-2 w-5/12 rounded-full bg-nx-line-hair" />
                </div>
                <div className="w-[54%] space-y-2 rounded-nx-lg border border-nx-line-hair bg-nx-shelf/60 p-4">
                  <span className="block h-2 w-9/12 rounded-full bg-nx-line-base" />
                  <span className="block h-2 w-6/12 rounded-full bg-nx-line-hair" />
                </div>
                {/* 流式打字态：三个点大小递减，不引入额外 keyframes */}
                <div className="flex w-20 items-center gap-1.5 rounded-nx-pill border border-nx-line-hair bg-nx-shelf/60 px-3 py-2">
                  <span className="size-1.5 rounded-full bg-nx-ion" />
                  <span className="size-1.5 rounded-full bg-nx-ion/60" />
                  <span className="size-1.5 rounded-full bg-nx-ion/30" />
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}
