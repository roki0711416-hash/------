"use client";

import Link from "next/link";

/**
 * StickyCTA — モバイル固定CTAバー。
 * 汎用版：リンク先とラベルを外から渡せる。
 */
export default function StickyCTA({
  href,
  label,
  external = false,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const cls =
    "flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cta-from to-cta-to px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition active:scale-[0.98]";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-bg0/95 px-4 py-3 backdrop-blur-md sm:hidden">
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {label}
        </a>
      ) : (
        <Link href={href} className={cls}>
          {label}
        </Link>
      )}
    </div>
  );
}
