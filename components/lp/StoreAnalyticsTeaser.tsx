"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Reveal from "./Reveal";
import {
  REGION_DEFS,
  RegionKey,
  PREFECTURES,
} from "@/lib/prefectures";
import { WEB_ANALYTICS_URL } from "@/lib/constants";

const REGION_ACCENT: Record<RegionKey, string> = {
  hokkaido_tohoku: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20",
  kanto: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
  chubu: "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
  kinki: "border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20",
  chugoku: "border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20",
  shikoku: "border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20",
  kyushu_okinawa: "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
};

export default function LpStoreAnalyticsTeaser() {
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>("kanto");

  const prefs = useMemo(
    () => PREFECTURES.filter((p) => p.region === selectedRegion),
    [selectedRegion],
  );

  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <Reveal>
          <p className="text-center text-xs font-semibold tracking-wider text-white/40">
            ▼ WEB版の無料機能
          </p>
          <h2 className="mt-3 text-center text-3xl font-black tracking-tight text-white sm:text-4xl">
            🏢 全国ホール分析
          </h2>
          <p className="mt-4 text-center text-base text-white/50">
            地域を選んで都道府県ごとの店舗データを無料でチェック。
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm sm:p-6">
            {/* 7地方ボタン */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {REGION_DEFS.map((r) => {
                const active = selectedRegion === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setSelectedRegion(r.key)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${REGION_ACCENT[r.key]} ${
                      active
                        ? "ring-2 ring-white/20 shadow-lg"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    aria-pressed={active}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>

            {/* 都道府県リンク */}
            <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <h3 className="text-sm font-semibold text-white/60">
                {REGION_DEFS.find((r) => r.key === selectedRegion)?.label ?? "地方"} の都道府県
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {prefs.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/prefectures/${p.slug}`}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/60 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* 全国一覧へ */}
            <div className="mt-5 text-center">
              <Link
                href={WEB_ANALYTICS_URL}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                全国一覧へ →
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
