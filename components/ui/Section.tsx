import type { ReactNode } from "react";

/**
 * Section — 統一セクションラッパー。
 * 見出し + 説明 + 子コンテンツ をまとめ、余白を統一する。
 */
export default function Section({
  children,
  title,
  subtitle,
  className = "",
  id,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-10 sm:py-14 ${className}`}>
      {title && (
        <div className="mb-6">
          <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
