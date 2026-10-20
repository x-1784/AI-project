"use client";

import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-nx-electric text-nx-void hover:bg-nx-electric/90 active:bg-nx-electric-deep active:text-nx-ink",
  secondary:
    "border border-nx-line-strong bg-transparent text-nx-ink hover:border-nx-line-accent hover:bg-nx-glass",
  ghost:
    "border border-transparent text-nx-ink-2 hover:bg-nx-line-hair hover:text-nx-ink",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-ui",
  md: "h-11 px-5 text-ui",
  lg: "h-12 px-6 text-body",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      type = "button",
      onClick,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        aria-busy={isLoading || undefined}
        // 加载时保留焦点：原生 disabled 会把按钮移出 Tab 顺序，
        // 键盘用户触发后焦点会掉回 body。
        aria-disabled={isLoading || undefined}
        onClick={(event) => {
          if (isLoading) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-nx-pill font-medium",
          "transition-[color,background-color,border-color,transform] duration-[180ms] ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nx-line-accent focus-visible:ring-offset-2 focus-visible:ring-offset-nx-void",
          "active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
          "aria-disabled:pointer-events-none aria-disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {children}
      </button>
    );
  },
);
