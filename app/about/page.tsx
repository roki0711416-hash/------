import Link from "next/link";

export const metadata = {
  title: "運営情報 | スロカスくん（スロット設定判別ツール）",
  description:
    "スロカスくんの運営情報ページです。サイトの目的・運営者情報・運営方針・連絡先をまとめています。",
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-4">
      <nav aria-label="パンくず" className="text-xs text-muted">
        <Link href="/" className="underline underline-offset-2 hover:text-white transition">トップ</Link>
        <span className="mx-1">/</span>
        <span className="text-white/80">運営情報</span>
      </nav>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm">
        <h1 className="text-lg font-bold text-white">運営情報</h1>

        <div className="mt-4 space-y-5 text-sm text-muted">
          <div>
            <h2 className="font-semibold text-white">サイトの目的</h2>
            <p className="mt-2">
              「スロカスくん」は、パチスロの設定判別や続行判断を「感覚」だけで行うのではなく、
              実戦データを入力・整理して根拠ある判断材料にまとめるための分析補助ツールです。
            </p>
            <p className="mt-2">
              設定示唆が出ず判断に迷う場面で、できるだけ客観的に状況を整理し、
              冷静な判断を助けることを目的としています。
            </p>
            <p className="mt-2">
              なお、本サイトが提供するのはあくまで「判断材料の整理」であり、
              遊技の勝敗・収支・実際の設定を保証するものではありません。
              最終的な判断はご自身の責任で行ってください。
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-white">開設の経緯</h2>
            <p className="mt-2">
              運営者自身がパチスロを遊技する中で、設定示唆が出ない状況での
              「打ち続けるべきか、やめるべきか」という判断に不安を感じた経験がきっかけです。
              「手元のデータを整理して、少しでも根拠のある判断をしたい」という
              個人的な課題を解決するために開発を始め、同じ悩みを持つ方にも
              活用いただけるよう公開に至りました。
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-white">運営方針</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>「確実に勝てる」「必勝」等の煽り表現は使用しません</li>
              <li>提供する情報は娯楽・参考情報であることを常に明示します</li>
              <li>ギャンブル依存を助長するような表現・機能は提供しません</li>
              <li>ユーザーが冷静に判断できるよう、データの整理と可視化に注力します</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-white">技術構成</h2>
            <p className="mt-2">
              Next.js（App Router）を使用したWebアプリケーションとして構築しています。
              決済には Stripe、ホスティングには Vercel を利用しています。
              個人開発のため、不具合やご要望があればお気軽にお問い合わせください。
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-white">運営者</h2>
            <p className="mt-2">ハンドルネーム：三日坊主（個人運営）</p>
          </div>

          <div>
            <h2 className="font-semibold text-white">連絡先</h2>
            <p className="mt-2">
              <Link
                href="/contact"
                className="underline underline-offset-2 hover:text-white transition"
              >
                お問い合わせページ
              </Link>
              よりご連絡ください。
              原則として2営業日以内にご返信いたします。
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-white">関連ページ</h2>
            <ul className="mt-2 space-y-1">
              <li>
                <Link href="/privacy" className="underline underline-offset-2 hover:text-white transition">プライバシーポリシー</Link>
              </li>
              <li>
                <Link href="/terms" className="underline underline-offset-2 hover:text-white transition">利用規約</Link>
              </li>
              <li>
                <Link href="/disclaimer" className="underline underline-offset-2 hover:text-white transition">免責事項</Link>
              </li>
              <li>
                <Link href="/tokusho" className="underline underline-offset-2 hover:text-white transition">特定商取引法に基づく表記</Link>
              </li>
            </ul>
          </div>

          <p className="text-xs text-white/30">最終更新日: 2026-02-08</p>
        </div>
      </section>
    </main>
  );
}
