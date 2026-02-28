"use client";

import { APPSTORE_URL } from "@/lib/constants";

/**
 * モバイル固定CTAバー（sm以上では非表示）。
 */
export default function StickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-bg0/95 px-4 py-3 backdrop-blur-md sm:hidden">
      <a
        href={APPSTORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition active:scale-[0.98]"
      >
        🍎 App Storeで入手（無料）
      </a>
    </div>
  );
}
