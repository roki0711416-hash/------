"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  PREFECTURES,
  REGION_DEFS,
  RegionKey,
} from "@/lib/prefectures";

const REGION_THEME: Record<RegionKey, string> = {
  hokkaido_tohoku: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20",
  kanto: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
  chubu: "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
  kinki: "border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20",
  chugoku: "border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20",
  shikoku: "border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20",
  kyushu_okinawa: "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
};

export default function PrefecturesGateway() {
  const [query, setQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>("kanto");

  const normalizedQuery = query.trim().toLowerCase();

  const selectedRegionPrefs = useMemo(() => {
    return PREFECTURES.filter((p) => p.region === selectedRegion);
  }, [selectedRegion]);

  const displayPrefs = useMemo(() => {
    if (!normalizedQuery) return selectedRegionPrefs;
    return selectedRegionPrefs.filter(
      (p) => p.name.includes(query.trim()) || p.slug.includes(normalizedQuery)
    );
  }, [normalizedQuery, query, selectedRegionPrefs]);

  const selectedRegionLabel =
    REGION_DEFS.find((r) => r.key === selectedRegion)?.label ?? "地域";

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-sm sm:p-6">
      <h1 className="text-2xl font-black tracking-tight text-white">全国の入口</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        地域を選んで都道府県ごとの店舗データをチェック。
      </p>

      <div className="mt-5">
        <label htmlFor="pref-search" className="mb-2 block text-sm font-semibold text-white/80">
          都道府県検索
        </label>
        <input
          id="pref-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例）東京 / tokyo"
          className="w-full rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition focus:border-white/25 focus:bg-white/[0.1]"
        />
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-bold text-white/90">地域から探す</h2>
        <p className="mt-1 text-xs text-muted">
          地域を選択すると該当する都道府県を表示します
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {REGION_DEFS.map((region) => {
            const isSelected = selectedRegion === region.key;
            return (
              <button
                key={region.key}
                type="button"
                onClick={() => setSelectedRegion(region.key)}
                className={[
                  "min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold leading-tight transition-all",
                  REGION_THEME[region.key],
                  isSelected
                    ? "ring-2 ring-white/20 shadow-lg"
                    : "opacity-70 hover:opacity-100",
                ].join(" ")}
                aria-pressed={isSelected}
              >
                {region.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <h3 className="text-sm font-semibold text-white/80">
          {normalizedQuery
            ? `${selectedRegionLabel} の検索結果（${displayPrefs.length}件）`
            : `${selectedRegionLabel} の都道府県`}
        </h3>

        {displayPrefs.length === 0 ? (
          <p className="mt-3 text-sm text-muted">該当する都道府県がありません。</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {displayPrefs.map((p) => (
              <Link
                key={p.slug}
                href={`/prefectures/${p.slug}`}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                {p.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
