import type { ReactNode } from "react";

export function IosCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm " + className
      }
    >
      {children}
    </div>
  );
}
