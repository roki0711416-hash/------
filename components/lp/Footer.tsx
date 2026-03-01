import Link from "next/link";

/**
 * LP専用フッター（免責 + リンク）。
 * グローバルフッターとは別に LP 内に表示。
 */
export default function LpFooter() {
  return (
    <section className="relative border-t border-white/5 py-10">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <nav
          aria-label="LP補足リンク"
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm"
        >
          <Link
            href="/privacy"
            className="text-white/40 underline underline-offset-2 transition hover:text-white/60"
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/contact"
            className="text-white/40 underline underline-offset-2 transition hover:text-white/60"
          >
            お問い合わせ / サポート
          </Link>
          <Link
            href="/terms"
            className="text-white/40 underline underline-offset-2 transition hover:text-white/60"
          >
            利用規約
          </Link>
        </nav>

        <p className="mt-6 text-center text-[10px] leading-relaxed text-white/30">
          ※ 本ページ・本サービスは公開情報等を基にした独自集計の参考情報であり、
          設定判別やホール分析の結果を保証するものではありません。
          遊技に関する最終的な判断はご自身の責任で行ってください。
        </p>
        <p className="mt-3 text-center text-xs text-white/30">
          © {new Date().getFullYear()} スロカスくん
        </p>
      </div>
    </section>
  );
}
