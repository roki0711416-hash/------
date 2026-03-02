"use client";

import Link from "next/link";
import { APPSTORE_URL, IS_APP_UNDER_REVIEW } from "@/lib/constants";

/**
 * LP用モバイル固定CTAバー。
 * sm 以上（641px〜）では非表示。
 */
export default function LpStickyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-orange-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:hidden">
      {IS_APP_UNDER_REVIEW ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled
            title="審査中のため現在インストールできません"
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-orange-400 px-3 py-3 text-xs font-semibold text-white shadow-sm"
          >
            🍎 まもなく配信（審査中）
          </button>
          <Link
            href="/#notify"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-3 text-xs font-semibold text-orange-600"
          >
            配信開始を通知
          </Link>
        </div>
      ) : (
        <a
          href={APPSTORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-base font-semibold text-white shadow-sm transition active:bg-orange-600"
        >
          🍎 App Storeで入手（無料）
        </a>
      )}
    </div>
  );
}
