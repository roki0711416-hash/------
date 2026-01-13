import Link from "next/link";

export const metadata = {
  title: "お問い合わせ | スロット設定判別ツール",
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h1 className="text-lg font-semibold">お問い合わせ</h1>
        <p className="mt-3 text-sm text-neutral-700">
          ご意見・不具合報告・掲載内容の修正依頼は、下記よりご連絡ください。
        </p>

        <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm font-semibold text-neutral-800">連絡先</p>
          <p className="mt-2 text-sm text-neutral-700">
            メール:
            <a
              href="mailto:slokasukun1@gmail.com"
              className="ml-1 font-medium text-neutral-900 underline underline-offset-2"
            >
              slokasukun1@gmail.com
            </a>
          </p>
        </div>

        <p className="mt-4 text-xs text-neutral-600">
          返信までお時間をいただく場合があります。
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
