"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  hint?: ReactNode;
}

export function Input({ id, label, hint, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex w-full flex-col gap-2">
      {label ? (
        <label htmlFor={inputId} className="text-ui font-medium text-nx-ink-2">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        aria-describedby={hintId}
        className={cn(
          "h-11 w-full rounded-nx-lg border border-nx-line-base bg-nx-deep/60 px-4 text-ui text-nx-ink",
          "placeholder:text-nx-ink-3",
          "transition-colors duration-[220ms] ease-out",
          "hover:border-nx-line-strong",
          "focus-visible:border-nx-line-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nx-line-accent/60",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      {hint ? (
        <p id={hintId} className="text-caption text-nx-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
