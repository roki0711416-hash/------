"use client";

/**
 * components/stores/StoreCard.tsx
 *
 * 店舗カード共通コンポーネント。
 * - 店名（太字）
 * - 所在地（市区町村 + 住所短縮）
 * - Google Maps リンク（lat/lng）
 * - 任意のバッジ（活性/還元 etc.）
 */

import Link from "next/link";

/* ── 型定義 ── */

export interface StoreCardBadge {
  label: string;
  value: number;
}

export interface StoreCardStore {
  id: string;
  name: string;
  city?: string | null;
  address?: string | null;
  prefecture_name?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface StoreCardProps {
  store: StoreCardStore;
  href: string;
  /** ランキング順位（表示する場合） */
  rank?: number;
  /** バッジ配列（還元・活性など） */
  badges?: StoreCardBadge[];
  /** バッジなし時のラベル */
  noBadgeLabel?: string;
  /** 追加のクラス名 */
  className?: string;
}

/* ── ヘルパー ── */

/** 住所を短縮（30文字超は省略） */
function truncateAddress(addr: string, max = 30): string {
  return addr.length > max ? addr.slice(0, max) + "…" : addr;
}

/** 所在地テキストを組み立てる */
function buildLocationText(
  store: StoreCardStore,
): string | null {
  const parts: string[] = [];
  if (store.prefecture_name) parts.push(store.prefecture_name);
  if (store.city) parts.push(store.city);
  if (store.address) {
    // city と同じテキストが address の先頭にある場合は除去
    let addr = store.address;
    if (store.city && addr.startsWith(store.city)) {
      addr = addr.slice(store.city.length).trimStart();
    }
    if (addr) parts.push(truncateAddress(addr));
  }
  return parts.length > 0 ? parts.join(" ") : null;
}

/* ── スコアバッジ ── */

function ScoreBadge({ value, label }: StoreCardBadge) {
  let color = "text-white/60 border-white/10 bg-white/[0.04]";
  if (value >= 70)
    color = "text-emerald-300 border-emerald-500/30 bg-emerald-500/10";
  else if (value >= 50)
    color = "text-amber-300 border-amber-500/30 bg-amber-500/10";
  else if (value >= 30)
    color = "text-white/60 border-white/10 bg-white/[0.04]";
  else color = "text-white/30 border-white/[0.06] bg-white/[0.02]";

  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${color}`}
    >
      {label} {value}
    </span>
  );
}

/* ── ランク数字 ── */

function RankCircle({ rank }: { rank: number }) {
  const style =
    rank === 1
      ? "bg-amber-500/20 text-amber-300"
      : rank === 2
        ? "bg-white/10 text-white/60"
        : rank === 3
          ? "bg-orange-800/20 text-orange-300"
          : "bg-white/[0.06] text-white/40";
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${style}`}
    >
      {rank}
    </span>
  );
}

/* ── メインコンポーネント ── */

export default function StoreCard({
  store,
  href,
  rank,
  badges,
  noBadgeLabel,
  className,
}: StoreCardProps) {
  const location = buildLocationText(store);
  const mapsUrl =
    store.lat != null && store.lng != null
      ? `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`
      : null;

  return (
    <Link
      href={href}
      className={`flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.07] hover:shadow-xl ${className ?? ""}`}
    >
      {/* ランク番号 */}
      {rank != null && (
        <div className="pt-0.5">
          <RankCircle rank={rank} />
        </div>
      )}

      {/* 本体 */}
      <div className="flex-1 min-w-0">
        {/* 店名 */}
        <p className="text-sm font-bold text-white truncate">{store.name}</p>

        {/* 所在地 */}
        {location ? (
          <p className="mt-1 text-xs text-white/40 truncate">📍 {location}</p>
        ) : (
          <span className="mt-1 inline-block rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] text-white/25">
            住所情報なし
          </span>
        )}

        {/* バッジ行 */}
        <div className="mt-2 flex items-center gap-1 flex-wrap">
          {badges && badges.length > 0 ? (
            badges.map((b) => <ScoreBadge key={b.label} {...b} />)
          ) : noBadgeLabel ? (
            <span className="inline-block rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] text-white/30">
              {noBadgeLabel}
            </span>
          ) : null}

          {/* 地図リンク */}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="ml-auto shrink-0 rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/40 transition hover:bg-white/[0.12] hover:text-white/70"
            >
              🗺 地図
            </a>
          )}
        </div>
      </div>
    </Link>
  );
}
