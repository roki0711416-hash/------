import Link from "next/link";
import MachinePickerPanel from "../../components/MachinePickerPanel";
import MachineOddsTable from "../../components/MachineOddsTable";
import ToolJudgeAndReviews from "../../components/ToolJudgeAndReviews";
import { getMachineById, getMachinesData } from "../../lib/machines";
import { IS_PREMIUM_FREE_OPEN } from "../../lib/premium";

type SearchParams = Record<string, string | string[] | undefined>;

function firstString(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ToolPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const machines = await getMachinesData();
  const selectedMachineId = firstString(sp?.machine);
  const selectedMachine = selectedMachineId
    ? await getMachineById(selectedMachineId)
    : null;

  const selectedMaker =
    firstString(sp?.maker) ?? selectedMachine?.maker ?? undefined;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4">
      {/* ── top bar ── */}
      <header className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-base font-bold text-white md:text-lg">設定判別ツール</h1>
        <Link
          href="/"
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
        >
          ← トップ
        </Link>
      </header>

      {/* ── 2-column layout ── */}
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* LEFT: machine picker */}
        <MachinePickerPanel
          makers={machines.makers}
          selectedMaker={selectedMaker}
          selectedMachine={selectedMachineId}
        />

        {/* RIGHT: main content */}
        <div className="min-w-0 space-y-4">
          {/* selected machine badge */}
          {selectedMachine ? (
            <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3">
              <p className="text-sm text-white/70">選択中</p>
              <p className="mt-0.5 text-base font-bold text-white">
                {selectedMachine.name}
                {selectedMachine.maker ? (
                  <span className="ml-2 text-sm font-normal text-white/60">
                    ({selectedMachine.maker})
                  </span>
                ) : null}
              </p>
            </div>
          ) : null}

          {/* machine data + judge form */}
          {selectedMachine ? (
            <>
              <MachineOddsTable machine={selectedMachine} />
              {selectedMachine.toolMode !== "odds-only" ? (
                <ToolJudgeAndReviews machine={selectedMachine} isPremium={IS_PREMIUM_FREE_OPEN} />
              ) : null}
            </>
          ) : null}

          {/* when no machine selected: getting started */}
          {!selectedMachine ? (
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
              <h2 className="text-lg font-bold text-white">使い方</h2>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <p className="text-base font-semibold text-white">① 機種を選ぶ</p>
                  <p className="mt-2 text-sm text-muted">
                    <span className="md:hidden">上の「機種を選択」ボタンから、メーカー → 機種を選びます。</span>
                    <span className="hidden md:inline">左パネルのメーカー → 機種を選択します。</span>
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <p className="text-base font-semibold text-white">② 設定判別</p>
                  <p className="mt-2 text-sm text-muted">
                    総ゲーム数/BIG/REG（機種によっては小役）を入力して、近い設定を表示します。
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <p className="text-base font-semibold text-white">③ 結果を確認</p>
                  <p className="mt-2 text-sm text-muted">
                    入力内容に基づいた設定推測結果が表示されます。判断材料の整理にご活用ください。
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <p className="text-base font-semibold text-white">④ ユーザー口コミ</p>
                  <p className="mt-2 text-sm text-muted">
                    機種を選ぶと、下にユーザー口コミが表示されます（投稿にはユーザーネーム設定が必要です）。
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {/* collapsible help / about */}
          <details className="group rounded-2xl border border-white/[0.08] bg-white/[0.04]">
            <summary className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white/80">
                  ❓ 設定判別ツールについて
                </span>
                <span className="text-xs text-white/40 transition group-open:rotate-180">
                  ▾
                </span>
              </div>
            </summary>

            <div className="space-y-3 border-t border-white/[0.06] px-5 pb-5 pt-4 text-sm leading-7 text-muted">
              <p>
                スロカスくんは、パチスロの設定判別をサポートする分析ツールです。
                基本的な設定判別は無料で利用でき、総ゲーム数やBIG/REGなどの入力から設定傾向を確認できます。
              </p>

              <div>
                <h3 className="font-semibold text-white">使い方</h3>
                <ol className="mt-1 list-decimal space-y-1 pl-5">
                  <li>機種を選択します</li>
                  <li>総ゲーム数・BIG回数・REG回数などを入力します</li>
                  <li>入力内容に基づいた設定推測結果が表示されます</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-white">表示結果について</h3>
                <p className="mt-1">
                  表示される推測結果は、入力されたデータと機種ごとの理論値を比較した参考情報です。
                  実際の設定を確定するものではなく、遊技の勝敗や収支を保証するものでもありません。
                  判断材料の整理・可視化の補助ツールとして、娯楽の範囲でご利用ください。
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-xs font-semibold text-amber-300">⚠ ご注意</p>
                <p className="mt-1 text-xs text-amber-300/80">
                  本ツールの結果は娯楽・参考情報であり、遊技の勝敗や収支を保証するものではありません。
                  遊技に関する最終的な判断はご自身の責任で行ってください。
                </p>
              </div>
            </div>
          </details>
        </div>
      </div>
    </main>
  );
}
