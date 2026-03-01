import type { ReactNode } from "react";

/**
 * PageHeader — ページ上部の見出し + サブテキスト + アクション。
 * 統一されたタイポ & 余白を保証する。
 */
export default function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  /** CTA ボタン等を追加で配置する場所 */
  children?: ReactNode;
}) {
  return (
    <header className="space-y-3 pb-6">
      <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm leading-relaxed text-muted">{subtitle}</p>
      )}
      {children}
    </header>
  );
}
