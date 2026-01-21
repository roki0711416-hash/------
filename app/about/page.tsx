import Link from "next/link";

export const metadata = {
  title: "運営情報 | スロット設定判別ツール",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h1 className="text-lg font-semibold">運営情報</h1>

        <div className="mt-4 space-y-4 text-sm text-neutral-700">
          <div>
            <h2 className="font-semibold">サイトについて</h2>
            <p className="mt-2 whitespace-pre-line">
              {`本サイト「スロカスくん」は、
設定示唆が出ず、勝てるか負けるか分からない状況で打つことに不安や怖さを感じた経験から作りました。

「できるだけ収支をマイナスにしたくない」「少しでも負けにくい判断をしたい」
そんな思いから、入力したデータをもとに判断材料を整理し、設定推測を補助するツールとして本サイトを運営しています。

なお、本サイトで表示される推測結果や数値は、入力データやモデルに基づく参考情報であり、実際の設定や遊技結果を保証するものではありません。
最終的な判断は、ご自身の責任にてお願いいたします。`}
            </p>
          </div>

          <div>
            <h2 className="font-semibold">運営者</h2>
            <p className="mt-2">三日坊主</p>
          </div>

          <div>
            <h2 className="font-semibold">連絡先</h2>
            <p className="mt-2">
              <Link
                href="/contact"
                className="text-neutral-700 underline underline-offset-2"
              >
                お問い合わせページ
              </Link>
              をご利用ください。
            </p>
          </div>

          <p className="text-xs text-neutral-500">最終更新日: 2026-01-13</p>
        </div>
      </section>
    </main>
  );
}
