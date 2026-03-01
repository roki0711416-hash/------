import Link from "next/link";

export const metadata = {
  title: "確率の読み方入門 ── ボーナス確率表の見方 | スロカスくん",
  description:
    "パチスロのボーナス確率表の読み方を初心者向けに解説。合算確率・単独確率の違いや設定差の見方を整理します。",
};

export default function HowToReadProbabilityPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-4">
      <nav aria-label="パンくず" className="text-xs text-white/40">
        <Link href="/" className="underline underline-offset-2">トップ</Link>
        <span className="mx-1">/</span>
        <Link href="/column" className="underline underline-offset-2">コラム一覧</Link>
        <span className="mx-1">/</span>
        <span>確率の読み方入門</span>
      </nav>

      <article className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
        <h1 className="text-lg font-semibold">確率の読み方入門 ── ボーナス確率表の見方</h1>
        <p className="mt-1 text-xs text-white/40">公開日: 2026-02-08 ／ 最終更新: 2026-02-08</p>

        <div className="mt-5 space-y-5 text-sm leading-7 text-muted">
          <section>
            <h2 className="font-semibold text-white">確率表は何を示しているのか</h2>
            <p className="mt-2">
              パチスロの機種情報では、設定ごとのボーナス確率が表形式で公開されていることがあります。
              たとえば「BIG 1/280」「REG 1/340」のように記載されている数字は、
              「平均して○○ゲームに1回当選する」という意味の確率です。
            </p>
            <p className="mt-2">
              この数字が設定間で異なる場合、それが「設定差」と呼ばれるものです。
              設定差が大きい項目ほど、判別の手がかりとして重要度が高い傾向にあります。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-white">合算確率と単独確率の違い</h2>
            <p className="mt-2">
              「合算確率」はBIG＋REGをまとめた確率で、総合的なボーナス出現率を示します。
              一方、「単独確率」はBIG・REGそれぞれ個別の確率です。
            </p>
            <p className="mt-2">
              機種によっては、BIG確率に設定差がほとんどなく、REG確率に大きな差があるケースがあります。
              このような場合、合算だけを見ていると設定差を見落とすことがあるため、
              BIG・REGを分けて確認することが重要です。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-white">分母が大きい確率ほどブレやすい</h2>
            <p className="mt-2">
              確率の分母が大きい（例：1/400 など）ほど、少ないゲーム数ではブレが大きくなります。
              逆に分母が小さい確率（例：1/8 のぶどう確率など）は、比較的少ないサンプルでも傾向が見えやすいとされています。
            </p>
            <p className="mt-2">
              設定判別では、「ブレにくい指標」と「設定差が大きい指標」を組み合わせて総合的に見ることが基本です。
              ひとつの数値だけに注目するのではなく、複数の角度から確認する姿勢が大切です。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-white">確率の「良い」「悪い」は相対的</h2>
            <p className="mt-2">
              「ボーナスが1/250で引けているから高設定だ」と考えがちですが、
              それが本当に「良い」かどうかは、その機種の設定ごとの理論値と比較しなければわかりません。
              機種によっては、1/250 でも設定1相当の場合があります。
            </p>
            <p className="mt-2">
              したがって、確率を見る際は必ず「その機種の設定ごとの理論値」と照らし合わせて判断することが重要です。
              スロカスくんでは、機種ごとの設定別確率を一覧で確認し、自分の実戦データと比較できる機能を提供しています。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-white">まとめ</h2>
            <p className="mt-2">
              確率表は設定判別の基本となるデータですが、読み方を誤ると判断を間違える原因にもなります。
              合算と単独の違いを理解し、分母の大きさによるブレを意識し、
              必ず機種固有の理論値と比較する ── この3つを押さえるだけで、判断の精度は格段に上がります。
              ただし、どこまで行っても確率は確率であり、結果を約束するものではありません。
              娯楽として楽しむ前提で、冷静な分析を心がけてください。
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
            className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-center text-sm font-semibold text-white"
          >
            ← コラム一覧
          </Link>
          <Link
            href="/judge"
            className="rounded-xl bg-gradient-to-r from-cta-from to-cta-to px-4 py-3 text-center text-sm font-semibold text-white"
          >
            設定判別ツールへ →
          </Link>
        </div>
      </article>
    </main>
  );
}
