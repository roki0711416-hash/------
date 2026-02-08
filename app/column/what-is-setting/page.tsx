import Link from "next/link";

export const metadata = {
  title: "パチスロの「設定」とは？ 仕組みと基本を整理する | スロカスくん",
  description:
    "パチスロの設定1〜6の仕組み、出玉率との関係、設定判別の前提知識をわかりやすく解説します。娯楽としての遊技判断の参考に。",
};

export default function WhatIsSettingPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-4">
      <nav aria-label="パンくず" className="text-xs text-neutral-500">
        <Link href="/" className="underline underline-offset-2">トップ</Link>
        <span className="mx-1">/</span>
        <Link href="/column" className="underline underline-offset-2">コラム一覧</Link>
        <span className="mx-1">/</span>
        <span>パチスロの「設定」とは？</span>
      </nav>

      <article className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h1 className="text-lg font-semibold">パチスロの「設定」とは？ 仕組みと基本を整理する</h1>
        <p className="mt-1 text-xs text-neutral-500">公開日: 2026-02-08 ／ 最終更新: 2026-02-08</p>

        <div className="mt-5 space-y-5 text-sm leading-7 text-neutral-700">
          <section>
            <h2 className="font-semibold text-neutral-900">設定とは何か</h2>
            <p className="mt-2">
              パチスロ機には「設定」と呼ばれる段階（多くの機種で1〜6）が内部的に存在します。
              設定ごとにボーナスや小役の当選確率が異なり、一般的に数字が大きいほど出玉性能が優遇される傾向にあります。
              ただし、設定が高いからといって「必ず出る」わけではなく、あくまで確率上の期待値が変わるという仕組みです。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900">出玉率（機械割）との関係</h2>
            <p className="mt-2">
              設定ごとの性能差を数値で示す指標のひとつが「出玉率（機械割）」です。
              たとえば出玉率が100%を超える設定では、長期的に見てメダルが増える方向に傾きやすいとされています。
              ただし、これはあくまで理論上の数値であり、短期間の実戦では大きくブレることが一般的です。
              「出玉率が高い＝すぐに勝てる」ではない点に注意が必要です。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900">なぜ設定を推測するのか</h2>
            <p className="mt-2">
              パチスロを遊技する上で、現在打っている台の設定を知ることはできません。
              しかし、ボーナス確率や小役カウント、演出の出現傾向などを記録・整理することで、
              「どの設定に近い挙動か」を推測する手がかりを得ることは可能です。
              この行為が「設定判別」と呼ばれるものです。
            </p>
            <p className="mt-2">
              重要なのは、設定判別は確定的な答えを出すものではないということです。
              サンプル数が少ない序盤ほどブレが大きく、十分なデータが集まっても「傾向を読む」域を出ません。
              あくまで遊技中の判断材料を整理するための手法として捉えるのが適切です。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900">設定判別で陥りやすい誤解</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <span className="font-semibold">「高設定＝勝てる」という思い込み</span>
                ── 高設定でも短期間では大きなマイナスになることがあります。確率は長期的な傾向を示すものであり、1日の結果を約束するものではありません。
              </li>
              <li>
                <span className="font-semibold">「判別結果＝実際の設定」という誤認</span>
                ── ツールが表示する推測は、入力データに基づく計算結果です。実際に店舗がどの設定を使用しているかとは別の話です。
              </li>
              <li>
                <span className="font-semibold">「サンプルが少なくても判断できる」という油断</span>
                ── ゲーム数が少ないうちは確率のブレが非常に大きく、判別の精度は低くなります。判断を急がず、データを積み重ねることが大切です。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900">まとめ</h2>
            <p className="mt-2">
              パチスロの設定は、遊技体験に影響を与える重要な要素ですが、
              それを知ること自体が勝利を保証するわけではありません。
              設定判別はあくまで「考えを整理し、根拠ある判断を心がける」ための手法です。
              本サイトでは、この考え方をベースに、データ入力と可視化を通じて判断材料の整理をサポートしています。
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
            href="/judge"
            className="rounded-xl bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white"
          >
            設定判別ツールへ →
          </Link>
        </div>
      </article>
    </main>
  );
}
