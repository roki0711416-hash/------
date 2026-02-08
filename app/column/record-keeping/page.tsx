import Link from "next/link";

export const metadata = {
  title: "収支管理の意味 ── 記録をつけるメリットと方法 | スロカスくん",
  description:
    "パチスロの収支管理がなぜ重要なのか。記録をつけることで得られるメリットと、具体的な記録項目を解説します。",
};

export default function RecordKeepingPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-4">
      <nav aria-label="パンくず" className="text-xs text-neutral-500">
        <Link href="/" className="underline underline-offset-2">トップ</Link>
        <span className="mx-1">/</span>
        <Link href="/column" className="underline underline-offset-2">コラム一覧</Link>
        <span className="mx-1">/</span>
        <span>収支管理の意味</span>
      </nav>

      <article className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h1 className="text-lg font-semibold">収支管理の意味 ── 記録をつけるメリットと方法</h1>
        <p className="mt-1 text-xs text-neutral-500">公開日: 2026-02-08 ／ 最終更新: 2026-02-08</p>

        <div className="mt-5 space-y-5 text-sm leading-7 text-neutral-700">
          <section>
            <h2 className="font-semibold text-neutral-900">なぜ記録をつけるのか</h2>
            <p className="mt-2">
              パチスロの実戦を振り返ろうとしたとき、
              多くの人は「なんとなく勝った」「最近は負けが多い気がする」という曖昧な記憶に頼りがちです。
              しかし、人間の記憶には偏りがあり、特に大勝ちや大負けの印象が強く残る傾向があります。
            </p>
            <p className="mt-2">
              収支記録をつけることで、こうした「感覚のズレ」を客観的なデータで補正できます。
              「思ったほど勝っていなかった」「特定の機種で負けが集中している」など、
              記録しなければ気づけない傾向が見えてくることがあります。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900">記録すべき項目</h2>
            <p className="mt-2">
              最低限記録しておくと役立つ項目は以下のとおりです。
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><span className="font-semibold">日付</span> ── いつ打ったか</li>
              <li><span className="font-semibold">機種名</span> ── 何を打ったか</li>
              <li><span className="font-semibold">投資額</span> ── いくら使ったか</li>
              <li><span className="font-semibold">回収額</span> ── いくら戻ったか</li>
              <li><span className="font-semibold">差枚（収支）</span> ── プラスかマイナスか</li>
              <li><span className="font-semibold">総ゲーム数</span> ── どれくらい回したか</li>
              <li><span className="font-semibold">メモ</span> ── 設定推測や反省点など</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900">記録から「振り返り」へつなげる</h2>
            <p className="mt-2">
              記録をつけるだけでは十分ではありません。大切なのは、記録をもとに「振り返り」を行うことです。
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>特定の機種に偏った投資をしていないか</li>
              <li>判断を誤ったケース（粘りすぎ・見切り早すぎ）はないか</li>
              <li>勝っている日と負けている日に共通するパターンはあるか</li>
            </ul>
            <p className="mt-2">
              こうした振り返りを繰り返すことで、自分の立ち回りの癖や改善点が少しずつ見えてきます。
              「次に同じ状況になったらどうするか」を考える材料として、記録は非常に有効です。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900">記録を続けるコツ</h2>
            <p className="mt-2">
              収支管理が続かない最大の理由は「面倒くさい」ことです。
              対策として、以下の工夫をおすすめします。
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>入力項目を最小限に絞る（完璧を求めない）</li>
              <li>打った直後、記憶が新しいうちに入力する</li>
              <li>スマートフォンで手軽に入力できるツールを使う</li>
            </ul>
            <p className="mt-2">
              スロカスくんの{" "}
              <Link href="/record" className="underline underline-offset-2">
                収支表
              </Link>{" "}
              機能では、スマートフォンからでも簡単に実戦記録を入力・管理できます。
              シンプルな入力画面で、打った直後にサッと記録を残せる設計です。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900">まとめ</h2>
            <p className="mt-2">
              収支管理は、パチスロを「なんとなく」ではなく「根拠を持って」楽しむための第一歩です。
              勝ち方を教えるものではありませんが、自分の遊技を客観的に把握し、
              判断の精度を少しずつ高めていくための基盤となります。
              まずは簡単な項目から記録を始めてみてください。
            </p>
          </section>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-semibold text-amber-800">⚠ ご注意</p>
            <p className="mt-1 text-xs text-amber-700">
              本記事は娯楽・参考情報としての解説であり、遊技の勝敗や収支を保証するものではありません。
              遊技に関する最終的な判断はご自身の責任で行ってください。
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/column"
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-900"
          >
            ← コラム一覧
          </Link>
          <Link
            href="/record"
            className="rounded-xl bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white"
          >
            収支表へ →
          </Link>
        </div>
      </article>
    </main>
  );
}
