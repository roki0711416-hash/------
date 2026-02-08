import Link from "next/link";

export const metadata = {
  title: "続行 or やめどき？ 判断基準の考え方 | スロカスくん",
  description:
    "パチスロで「続行するか・やめるか」を判断するための考え方を整理します。サンプル数・確率収束の概念も解説。",
};

export default function ContinuationCriteriaPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-4">
      <nav aria-label="パンくず" className="text-xs text-neutral-500">
        <Link href="/" className="underline underline-offset-2">トップ</Link>
        <span className="mx-1">/</span>
        <Link href="/column" className="underline underline-offset-2">コラム一覧</Link>
        <span className="mx-1">/</span>
        <span>続行 or やめどき？</span>
      </nav>

      <article className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h1 className="text-lg font-semibold">続行 or やめどき？ 判断基準の考え方</h1>
        <p className="mt-1 text-xs text-neutral-500">公開日: 2026-02-08 ／ 最終更新: 2026-02-08</p>

        <div className="mt-5 space-y-5 text-sm leading-7 text-neutral-700">
          <section>
            <h2 className="font-semibold text-neutral-900">「続行するか、やめるか」は最大の悩み</h2>
            <p className="mt-2">
              パチスロの実戦中、最も判断に迷うのが「このまま打ち続けるか、やめるか」という場面です。
              投資がかさんでいるとき、逆に好調なとき、どちらの場面でも判断は揺れがちです。
              ここでは、感情に流されずに考えるための基本的な視点を整理します。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900">サンプル数という考え方</h2>
            <p className="mt-2">
              ボーナス確率や小役確率には「設定差」がありますが、
              それが意味を持つのは、十分な回転数（サンプル数）が確保された場合に限られます。
              たとえば、500ゲームの時点でBIGが3回来たとしても、
              それが高設定の証拠になるかというと、サンプルが少なすぎてほとんど判断材料になりません。
            </p>
            <p className="mt-2">
              一般的には、数千ゲーム以上回した段階で初めて「傾向」が見え始めると言われています。
              ただし、それでも「確定」ではなく「傾向」に過ぎない点は変わりません。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900">確率の収束とは</h2>
            <p className="mt-2">
              「確率は収束する」という言葉を聞いたことがあるかもしれません。
              これは、試行回数が増えるほど、実際の出現率が理論値に近づいていくという統計的な性質です。
              ただし、収束には膨大な試行が必要であり、1日の遊技（数千ゲーム程度）で完全に収束することは稀です。
            </p>
            <p className="mt-2">
              つまり、「今日の結果だけ」で設定を判断しようとすると、大きく外れる可能性があります。
              これが設定判別を難しくしている本質的な理由のひとつです。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900">判断基準を「事前に決めておく」重要性</h2>
            <p className="mt-2">
              続行・撤退の判断で最も危険なのは、打ちながらその場の感情で決めてしまうことです。
              投資が増えると「取り返したい」という心理が働き、冷静な判断ができなくなります。
            </p>
            <p className="mt-2">
              対策として有効なのは、打ち始める前に「何ゲームまでに○○の条件を満たさなければやめる」
              といった基準をあらかじめ決めておくことです。
              基準があれば、感情に引きずられる場面を減らせます。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900">複数要素を組み合わせて判断する</h2>
            <p className="mt-2">
              ひとつの要素（例：BIG確率だけ）で続行・撤退を決めるのは危険です。
              BIG確率が良くてもREG確率が悪い、小役が弱い、演出が出ないなど、
              複数の要素を並べて総合的に判断する姿勢が大切です。
            </p>
            <p className="mt-2">
              スロカスくんの設定判別ツールでは、複数の判断材料を一画面で整理できるため、
              要素の見落としを防ぎやすい設計になっています。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900">まとめ</h2>
            <p className="mt-2">
              「続行 or やめどき」は正解がひとつに定まらない問題ですが、
              判断のプロセスを整理しておくことで、後悔の少ない選択がしやすくなります。
              大切なのは、感覚だけに頼らず、データを根拠に考える習慣を持つことです。
              あくまで娯楽の範囲で、楽しみながら遊技を続けてください。
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
