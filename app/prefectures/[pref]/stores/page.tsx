import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPrefectureBySlug, getAllPrefectureSlugs } from "@/lib/prefectures";
import {
  listStoresByPrefecture,
  getLatestSignalForStores,
  type StoreDailySignalRow,
} from "@/lib/storeAnalytics";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://slokasukun.com";

/* ── 静的パス生成 ── */
export function generateStaticParams() {
  return getAllPrefectureSlugs().map((slug) => ({ pref: slug }));
}

/* ── メタデータ ── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ pref: string }>;
}): Promise<Metadata> {
  const { pref } = await params;
  const p = getPrefectureBySlug(pref);
  if (!p) return {};
  return {
    title: `${p.name}の店舗一覧｜スロカスくん`,
    description: `${p.name}のパチンコ・スロットホール店舗一覧。各店舗の傾向分析を掲載。`,
    alternates: { canonical: `${BASE_URL}/prefectures/${pref}/stores` },
  };
}

/* ── スコアバッジ ── */
function ScoreBadge({ value, label }: { value: number; label: string }) {
  let color = "text-white/60 border-white/10 bg-white/[0.04]";
  if (value >= 70) color = "text-emerald-300 border-emerald-500/30 bg-emerald-500/10";
  else if (value >= 50) color = "text-amber-300 border-amber-500/30 bg-amber-500/10";
  else if (value >= 30) color = "text-white/60 border-white/10 bg-white/[0.04]";
  else color = "text-white/30 border-white/[0.06] bg-white/[0.02]";
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${color}`}>
      {label} {value}
    </span>
  );
}

function SignalBadges({ sig }: { sig: StoreDailySignalRow | undefined }) {
  if (!sig) {
    return (
      <span className="inline-block rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] text-white/30">
        データなし
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      <ScoreBadge value={sig.reward_index} label="還元" />
      <ScoreBadge value={sig.traffic_index} label="活性" />
      <ScoreBadge value={sig.swing_index} label="荒さ" />
      <ScoreBadge value={sig.high_chance_index} label="上振" />
    </div>
  );
}

/* ── ページ ── */
export const dynamic = "force-dynamic";

export default async function PrefectureStoresPage({
  params,
}: {
  params: Promise<{ pref: string }>;
}) {
  const { pref } = await params;
  const prefecture = getPrefectureBySlug(pref);
  if (!prefecture) notFound();

  const stores = await listStoresByPrefecture(pref);
  const signalMap = stores.length > 0
    ? await getLatestSignalForStores(stores.map((s) => s.id))
    : new Map<string, StoreDailySignalRow>();

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        {/* パンくず */}
        <nav className="text-xs text-muted">
          <Link href="/prefectures" className="hover:underline hover:text-white transition">
            全国
          </Link>{" "}
          &gt;{" "}
          <Link href={`/prefectures/${pref}`} className="hover:underline hover:text-white transition">
            {prefecture.name}
          </Link>{" "}
          &gt; <span className="text-white/80">店舗一覧</span>
        </nav>

        <h1 className="mt-3 text-xl font-black text-white">
          {prefecture.name}の店舗一覧
        </h1>
        <p className="mt-2 text-sm text-muted">
          {stores.length}店舗の分析データを表示しています。
        </p>

        {/* 店舗カード */}
        {stores.length === 0 ? (
          <p className="mt-6 text-xs text-muted">
            店舗データがありません。シードスクリプトを実行してください。
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {stores.map((s) => {
              const sig = signalMap.get(s.id);
              return (
                <li key={s.id}>
                  <Link
                    href={`/stores/${s.id}`}
                    className="block rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.07] hover:shadow-xl"
                  >
                    <p className="text-sm font-bold text-white">{s.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {s.city} {s.address}
                    </p>
                    <div className="mt-2">
                      <SignalBadges sig={sig} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* 免責 */}
        <p className="mt-10 text-[10px] leading-relaxed text-white/20">
          ※
          本サイトは公開情報等を基にした独自集計の参考情報であり、結果を保証するものではありません。
        </p>
      </div>
    </main>
  );
}
