"use client";

import { ArrowUp } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

type HeroComposerProps = {
  placeholder: string;
  sendLabel: string;
  hint: string;
  quickLabel: string;
  quick: readonly string[];
};

/**
 * 首屏输入框。
 *
 * 阶段 2 不接 `/api/chat`，所以提交被显式拦下——不做假跳转、不做假回答，
 * 也不出现"正在生成"这类不存在的状态。输入与焦点行为保持真实，
 * 便于在 P2-HOME-02 验收键盘可用性，也便于阶段 3 直接接上 onSubmit。
 *
 * 客户端组件的原因只有一条：需要阻止表单默认提交（会带 query 刷新整页）。
 */
export function HeroComposer({
  placeholder,
  sendLabel,
  hint,
  quickLabel,
  quick,
}: HeroComposerProps) {
  const fieldId = useId();
  const hintId = `${fieldId}-hint`;
  const [value, setValue] = useState("");

  return (
    <form
      id="composer"
      // 锚点目标：收尾 CTA 用 #composer 跳回来，不做 JS 滚动劫持。
      onSubmit={(event) => {
        event.preventDefault();
      }}
      className="mt-8 w-full max-w-[min(560px,72vw)] lg:max-w-xl"
    >
      <Panel
        tone="glass"
        padding="sm"
        className="focus-within:border-nx-line-accent"
      >
        <label htmlFor={fieldId} className="sr-only">
          {placeholder}
        </label>
        <textarea
          id={fieldId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={2}
          placeholder={placeholder}
          aria-describedby={hintId}
          className="w-full resize-none bg-transparent px-2 py-1 text-ui leading-relaxed text-nx-ink placeholder:text-nx-ink-3 focus:outline-none"
        />
        <div className="mt-1 flex items-end justify-between gap-3">
          <p id={hintId} className="text-caption text-nx-ink-3">
            {hint}
          </p>
          <Button
            type="submit"
            variant="primary"
            size="md"
            aria-label={sendLabel}
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </Panel>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-nx-line-hair pt-4">
        <span className="mr-1 text-caption uppercase tracking-nx-caption text-nx-ink-4">
          {quickLabel}
        </span>
        {quick.map((item) => (
          <Button key={item} type="button" variant="ghost" size="sm">
            {item}
          </Button>
        ))}
      </div>
    </form>
  );
}
