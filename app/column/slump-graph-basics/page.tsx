import Link from "next/link";

export const metadata = {
  title: "スランプグラフの見方と注意点 | スロカスくん",
  description:
    "パチスロのスランプグラフの正しい見方と、よくある誤解を解説します。グラフの形だけで設定を判断する危険性とは。",
};

export default function SlumpGraphBasicsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-4">
      <nav aria-label="パンくず" className="text-xs text-white/40">
        <Link href="/" className="underline underline-offset-2">トップ</Link>
        <span className="mx-1">/</span>
        <Link href="/column" className="underline underline-offset-2">コラム一覧</Link>
        <span className="mx-1">/</span>
        <span>スランプグラフの見方</span>
      </nav>

      <article className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
        <h1 className="text-lg font-semibold">スランプグラフの見方と注意点</h1>
        <p className="mt-1 text-xs text-white/40">公開日: 2026-02-08 ／ 最終更新: 2026-02-08</p>

        <div className="mt-5 space-y-5 text-sm leading-7 text-muted">
          <section>
            <h2 className="font-semibold text-white">スランプグラフとは</h2>
            <p className="mt-2">
              スランプグラフとは、パチスロの出玉推移を時系列で表したグラフのことです。
              多くのホールではデータランプに表示されており、その台が1日を通じてどのような出玉の動きをしたかを確認できます。
            </p>
            <p className="mt-2">
              グラフが右肩上がりなら出玉が増えている状態、右肩下がりなら減っている状態を示します。
              台選びの参考にする人も多く、設定推測の補助材料として活用されることもあります。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-white">右肩上がり＝高設定とは限らない</h2>
            <p className="mt-2">
              最もよくある誤解が「グラフが右肩上がり＝高設定」という思い込みです。
              確かに高設定の台は長期的に右肩上がりの傾向を示しやすいですが、
              低設定でも短期間で大きく出玉が伸びることはあります。
            </p>
            <p className="mt-2">
              反対に、高設定の台が朝から凹んでいるケースも日常的に起こります。
              グラフの形だけで設定を判断するのは、統計的に見て根拠が弱い判断方法です。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-white">「波」の読み方の誤解</h2>
            <p className="mt-2">
              「この台はハマりの後に大きく出る波がある」「そろそろ出る時期だ」
              といった考え方は、いわゆる「波理論」と呼ばれることがあります。
              しかし、パチスロの抽選は毎ゲーム独立して行われるため、
              過去の結果が未来の当選に影響を与えることはありません。
            </p>
            <p className="mt-2">
              これは「ギャンブラーの誤謬」として知られる心理的なバイアスです。
              「ハマったから次は出る」という感覚は自然なものですが、
              確率の仕組み上、それは正しくありません。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-white">グラフを「結果の記録」として活用する</h2>
            <p className="mt-2">
              スランプグラフの本来の価値は、「予測」ではなく「記録」にあります。
              たとえば、自分が打った台の出玉推移を振り返ることで、
              どのタイミングで投資が増えたか、ボーナスの引きはどうだったかを客観的に確認できます。
            </p>
            <p className="mt-2">
              スロカスくんでは、入力データからスランプグラフを生成する機能を提供しています。
              「自分の実戦の流れ」を可視化することで、次回の判断材料として活用できます。
              ただし、過去のグラフから未来の挙動を予測できるわけではないことを忘れないでください。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-white">まとめ</h2>
            <p className="mt-2">
              スランプグラフは視覚的にわかりやすい分、過信しやすい情報でもあります。
              グラフだけで判断するのではなく、ボーナス確率・小役カウント・演出など
              他の判断材料と組み合わせて総合的に考えることが大切です。
              グラフは「過去の結果を振り返る道具」として、正しく活用しましょう。
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
