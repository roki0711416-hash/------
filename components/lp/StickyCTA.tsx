"use client";

import Link from "next/link";
import { APPSTORE_URL, IS_APP_UNDER_REVIEW } from "@/lib/constants";

/**
 * モバイル固定CTAバー（sm以上では非表示）。
 */
export default function StickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-bg0/95 px-4 py-3 backdrop-blur-md sm:hidden">
      {IS_APP_UNDER_REVIEW ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled
            title="審査中のため現在インストールできません"
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500/90 to-pink-500/90 px-3 py-3.5 text-xs font-bold text-white shadow-lg shadow-orange-500/20"
          >
            🍎 まもなく配信（審査中）
          </button>
          <Link
            href="/#notify"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-3.5 text-xs font-semibold text-white/90"
          >
            配信開始を通知
          </Link>
        </div>
      ) : (
        <a
          href={APPSTORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition active:scale-[0.98]"
        >
          🍎 App Storeで入手（無料）
        </a>
      )}
    </div>
  );
}
