"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

export function IosButton({
  variant,
  children,
  className = "",
  ...props
}: {
  variant: Variant;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";

  const styles =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-800"
      : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200";

  return (
    <button
      type={props.type ?? "button"}
      {...props}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </button>
  );
}
