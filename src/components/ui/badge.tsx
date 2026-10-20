import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export type BadgeTone = "accent" | "muted";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  accent: "border-nx-line-accent bg-nx-electric/10 text-nx-electric",
  muted: "border-nx-line-base bg-nx-line-hair text-nx-ink-2",
};

export function Badge({ className, tone = "muted", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-nx-pill border px-2.5 py-1 text-caption font-medium uppercase tracking-nx-caption",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
