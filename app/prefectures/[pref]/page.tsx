import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPrefectureBySlug,
  getAllPrefectureSlugs,
} from "@/lib/prefectures";
import { listStoresByPrefecture } from "@/lib/storeAnalytics";
import { getDb } from "@/lib/db";

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
    title: `${p.name}のパチンコホール分析｜スロカスくん`,
    description: `${p.name}のパチンコ・スロットホールの傾向を独自指標で分析。`,
    alternates: { canonical: `${BASE_URL}/prefectures/${pref}` },
  };
}

/* ── ランキング取得 ── */
interface RankRow {
  id: string;
  name: string;
  city: string | null;
  avg_traffic: number;
  avg_swing: number;
  avg_reward: number;
  avg_high_chance: number;
  latest_note: string | null;
}

type SortKey = "reward" | "traffic" | "highchance";

async function getRanking(pref: string, sort: SortKey = "reward"): Promise<RankRow[]> {
  const db = getDb();
  if (!db) return [];
  const colMap: Record<SortKey, string> = {
    reward: "avg_reward",
    traffic: "avg_traffic",
    highchance: "avg_high_chance",
  };
  const orderCol = colMap[sort] ?? "avg_reward";
  const { rows } = await db.query(
    `SELECT
       s.id, s.name, s.city,
       round(avg(sig.traffic_index))::int      AS avg_traffic,
       round(avg(sig.swing_index))::int        AS avg_swing,
       round(avg(sig.reward_index))::int       AS avg_reward,
       round(avg(sig.high_chance_index))::int  AS avg_high_chance,
       max(sig.note) AS latest_note
     FROM stores s
     JOIN store_daily_signals sig ON sig.store_id = s.id
       AND sig.date >= current_date - 7
     WHERE s.prefecture = $1
     GROUP BY s.id, s.name, s.city
     ORDER BY ${orderCol} DESC
     LIMIT 10`,
    [pref],
  );
  return rows as RankRow[];
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

/* ── ページ ── */
export const dynamic = "force-dynamic";

export default async function PrefecturePage({
  params,
}: {
  params: Promise<{ pref: string }>;
}) {
  const { pref } = await params;
  const prefecture = getPrefectureBySlug(pref);
  if (!prefecture) notFound();

  const ranking = await getRanking(pref, "reward");
  const stores = await listStoresByPrefecture(pref);
  const storeCount = stores.length;

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        {/* パンくず */}
        <nav className="text-xs text-muted">
          <Link href="/prefectures" className="hover:underline hover:text-white transition">
            全国
          </Link>{" "}
          &gt; <span className="text-white/80">{prefecture.name}</span>
        </nav>

        <h1 className="mt-3 text-xl font-black text-white">
          {prefecture.name}のパチンコホール分析
        </h1>
        <p className="mt-2 text-sm text-muted">
          {prefecture.name}
          のホール傾向を独自指標で分析しています。
          {storeCount > 0 && `（${storeCount}店舗）`}
        </p>

        {/* 店舗一覧へ */}
        <div className="mt-6">
          <Link
            href={`/prefectures/${pref}/stores`}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-orange-500/35 active:scale-[0.98]"
          >
            店舗一覧を見る →
          </Link>
        </div>

        {/* 県内ランキング */}
        <section className="mt-8">
          <h2 className="text-base font-bold text-white">県内ランキング（直近7日 還元傾向順）</h2>

          {ranking.length === 0 ? (
            <p className="mt-2 text-xs text-muted">
              データなし — シグナル生成バッチを実行してください。
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {ranking.map((r, idx) => (
                <Link
                  key={r.id}
                  href={`/stores/${r.id}`}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.07]"
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    idx === 0 ? "bg-amber-500/20 text-amber-300" :
                    idx === 1 ? "bg-white/10 text-white/60" :
                    idx === 2 ? "bg-orange-800/20 text-orange-300" :
                    "bg-white/[0.06] text-white/40"
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{r.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <ScoreBadge value={r.avg_reward} label="還元" />
                      <ScoreBadge value={r.avg_traffic} label="活性" />
                      <ScoreBadge value={r.avg_high_chance} label="上振" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 免責 */}
        <p className="mt-10 text-[10px] leading-relaxed text-white/20">
          ※
          本サイトは公開情報等を基にした独自集計の参考情報であり、結果を保証するものではありません。
        </p>
      </div>
    </main>
  );
}
