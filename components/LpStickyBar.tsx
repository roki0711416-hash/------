"use client";

import { APPSTORE_URL } from "@/lib/constants";

/**
 * LP用モバイル固定CTAバー。
 * sm 以上（641px〜）では非表示。
 */
export default function LpStickyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-orange-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:hidden">
      <a
        href={APPSTORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-base font-semibold text-white shadow-sm transition active:bg-orange-600"
      >
        🍎 App Storeで入手（無料）
      </a>
    </div>
  );
}
