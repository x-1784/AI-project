"use client";

import { useId, type ReactNode, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
}

export function Textarea({
  id,
  label,
  hint,
  className,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = hint ? `${textareaId}-hint` : undefined;

  return (
    <div className="flex w-full flex-col gap-2">
      {label ? (
        <label
          htmlFor={textareaId}
          className="text-ui font-medium text-nx-ink-2"
        >
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        aria-describedby={hintId}
        className={cn(
          "min-h-32 w-full resize-y rounded-nx-lg border border-nx-line-base bg-nx-deep/60 px-4 py-3 text-ui text-nx-ink",
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
