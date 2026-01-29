import Link from "next/link";

export const metadata = {
  title: "パチスロの設定判別とは？ | スロカスくん",
  description:
    "パチスロの設定判別の基本的な考え方と、実戦データを使った整理のコツを解説します。",
};

export default function SettingJudgementColumnPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-4">
      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h1 className="text-lg font-semibold">パチスロの設定判別とは？</h1>

        <div className="mt-4 space-y-4 text-sm leading-7 text-neutral-700">
          <p>
            パチスロの「設定判別」とは、台に設定されている設定（例：1〜6）を、
            実戦中に集めた情報から推測していく考え方です。設定が高いほど出玉性能が優遇されやすい、
            という前提があるため、設定を推測できれば「続行するか・移動するか」の判断材料になります。
          </p>

          <p>
            判別に使われる情報は、ボーナス確率や初当たり、終了画面・示唆演出など機種によってさまざまです。
            ただし、単体の要素だけで結論を出すのは難しく、複数の要素を組み合わせて「総合的に」見るのが基本です。
            さらに、サンプルが少ない状態ではブレも大きいので、時間経過とともに見直していく姿勢が重要になります。
          </p>

          <p>
            よくある失敗は、都合の良い情報だけを拾ってしまうことです。
            たとえば「良い挙動が出たから高設定だ」と決め打ちすると、悪いデータが出た時に修正が遅れます。
            反対に、悪い要素が出ても“たまたま”と片付けてしまうと、撤退判断が鈍くなります。
            だからこそ、集めた要素を一度テーブルに並べて、根拠を整理し直す工程が効いてきます。
          </p>

          <p>
            スロカスくんの設定判別ツールでは、実戦データを入力して、判断材料を見える形にまとめられます。
            「今の根拠は何か」「弱い要素はどれか」を落ち着いて確認できるので、続行判断のブレを減らす助けになります。
          </p>

          <p>
            設定判別ツールで入力して試せます：
            <Link href="/judge" className="underline underline-offset-2">
              設定判別ツールへ
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
