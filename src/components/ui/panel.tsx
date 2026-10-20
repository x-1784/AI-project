import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export type PanelTone = "glass" | "solid";
export type PanelPadding = "none" | "sm" | "md" | "lg";

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  tone?: PanelTone;
  padding?: PanelPadding;
}

const toneClasses: Record<PanelTone, string> = {
  glass:
    "border border-nx-line-base bg-nx-glass shadow-nx-lift backdrop-blur-xl",
  solid: "border border-nx-line-base bg-nx-deep",
};

const paddingClasses: Record<PanelPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Panel({
  className,
  tone = "glass",
  padding = "md",
  ...props
}: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-nx-card",
        toneClasses[tone],
        paddingClasses[padding],
        className,
      )}
      {...props}
    />
  );
}
