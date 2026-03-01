import Link from "next/link";

export const metadata = {
  title: "コラム一覧 ── パチスロの考え方を整理する | スロカスくん",
  description:
    "パチスロの設定判別・続行判断・確率の考え方など、遊技に役立つ基礎知識をコラム形式で解説しています。",
};

const columns = [
  {
    href: "/column/setting-judgement",
    title: "パチスロの設定判別とは？",
    summary:
      "設定判別の基本的な考え方と、実戦データを使った整理のコツを解説します。",
    date: "2026-01-20",
  },
  {
    href: "/column/what-is-setting",
    title: "パチスロの「設定」とは？ 仕組みと基本を整理する",
    summary:
      "設定1〜6の仕組み、出玉率との関係、判別の前提知識をわかりやすく解説します。",
    date: "2026-02-08",
  },
  {
    href: "/column/continuation-criteria",
    title: "続行 or やめどき？ 判断基準の考え方",
    summary:
      "サンプル数・確率収束の概念をもとに、続行・撤退判断の視点を整理します。",
    date: "2026-02-08",
  },
  {
    href: "/column/how-to-read-probability",
    title: "確率の読み方入門 ── ボーナス確率表の見方",
    summary:
      "合算確率と単独確率の違い、分母によるブレの大きさなど、確率表の基本を解説します。",
    date: "2026-02-08",
  },
  {
    href: "/column/slump-graph-basics",
    title: "スランプグラフの見方と注意点",
    summary:
      "「右肩上がり＝高設定」とは限らない理由、グラフの正しい活用法を解説します。",
    date: "2026-02-08",
  },
  {
    href: "/column/record-keeping",
    title: "収支管理の意味 ── 記録をつけるメリットと方法",
    summary:
      "収支記録で感覚のズレに気づける利点、記録すべき項目、振り返りのコツを解説します。",
    date: "2026-02-08",
  },
];

export default function ColumnIndexPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-4">
      <nav aria-label="パンくず" className="text-xs text-muted">
        <Link href="/" className="underline underline-offset-2 hover:text-white transition">トップ</Link>
        <span className="mx-1">/</span>
        <span className="text-white/80">コラム一覧</span>
      </nav>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm">
        <h1 className="text-lg font-bold text-white">コラム一覧</h1>
        <p className="mt-2 text-sm text-muted">
          パチスロの基礎知識・考え方を、娯楽・参考情報として整理しています。
          遊技に関する最終判断はご自身の責任で行ってください。
        </p>

        <div className="mt-5 space-y-4">
          {columns.map((col) => (
            <Link
              key={col.href}
              href={col.href}
              className="block rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.07]"
            >
              <p className="text-base font-semibold text-white">
                {col.title}
              </p>
              <p className="mt-1 text-sm text-muted">{col.summary}</p>
              <p className="mt-2 text-xs text-white/30">{col.date}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="pt-1">
        <Link
          href="/"
          className="text-sm text-muted underline underline-offset-2 hover:text-white transition"
        >
          ← トップへ戻る
        </Link>
      </div>
    </main>
  );
}
