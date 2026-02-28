import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  getStoreById,
  getRecentSignals,
  getDailySummaries,
  getDailyMachines,
  type StoreDailySignalRow,
  type StoreDailySummaryRow,
} from "@/lib/storeAnalytics";
import { getPrefectureBySlug } from "@/lib/prefectures";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://slokasukun.com";

/* ── メタデータ ── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const store = await getStoreById(id);
  const title = store
    ? `${store.name}のホール分析｜スロカスくん`
    : "ホール分析｜スロカスくん";
  return {
    title,
    description: store
      ? `${store.name}（${store.city ?? store.prefecture}）の差枚推移・機種別傾向を独自分析。`
      : "パチンコ・スロットホールの傾向を独自分析。",
    alternates: { canonical: `${BASE_URL}/stores/${id}` },
  };
}

/* ── ゲージ ── */
function Gauge({ label, value }: { label: string; value: number }) {
  let barColor = "bg-white/20";
  if (value >= 70) barColor = "bg-emerald-500";
  else if (value >= 50) barColor = "bg-amber-500";
  else if (value >= 30) barColor = "bg-white/30";

  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs font-medium text-muted">{label}</span>
      <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all ${barColor}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-bold text-white">{value}</span>
    </div>
  );
}

/* ── 平均値計算 ── */
function computeAvg(
  signals: StoreDailySignalRow[],
  key: keyof Pick<StoreDailySignalRow, "traffic_index" | "swing_index" | "reward_index" | "high_chance_index">,
) {
  if (signals.length === 0) return 0;
  const sum = signals.reduce((acc, s) => acc + Number(s[key]), 0);
  return Math.round(sum / signals.length);
}

/* ── 差枚フォーマッタ ── */
function formatDiff(v: number) {
  if (v > 0) return `+${v.toLocaleString()}`;
  return v.toLocaleString();
}
function diffColor(v: number) {
  if (v >= 3000) return "text-emerald-300";
  if (v > 0) return "text-emerald-400/70";
  if (v === 0) return "text-white/50";
  if (v > -3000) return "text-red-400/70";
  return "text-red-400";
}

/* ── TOP機種チップ ── */
function TopMachineChips({
  machines,
}: {
  machines: StoreDailySummaryRow["top_machines"];
}) {
  if (!machines || machines.length === 0) {
    return <span className="text-[10px] text-white/20">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {machines.map((m) => (
        <span
          key={m.name}
          className={`rounded px-1.5 py-0.5 text-[10px] ${
            m.diff >= 0
              ? "bg-emerald-500/10 text-emerald-300/80"
              : "bg-red-500/10 text-red-300/80"
          }`}
        >
          {m.name.length > 6 ? m.name.slice(0, 6) + "…" : m.name}
        </span>
      ))}
    </div>
  );
}

