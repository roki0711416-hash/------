import type { ReactNode } from "react";

/**
 * LP セクション共通ラッパー。
 * 余白 + 最大幅を統一する。
 */
export default function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`relative py-16 sm:py-24 ${className}`}>
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">{children}</div>
    </section>
  );
}
