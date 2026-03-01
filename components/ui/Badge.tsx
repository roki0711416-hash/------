import type { ReactNode } from "react";

type BadgeVariant = "default" | "orange" | "emerald" | "pink" | "violet" | "amber" | "sky";

const VARIANTS: Record<BadgeVariant, string> = {
  default: "border-white/15 bg-white/10 text-white/80",
  orange: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  pink: "border-pink-500/30 bg-pink-500/10 text-pink-300",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  sky: "border-sky-500/30 bg-sky-500/10 text-sky-300",
};

/**
 * Badge — 統一ラベルバッジ。
 */
export default function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
