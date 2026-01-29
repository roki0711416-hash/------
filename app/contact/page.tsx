import Link from "next/link";

export const metadata = {
  title: "お問い合わせ | スロット設定判別ツール",
};

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-4">
      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h1 className="text-lg font-semibold">お問い合わせ</h1>
        <p className="mt-3 text-sm text-neutral-700">
          ご意見・不具合報告・掲載内容の修正依頼は、下記よりご連絡ください。
        </p>

        <div className="mt-5">
          <a
            href="mailto:contact@example.com?subject=%E3%80%90%E3%82%B9%E3%83%AD%E3%82%AB%E3%82%B9%E3%81%8F%E3%82%93%E3%80%91%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B"
            className="flex items-center justify-between rounded-xl bg-neutral-900 px-5 py-4 text-base font-semibold text-white"
          >
            <span>問い合わせフォーム（メール）を開く</span>
            <span aria-hidden className="text-xl leading-none">
              →
            </span>
          </a>
        </div>

        <p className="mt-4 text-xs text-neutral-600">
          ※現在、連絡先メールは仮の表示です（運用に合わせて差し替えてください）。
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="text-sm text-neutral-700 underline underline-offset-2"
          >
            ← トップへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
