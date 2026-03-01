"use client";

import Image from "next/image";
import Link from "next/link";
import { APPSTORE_URL, WEB_ANALYTICS_URL } from "@/lib/constants";

export default function Hero() {
  return (
    <section className="relative flex min-h-[85vh] items-center py-16 sm:py-20">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* ──── テキスト側 ──── */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />
              <span className="text-xs font-semibold tracking-wider text-orange-300">
                iOS 無料アプリ
              </span>
            </div>

            <h1 className="mt-8 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              スロカスくん
              <span className="mt-2 block bg-gradient-to-r from-orange-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                設定判別を
                <br />
                &quot;データで&quot;サポート
              </span>
            </h1>

            <p className="mt-6 text-base leading-relaxed text-white/50 sm:text-lg">
              実戦データを入力すると傾向を可視化。
              <br className="hidden sm:inline" />
              迷いが減って立ち回りがラクになる。
            </p>

            {/* CTA（上部） */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href={APPSTORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-[1.04] hover:shadow-xl hover:shadow-orange-500/40 active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative">🍎 App Storeで入手</span>
              </a>
              <Link
                href={WEB_ANALYTICS_URL}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-white/25 hover:bg-white/10"
              >
                Webで店舗分析を見る →
              </Link>
            </div>

            <p className="mt-4 text-xs text-white/40">
              無料で使えます（※一部機能は順次拡充予定）
            </p>
          </div>

          {/* ──── iPhoneモック ──── */}
          <div className="relative flex-shrink-0">
            <div className="relative mx-auto w-[260px] sm:w-[280px]">
              {/* Glow behind phone */}
              <div className="pointer-events-none absolute -inset-10 rounded-[60px] bg-gradient-to-b from-orange-500/20 via-pink-500/15 to-transparent blur-3xl" />

              {/* Phone frame */}
              <div className="relative rounded-[40px] border-[5px] border-white/20/80 bg-black p-3 shadow-2xl ring-1 ring-white/10">
                {/* Dynamic Island */}
                <div className="absolute left-1/2 top-3 h-[22px] w-[90px] -translate-x-1/2 rounded-full bg-black" />

                {/* Screen */}
                <div className="mt-5 space-y-2.5 rounded-[30px] bg-gradient-to-b from-bg1 to-bg0 p-4">
                  {/* App header */}
                  <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-2.5">
                    <Image
                      src="/icon.png"
                      alt=""
                      width={32}
                      height={32}
                      className="rounded-lg"
                    />
                    <div>
                      <p className="text-[10px] font-bold text-white">スロカスくん</p>
                      <p className="text-[8px] text-white/40">設定判別ツール</p>
                    </div>
                  </div>

                  {/* 設定判別 mock card */}
                  <div className="rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-pink-500/5 p-3">
                    <p className="text-[10px] font-bold text-orange-400">🎰 設定判別</p>
                    <p className="mt-0.5 text-[8px] text-white/40">設定ごとの傾向を可視化</p>
                    <div className="mt-2 flex gap-0.5">
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div
                          key={n}
                          className="flex-1 rounded-md bg-orange-500/15 py-1 text-center text-[7px] font-bold text-orange-300/90"
                        >
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 店舗分析 mock card */}
                  <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-3">
                    <p className="text-[10px] font-bold text-emerald-400">🏢 店舗分析</p>
                    <p className="mt-0.5 text-[8px] text-white/40">地域の傾向をチェック</p>
                  </div>

                  {/* 収支管理 mock card */}
                  <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-3">
                    <p className="text-[10px] font-bold text-violet-400">📊 収支管理</p>
                    <p className="mt-0.5 text-[8px] text-white/40">日々の収支を記録</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
