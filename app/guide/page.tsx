import Link from "next/link";

export const metadata = {
  title: "使い方 | スロカスくん",
  description:
    "スロカスくんの使い方を解説。機種選択から設定判別・収支記録まで、初めての方でもかんたんに始められます。",
};

export default function GuidePage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <header className="space-y-2">
        <h1 className="text-lg font-bold text-white">使い方</h1>
        <p className="text-sm text-muted">
          初めての方は、まず「機種を選ぶ → 設定判別」の順で進めるのがおすすめです。
        </p>
        <div className="flex gap-2 pt-1">
          <Link
            href="/machines"
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            機種一覧へ
          </Link>
          <Link
            href="/judge"
            className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-orange-500/20"
          >
            設定判別へ
          </Link>
        </div>
      </header>

      <section className="mt-5 space-y-4">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-sm">
          <h2 className="text-base font-bold text-white">基本の流れ</h2>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-base font-semibold text-white">① 機種を選ぶ</p>
              <p className="mt-2 text-sm text-muted">
                <Link href="/machines" className="underline underline-offset-2 hover:text-white transition">
                  機種一覧
                </Link>
                から、メーカー → 機種を選択します。
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-base font-semibold text-white">② 設定判別</p>
              <p className="mt-2 text-sm text-muted">
                総ゲーム数 / BIG / REG（機種によっては小役）を入力して、近い設定を表示します。
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-base font-semibold text-white">③ サブスク会員限定</p>
              <p className="mt-2 text-sm text-muted">
                サブスク会員になると、会員限定の機能（コミュニティ / 広告の非表示 など）が使えます。
                <br />
                登録は{" "}
                <Link href="/subscribe" className="underline underline-offset-2 hover:text-white transition">
                  /subscribe
                </Link>
                から。
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

        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-sm">
          <h2 className="text-base font-bold text-white">よく使うページ</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
            <li>
              <Link href="/judge" className="underline underline-offset-2 hover:text-white transition">
                設定判別
              </Link>
              ：判別ツール本体
            </li>
            <li>
              <Link href="/machines" className="underline underline-offset-2 hover:text-white transition">
                機種一覧
              </Link>
              ：メーカー別に機種を探す
            </li>
            <li>
              <Link href="/about" className="underline underline-offset-2 hover:text-white transition">
                運営情報
              </Link>
              ：サイトについて
            </li>
          </ul>
        </section>

        <div className="pt-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted underline underline-offset-2 hover:text-white transition"
          >
            ← トップへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
