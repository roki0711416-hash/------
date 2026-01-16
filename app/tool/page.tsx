import Link from "next/link";
import SideMenu from "../../components/SideMenu";
import MachineOddsTable from "../../components/MachineOddsTable";
import ToolJudgeAndReviews from "../../components/ToolJudgeAndReviews";
import { getMachineById, getMachinesData } from "../../lib/machines";
import { getIsPremiumFromCookies } from "../../lib/premium";

type SearchParams = Record<string, string | string[] | undefined>;

function firstString(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ToolPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const isPremiumPreview = process.env.SLOKASU_PREMIUM_PREVIEW === "1";
  const isPremium = isPremiumPreview || (await getIsPremiumFromCookies());

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
      <header className="mb-5">
        <div className="flex items-center justify-between">
          <SideMenu
            makers={machines.makers}
            selectedMaker={selectedMaker}
            selectedMachine={selectedMachineId}
          />
          <p className="text-sm font-semibold text-neutral-700">
            機種選択・判別ツール
          </p>
          <Link
            href="/"
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
          >
            ← トップ
          </Link>
        </div>
        <p className="mt-2 text-sm text-neutral-600">機種は左メニューから選択</p>
        {selectedMachine ? (
          <p className="mt-1 text-sm text-neutral-700">
            選択中：
            <span className="font-semibold">
              {selectedMachine.name}
              {selectedMachine.maker ? `（${selectedMachine.maker}）` : ""}
            </span>
          </p>
        ) : null}
      </header>

      <div className="space-y-4">
        {selectedMachine ? (
          <>
            <MachineOddsTable machine={selectedMachine} />
            {selectedMachine.toolMode !== "odds-only" ? (
              <ToolJudgeAndReviews machine={selectedMachine} isPremium={isPremium} />
            ) : null}
          </>
        ) : null}

        {!selectedMachine ? (
          <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h1 className="text-lg font-semibold">このサイトの使い方</h1>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-base font-semibold">① 機種を選ぶ</p>
                <p className="mt-2 text-sm text-neutral-700">
                  左上の「≡」から機種一覧を開いて、メーカー → 機種を選択します。
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-base font-semibold">② 設定判別</p>
                <p className="mt-2 text-sm text-neutral-700">
                  ・総ゲーム数/BIG/REG (機種によっては小役)を入力して、近い設定を表示します。
                  <br />
                  ・現状のグラフを読み取り500G先の期待値をAI予想します。
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-base font-semibold">③ サブスク会員限定</p>
                <p className="mt-2 text-sm text-neutral-700">
                  サブスク会員になると、会員限定の機能（コミュニティ/広告の非表示 など）が使えます。
                  <br />
                  登録は <Link href="/subscribe" className="underline underline-offset-2">/subscribe</Link> から。
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-base font-semibold">④ ユーザー口コミ</p>
                <p className="mt-2 text-sm text-neutral-700">
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
