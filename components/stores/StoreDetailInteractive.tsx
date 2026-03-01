"use client";

/**
 * 店舗詳細ページのインタラクティブ部分。
 * 日付クリックで機種一覧を切り替え。
 */

import { useState, useEffect, useCallback } from "react";

/* ── 型定義 ── */

interface SummaryRow {
  date: string;
  total_diff: number;
  avg_diff: number;
  top_machines: { name: string; diff: number; count: number }[] | null;
}

interface MachineRow {
  machine_name: string;
  diff_sum: number;
  diff_avg: number;
  machine_count: number | null;
}

/* ── ヘルパー ── */

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
  machines: SummaryRow["top_machines"];
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

/* ═══════════════════════════════════════════════════════
   サマリーカード（3枚）
   ═══════════════════════════════════════════════════════ */
export function DailySummaryCards({
  sum7Diff,
  avg30Diff,
  bestDay,
}: {
  sum7Diff: number;
  avg30Diff: number;
  bestDay: { date: string; total_diff: number } | null;
}) {
  return (
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
            <span
              className={`mt-1 text-lg font-bold ${diffColor(bestDay.total_diff)}`}
            >
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
  );
}

/* ═══════════════════════════════════════════════════════
   差枚推移テーブル + 機種一覧（インタラクティブ）
   ═══════════════════════════════════════════════════════ */
export function DailyTableWithMachines({
  storeId,
  recentSummaries,
  strongDays,
  initialMachines,
  initialDate,
}: {
  storeId: string;
  recentSummaries: SummaryRow[];
  strongDays: SummaryRow[];
  initialMachines: MachineRow[];
  initialDate: string | null;
}) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [machines, setMachines] = useState<MachineRow[]>(initialMachines);
  const [loading, setLoading] = useState(false);

  const loadMachines = useCallback(
    async (date: string) => {
      setSelectedDate(date);
      setLoading(true);
      try {
        const res = await fetch(`/api/stores/${storeId}/daily/${date}`);
        if (res.ok) {
          const data = await res.json();
          setMachines(data.machines ?? []);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    },
    [storeId],
  );

  // 初回マウント時に初期データがなければ最新日を取得
  useEffect(() => {
    if (initialDate && initialMachines.length === 0) {
      loadMachines(initialDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* ── 差枚推移テーブル（直近14日） ── */}
      {recentSummaries.length > 0 && (
        <section className="mt-8">
          <h2 className="text-base font-bold text-white">
            差枚推移（直近14日）
          </h2>
          <p className="mt-1 text-[10px] text-muted">
            日付をタップすると機種一覧を表示します
          </p>
          <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.04]">
                  <th className="px-3 py-2 text-left font-medium text-muted">
                    日付
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted">
                    合計差枚
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted">
                    平均差枚
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted">
                    TOP機種
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentSummaries.map((s) => {
                  const dateStr = s.date.slice(0, 10);
                  const isSelected = dateStr === selectedDate;
                  return (
                    <tr
                      key={s.date}
                      onClick={() => loadMachines(dateStr)}
                      className={`border-b border-white/[0.04] last:border-0 cursor-pointer transition ${
                        isSelected
                          ? "bg-orange-500/10 border-l-2 border-l-orange-400"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <td
                        className={`px-3 py-2 ${isSelected ? "text-orange-300 font-bold" : "text-white/60"}`}
                      >
                        {dateStr.slice(5, 10)}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-bold ${diffColor(s.total_diff)}`}
                      >
                        {formatDiff(s.total_diff)}
                      </td>
                      <td
                        className={`px-3 py-2 text-right ${diffColor(s.avg_diff)}`}
                      >
                        {formatDiff(s.avg_diff)}
                      </td>
                      <td className="px-3 py-2">
                        <TopMachineChips machines={s.top_machines} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── 強い日ランキング TOP5 ── */}
      {strongDays.length > 0 && (
        <section className="mt-8">
          <h2 className="text-base font-bold text-white">
            強い日ランキング TOP5（30日）
          </h2>
          <div className="mt-3 space-y-2">
            {strongDays.map((s, idx) => {
              const dateStr = s.date.slice(0, 10);
              return (
                <button
                  key={s.date}
                  onClick={() => loadMachines(dateStr)}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                    dateStr === selectedDate
                      ? "border-orange-400/30 bg-orange-500/10"
                      : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
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
                  <span className="w-16 text-xs text-white/60">
                    {dateStr.slice(5, 10)}
                  </span>
                  <span
                    className={`text-sm font-bold ${diffColor(s.total_diff)}`}
                  >
                    {formatDiff(s.total_diff)}
                  </span>
                  <div className="ml-auto">
                    <TopMachineChips machines={s.top_machines} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 機種別内訳 ── */}
      <section className="mt-8">
        <h2 className="text-base font-bold text-white">
          機種別内訳
          {selectedDate && (
            <span className="ml-2 text-sm font-normal text-orange-300">
              {selectedDate.slice(5, 10)}
            </span>
          )}
        </h2>

        {loading ? (
          <div className="mt-3 flex items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] py-8">
            <span className="text-xs text-white/40 animate-pulse">
              読み込み中...
            </span>
          </div>
        ) : machines.length === 0 ? (
          <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-center">
            <p className="text-xs text-amber-300">
              {selectedDate
                ? "この日の機種データがありません"
                : "上の表から日付を選択してください"}
            </p>
          </div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.04]">
                  <th className="px-3 py-2 text-left font-medium text-muted">
                    機種名
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted">
                    台数
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted">
                    合計差枚
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted">
                    平均差枚
                  </th>
                </tr>
              </thead>
              <tbody>
                {machines.map((m) => (
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
                    <td
                      className={`px-3 py-2 text-right font-bold ${diffColor(m.diff_sum)}`}
                    >
                      {formatDiff(m.diff_sum)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right ${diffColor(m.diff_avg)}`}
                    >
                      {formatDiff(m.diff_avg)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
