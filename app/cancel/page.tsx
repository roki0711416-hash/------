import Link from "next/link";

export const metadata = {
  title: "解約方法 | スロット設定判別ツール",
};

export default function CancelHowToPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h1 className="text-lg font-semibold">解約方法</h1>

        <div className="mt-4 space-y-4 text-sm text-neutral-700">
          <div>
            <h2 className="font-semibold">手順</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                <Link href="/account" className="underline underline-offset-2">
                  アカウント
                </Link>
                を開きます。
              </li>
              <li>
                「解約・プラン管理」ボタンを押して、Stripeの管理画面（お支払いポータル）へ移動します。
              </li>
              <li>Stripeの画面でサブスクリプションをキャンセルしてください。</li>
            </ol>
            <p className="mt-2 text-xs text-neutral-500">
              ※未ログインの場合は、
              <Link href="/login" className="underline underline-offset-2">
                ログイン
              </Link>
              が必要です。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">解約後の扱い</h2>
            <p className="mt-2">
              解約手続きが完了すると、次回更新日以降は有料会員向け機能をご利用いただけなくなります。
              すでにお支払い済みの料金については、日割り・返金は行いません。
            </p>
          </div>

          <div>
            <h2 className="font-semibold">うまく解約できない場合</h2>
            <p className="mt-2">
              「解約・プラン管理」ボタンが押せない／Stripeの画面に移動できない等の場合は、
              <Link href="/contact" className="underline underline-offset-2">
                お問い合わせ
              </Link>
              からご連絡ください。
            </p>
          </div>

          <p className="text-xs text-neutral-500">最終更新日：2026年1月15日</p>
        </div>
      </section>
    </main>
  );
}
