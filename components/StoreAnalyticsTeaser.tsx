"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  REGION_DEFS,
  RegionKey,
  getPrefecturesByRegion,
} from "@/lib/prefectures";

const REGION_BTN: Record<RegionKey, string> = {
  hokkaido_tohoku: "bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100",
  kanto: "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
  chubu: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100",
  kinki: "bg-pink-50 text-pink-800 border-pink-200 hover:bg-pink-100",
  chugoku: "bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100",
  shikoku: "bg-violet-50 text-violet-800 border-violet-200 hover:bg-violet-100",
  kyushu_okinawa: "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100",
};

export default function StoreAnalyticsTeaser() {
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>("kanto");

  const grouped = useMemo(() => getPrefecturesByRegion(), []);
  const prefs = useMemo(
    () => grouped.find((g) => g.region === selectedRegion)?.prefs ?? [],
    [grouped, selectedRegion],
  );

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold tracking-tight text-white">
        🏢 全国ホール分析（無料）
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        地方を選ぶと都道府県リンクが表示されます。都道府県を選んで店舗データを確認しましょう。
      </p>

      {/* 7地方ボタン */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {REGION_DEFS.map((r) => {
          const active = selectedRegion === r.key;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => setSelectedRegion(r.key)}
              className={[
                "rounded-xl border px-3 py-2 text-sm font-semibold transition",
                REGION_BTN[r.key],
                active ? "ring-2 ring-white/20" : "opacity-80",
              ].join(" ")}
              aria-pressed={active}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* 都道府県リンク一覧 */}
      <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
        <h3 className="text-sm font-semibold text-white">
          {REGION_DEFS.find((r) => r.key === selectedRegion)?.label ?? "地方"} の都道府県
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {prefs.map((p) => (
            <Link
              key={p.slug}
              href={`/prefectures/${p.slug}`}
              className="inline-block rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/[0.07]"
            >
              {p.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 全国一覧へ */}
      <div className="mt-4 text-center">
        <Link
          href="/prefectures"
          className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-cta-from to-cta-to px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          全国一覧へ
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
