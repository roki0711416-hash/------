"use client";

import { APPSTORE_URL } from "@/lib/constants";
import Reveal from "./Reveal";

/**
 * 中間 / 下部 CTA セクション。
 */
export default function BottomCTA() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-pink-500/5 to-transparent p-8 text-center sm:p-12">
            {/* Accent glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-orange-500/20 blur-[80px]" />

            <h2 className="relative text-2xl font-black text-white sm:text-3xl">
              今すぐ始めよう
            </h2>
            <p className="relative mt-3 text-base text-white/50">
              ダウンロードは無料。実戦中でもサクッと判別。
            </p>
            <a
              href={APPSTORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-[1.04] hover:shadow-xl hover:shadow-orange-500/40 active:scale-[0.98]"
            >
              🍎 App Storeで入手
            </a>
            <p className="relative mt-4 text-xs text-white/40">
              無料で使えます（※一部機能は順次拡充予定）
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
