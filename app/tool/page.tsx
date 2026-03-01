import Link from "next/link";
import SideMenu from "../../components/SideMenu";
import MachineOddsTable from "../../components/MachineOddsTable";
import ToolJudgeAndReviews from "../../components/ToolJudgeAndReviews";
import { getMachineById, getMachinesData } from "../../lib/machines";

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
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-4">
      <header className="mb-5 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <SideMenu
            makers={machines.makers}
            selectedMaker={selectedMaker}
            selectedMachine={selectedMachineId}
          />
          <p className="text-sm font-semibold text-white/80">
            機種選択・判別ツール
          </p>
          <Link
            href="/"
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
          >
            ← トップ
          </Link>
        </div>
        <p className="mt-2 text-sm text-muted">機種は左メニューから選択</p>
        {selectedMachine ? (
          <p className="mt-1 text-sm text-white/80">
            選択中：
            <span className="font-semibold text-white">
              {selectedMachine.name}
              {selectedMachine.maker ? `（${selectedMachine.maker}）` : ""}
            </span>
          </p>
        ) : null}
      </header>

      <div className="space-y-4">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-sm">
          <h1 className="text-lg font-bold text-white">設定判別ツールについて</h1>
          <p className="mt-2 text-sm text-muted">
            スロカスくんは、パチスロの設定判別をサポートする分析ツールです。
          </p>
          <p className="mt-2 text-sm text-muted">
            基本的な設定判別は無料で利用でき、総ゲーム数やBIG/REGなどの入力から設定傾向を確認できます。
          </p>
          <p className="mt-2 text-sm text-muted">
            基本的な設定判別は無料で利用できます。
          </p>

          <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
            <div>
              <h2 className="font-semibold text-white">使い方</h2>
              <ol className="mt-1 list-decimal space-y-1 pl-5">
                <li>左上のメニューから機種を選択します</li>
                <li>総ゲーム数・BIG回数・REG回数などを入力します</li>
                <li>入力内容に基づいた設定推測結果が表示されます</li>
              </ol>
            </div>

            <div>
              <h2 className="font-semibold text-white">表示結果について</h2>
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
        </section>

        {selectedMachine ? (
          <>
            <MachineOddsTable machine={selectedMachine} />
            {selectedMachine.toolMode !== "odds-only" ? (
              <ToolJudgeAndReviews machine={selectedMachine} isPremium={false} />
            ) : null}
          </>
        ) : null}

        {!selectedMachine ? (
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-sm">
            <h1 className="text-lg font-bold text-white">このサイトの使い方</h1>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                <p className="text-base font-semibold text-white">① 機種を選ぶ</p>
                <p className="mt-2 text-sm text-muted">
                  左上の「≡」から機種一覧を開いて、メーカー → 機種を選択します。
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                <p className="text-base font-semibold text-white">② 設定判別</p>
                <p className="mt-2 text-sm text-muted">
                  ・総ゲーム数/BIG/REG (機種によっては小役)を入力して、近い設定を表示します。
                  <br />
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

      </div>
    </main>
  );
}
