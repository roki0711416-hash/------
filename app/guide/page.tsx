import Link from "next/link";

export const metadata = {
  title: "使い方 | スロカスくん",
};

export default function GuidePage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <header className="space-y-2">
        <h1 className="text-lg font-semibold">使い方</h1>
        <p className="text-sm text-neutral-600">
          初めての方は、まず「機種を選ぶ → 設定判別」の順で進めるのがおすすめです。
        </p>
        <div className="flex gap-2 pt-1">
          <Link
            href="/machines"
            className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-900"
          >
            機種一覧へ
          </Link>
          <Link
            href="/judge"
            className="flex-1 rounded-xl bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white"
          >
            設定判別へ
          </Link>
        </div>
      </header>

      <section className="mt-5 space-y-4">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-base font-semibold">基本の流れ</h2>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-base font-semibold">① 機種を選ぶ</p>
              <p className="mt-2 text-sm text-neutral-700">
                <Link href="/machines" className="underline underline-offset-2">
                  機種一覧
                </Link>
                から、メーカー → 機種を選択します。
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-base font-semibold">② 設定判別</p>
              <p className="mt-2 text-sm text-neutral-700">
                総ゲーム数 / BIG / REG（機種によっては小役）を入力して、近い設定を表示します。
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-base font-semibold">③ サブスク会員限定</p>
              <p className="mt-2 text-sm text-neutral-700">
                サブスク会員になると、会員限定の機能（コミュニティ / 広告の非表示 など）が使えます。
                <br />
                登録は{" "}
                <Link href="/subscribe" className="underline underline-offset-2">
                  /subscribe
                </Link>
                から。
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

        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-base font-semibold">よく使うページ</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-700">
            <li>
              <Link href="/judge" className="underline underline-offset-2">
                設定判別
              </Link>
              ：判別ツール本体
            </li>
            <li>
              <Link href="/machines" className="underline underline-offset-2">
                機種一覧
              </Link>
              ：メーカー別に機種を探す
            </li>
            <li>
              <Link href="/about" className="underline underline-offset-2">
                運営情報
              </Link>
              ：サイトについて
            </li>
          </ul>
        </section>

        <div className="pt-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 underline underline-offset-2"
          >
            ← トップへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
