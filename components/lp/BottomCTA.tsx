"use client";

import Link from "next/link";
import { APPSTORE_URL, IS_APP_UNDER_REVIEW } from "@/lib/constants";
import Reveal from "./Reveal";

/**
 * 中間 / 下部 CTA セクション。
 */
export default function BottomCTA() {
  return (
    <section id="notify" className="relative py-16 sm:py-24 scroll-mt-24">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-pink-500/5 to-transparent p-8 text-center sm:p-12">
            {/* Accent glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-orange-500/20 blur-[80px]" />

            <h2 className="relative text-2xl font-black text-white sm:text-3xl">
              {IS_APP_UNDER_REVIEW ? "配信まであと少し" : "今すぐ始めよう"}
            </h2>
            <p className="relative mt-3 text-base text-white/50">
              {IS_APP_UNDER_REVIEW
                ? "App Storeの審査完了後に公開されます"
                : "ダウンロードは無料。実戦中でもサクッと判別。"}
            </p>
            {IS_APP_UNDER_REVIEW ? (
              <div className="relative mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled
                  title="審査中のため現在インストールできません"
                  className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500/90 to-pink-500/90 px-10 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/20"
                >
                  🍎 まもなく配信（審査中）
                  <span className="rounded-full border border-white/30 bg-white/15 px-2 py-0.5 text-xs font-semibold">
                    審査中
                  </span>
                </button>
                <Link
                  href="/#notify"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-white/25 hover:bg-white/10"
                >
                  配信開始を通知する
                </Link>
              </div>
            ) : (
              <a
                href={APPSTORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-[1.04] hover:shadow-xl hover:shadow-orange-500/40 active:scale-[0.98]"
              >
                🍎 App Storeで入手
              </a>
            )}
            <p className="relative mt-4 text-xs text-white/40">
              {IS_APP_UNDER_REVIEW
                ? "配信開始時はトップページでお知らせします"
                : "無料で使えます（※一部機能は順次拡充予定）"}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