/* ── ページ ── */
export const dynamic = "force-dynamic";

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const store = await getStoreById(id);
  if (!store) notFound();

  // 重複店舗 → 代表店舗にリダイレクト
  if (store.canonical_store_id) {
    redirect(`/stores/${store.canonical_store_id}`);
  }

  // データ取得を並列化
  const [signals7, signals30, dailySummaries] = await Promise.all([
    getRecentSignals(id, 7),
    getRecentSignals(id, 30),
    getDailySummaries(id, 30),
  ]);

  // 直近14日分のサマリーを表示用に切り出す
  const recentSummaries = dailySummaries.slice(0, 14);

  // 強い日ランキング TOP5 (total_diff 高い順)
  const strongDays = [...dailySummaries]
    .sort((a, b) => b.total_diff - a.total_diff)
    .slice(0, 5);

  // 最新日の機種データ
  const latestDate = recentSummaries[0]?.date?.slice(0, 10) ?? null;
  const latestMachines = latestDate ? await getDailyMachines(id, latestDate) : [];

  const pref = getPrefectureBySlug(store.prefecture);
  const prefSlug = store.prefecture;

  // 直近7日の平均
  const avg7 = {
    traffic: computeAvg(signals7, "traffic_index"),
    swing: computeAvg(signals7, "swing_index"),
    reward: computeAvg(signals7, "reward_index"),
    highChance: computeAvg(signals7, "high_chance_index"),
  };

  // 直近30日の平均
  const avg30 = {
    traffic: computeAvg(signals30, "traffic_index"),
    swing: computeAvg(signals30, "swing_index"),
    reward: computeAvg(signals30, "reward_index"),
    highChance: computeAvg(signals30, "high_chance_index"),
  };

  // 7日差枚合計
  const sum7Diff = recentSummaries
    .slice(0, 7)
    .reduce((s, r) => s + r.total_diff, 0);

  // 30日平均差枚
  const avg30Diff =
    dailySummaries.length > 0
      ? Math.round(
          dailySummaries.reduce((s, r) => s + r.total_diff, 0) /
            dailySummaries.length,
        )
      : 0;

  // ベストデイ
  const bestDay = strongDays[0] ?? null;

  const mapsUrl =
    store.lat && store.lng
      ? `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`
      : null;

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        {/* パンくず */}
        <nav className="text-xs text-muted">
          <Link href="/prefectures" className="hover:underline hover:text-white transition">
            全国
          </Link>{" "}
          &gt;{" "}
          <Link
            href={`/prefectures/${prefSlug}`}
            className="hover:underline hover:text-white transition"
          >
            {pref?.name ?? prefSlug}
          </Link>{" "}
          &gt;{" "}
          <Link
            href={`/prefectures/${prefSlug}/stores`}
            className="hover:underline hover:text-white transition"
          >
            店舗一覧
          </Link>{" "}
          &gt; <span className="text-white/80">{store.name}</span>
        </nav>

        {/* ── ヘッダー ── */}
        <h1 className="mt-3 text-xl font-black text-white">{store.name}</h1>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
          <span>
            {pref?.name} {store.city} {store.address}
          </span>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/40 transition hover:bg-white/[0.12] hover:text-white/70"
            >
              🗺 地図
            </a>
          )}
        </div>

        {/* ── サマリーカード ── */}
        {dailySummaries.length > 0 && (
          <section className="mt-6 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center rounded-xl border border-white/[0.08] bg-white/[0.04] py-3">
              <span className="text-[10px] text-muted">7日差枚合計</span>
              <span className={`mt-1 text-lg font-bold ${diffColor(sum7Diff)}`}>
                {formatDiff(sum7Diff)}
              </span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-white/[0.08] bg-white/[0.04] py-3">
              <span className="text-[10px] text-muted">30日平均差枚</span>
              <span className={`mt-1 text-lg font-bold ${diffColor(avg30Diff)}`}>
                {formatDiff(avg30Diff)}
              </span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-white/[0.08] bg-white/[0.04] py-3">
              <span className="text-[10px] text-muted">ベストデイ</span>
              {bestDay ? (
                <>
                  <span className={`mt-1 text-lg font-bold ${diffColor(bestDay.total_diff)}`}>
                    {formatDiff(bestDay.total_diff)}
                  </span>
                  <span className="text-[10px] text-white/30">
                    {bestDay.date.slice(5, 10)}
                  </span>
                </>
              ) : (
                <span className="mt-1 text-sm text-white/30">—</span>
              )}
            </div>
          </section>
        )}

        {/* ── ゲージ（直近7日平均） ── */}
        <section className="mt-6">
          <h2 className="text-base font-bold text-white">ホール傾向分析（直近7日平均）</h2>
          {signals7.length === 0 ? (
            <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              🔧 分析データがまだありません。シグナル生成バッチを実行してください。
            </div>
          ) : (
            <div className="mt-3 space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-sm">
              <Gauge label="活性" value={avg7.traffic} />
              <Gauge label="荒さ" value={avg7.swing} />
              <Gauge label="還元傾向" value={avg7.reward} />
              <Gauge label="上振れ期待" value={avg7.highChance} />
            </div>
          )}
        </section>

        {/* ── 30日平均 ── */}
        {signals30.length > 0 && (
          <section className="mt-6">
            <h2 className="text-base font-bold text-white">30日平均</h2>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {([
                { label: "活性", value: avg30.traffic },
                { label: "荒さ", value: avg30.swing },
                { label: "還元", value: avg30.reward },
                { label: "上振", value: avg30.highChance },
              ] as const).map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center rounded-xl border border-white/[0.08] bg-white/[0.04] py-3"
                >
                  <span className="text-[10px] text-muted">{item.label}</span>
                  <span className="mt-1 text-lg font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 差枚推移テーブル（直近14日） ── */}
        {recentSummaries.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-bold text-white">差枚推移（直近14日）</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.04]">
                    <th className="px-3 py-2 text-left font-medium text-muted">日付</th>
                    <th className="px-3 py-2 text-right font-medium text-muted">合計差枚</th>
                    <th className="px-3 py-2 text-right font-medium text-muted">平均差枚</th>
                    <th className="px-3 py-2 text-left font-medium text-muted">TOP機種</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSummaries.map((s) => (
                    <tr
                      key={s.date}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition"
                    >
                      <td className="px-3 py-2 text-white/60">{s.date.slice(5, 10)}</td>
                      <td className={`px-3 py-2 text-right font-bold ${diffColor(s.total_diff)}`}>
                        {formatDiff(s.total_diff)}
                      </td>
                      <td className={`px-3 py-2 text-right ${diffColor(s.avg_diff)}`}>
                        {formatDiff(s.avg_diff)}
                      </td>
                      <td className="px-3 py-2">
                        <TopMachineChips machines={s.top_machines} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── 強い日ランキング TOP5 ── */}
        {strongDays.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-bold text-white">強い日ランキング TOP5（30日）</h2>
            <div className="mt-3 space-y-2">
              {strongDays.map((s, idx) => (
                <div
                  key={s.date}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      idx === 0
                        ? "bg-amber-500/20 text-amber-300"
                        : idx === 1
                          ? "bg-white/10 text-white/60"
                          : idx === 2
                            ? "bg-orange-800/20 text-orange-300"
                            : "bg-white/[0.06] text-white/40"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="w-16 text-xs text-white/60">{s.date.slice(5, 10)}</span>
                  <span className={`text-sm font-bold ${diffColor(s.total_diff)}`}>
                    {formatDiff(s.total_diff)}
                  </span>
                  <div className="ml-auto">
                    <TopMachineChips machines={s.top_machines} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 機種別内訳（最新日） ── */}
        {latestMachines.length > 0 && latestDate && (
          <section className="mt-8">
            <h2 className="text-base font-bold text-white">
              機種別内訳（{latestDate.slice(5, 10)}）
            </h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.04]">
                    <th className="px-3 py-2 text-left font-medium text-muted">機種名</th>
                    <th className="px-3 py-2 text-right font-medium text-muted">台数</th>
                    <th className="px-3 py-2 text-right font-medium text-muted">合計差枚</th>
                    <th className="px-3 py-2 text-right font-medium text-muted">平均差枚</th>
                  </tr>
                </thead>
                <tbody>
                  {latestMachines.map((m) => (
                    <tr
                      key={m.machine_name}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition"
                    >
                      <td className="px-3 py-2 text-white/80 truncate max-w-[140px]">
                        {m.machine_name}
                      </td>
                      <td className="px-3 py-2 text-right text-white/50">
                        {m.machine_count ?? "—"}
                      </td>
                      <td className={`px-3 py-2 text-right font-bold ${diffColor(m.diff_sum)}`}>
                        {formatDiff(m.diff_sum)}
                      </td>
                      <td className={`px-3 py-2 text-right ${diffColor(m.diff_avg)}`}>
                        {formatDiff(m.diff_avg)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── 日別スコア履歴 ── */}
        <section className="mt-8">
          <h2 className="text-base font-bold text-white">日別スコア履歴</h2>
          {signals7.length === 0 ? (
            <p className="mt-1 text-xs text-muted">データなし</p>
          ) : (
            <div className="mt-3 space-y-2">
              {signals7.map((sig) => (
                <div
                  key={sig.id}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2"
                >
                  <span className="w-20 text-xs font-medium text-muted">
                    {sig.date.slice(0, 10)}
                  </span>
                  <div className="flex flex-1 flex-wrap gap-1">
                    <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/60">
                      活{sig.traffic_index}
                    </span>
                    <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/60">
                      荒{sig.swing_index}
                    </span>
                    <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/60">
                      還{sig.reward_index}
                    </span>
                    <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/60">
                      上{sig.high_chance_index}
                    </span>
                  </div>
                  {sig.note && (
                    <span className="text-[10px] text-muted truncate max-w-[120px]" title={sig.note}>
                      {sig.note}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/prefectures/${prefSlug}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
          >
            ← {pref?.name ?? "県ページ"}へ
          </Link>
          <Link
            href="/lp"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            アプリで判別する
          </Link>
        </div>

        {/* 免責 */}
        <p className="mt-10 text-[10px] leading-relaxed text-white/20">
          ※
          本サイトは公開情報等を基にした独自集計の参考情報であり、結果を保証するものではありません。
        </p>
      </div>
    </main>
  );
}
