import Link from "next/link";

export const metadata = {
  title: "お問い合わせ | スロット設定判別ツール",
};

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-4">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm">
        <h1 className="text-lg font-bold text-white">お問い合わせ</h1>
        <p className="mt-3 text-sm text-muted">
          ご意見・不具合報告・掲載内容の修正依頼は、下記よりご連絡ください。
        </p>

        <div className="mt-5">
          <a
            href="mailto:slokasukun1@gmail.com?subject=%E3%80%90%E3%82%B9%E3%83%AD%E3%82%AB%E3%82%B9%E3%81%8F%E3%82%93%E3%80%91%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B"
            className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>問い合わせフォーム（メール）を開く</span>
            <span aria-hidden className="text-xl leading-none">
              →
            </span>
          </a>
        </div>

        <p className="mt-4 text-xs text-muted">
          返信までお時間をいただく場合があります。
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="text-sm text-muted underline underline-offset-2 hover:text-white transition"
          >
            ← トップへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
